const db = require('../index');

// Get all events with related data
async function getAllEvents(filters = {}) {
  let query = `
    SELECT e.*,
      LOWER(e.date_range) as start_date,
      UPPER(e.date_range) as end_date,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
    FROM events e
    LEFT JOIN event_categories ec ON e.id = ec.event_id
    LEFT JOIN categories c ON ec.category_id = c.id
    LEFT JOIN event_types et ON e.id = et.event_id
    LEFT JOIN types t ON et.type_id = t.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (filters.status) {
    query += ` AND e.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }
  
  if (filters.search) {
    query += ` AND (e.name ILIKE $${paramCount} OR e.slug ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }
  
  query += ` GROUP BY e.id ORDER BY e.date_range DESC NULLS LAST, e.name ASC`;
  
  const result = await db.query(query, params);
  return result.rows;
}

// Get single event by ID
async function getEventById(id) {
  const result = await db.query(
    `SELECT e.*,
      LOWER(e.date_range) as start_date,
      UPPER(e.date_range) as end_date,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
     FROM events e
     LEFT JOIN event_categories ec ON e.id = ec.event_id
     LEFT JOIN categories c ON ec.category_id = c.id
     LEFT JOIN event_types et ON e.id = et.event_id
     LEFT JOIN types t ON et.type_id = t.id
     WHERE e.id = $1
     GROUP BY e.id`,
    [id]
  );
  return result.rows[0];
}

// Create event
async function createEvent(data) {
  const {
    name, slug, description, status, media,
    start_date, end_date, show_date_range,
    category_ids = [], type_ids = []
  } = data;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Build date range if dates provided
    let dateRange = null;
    if (start_date && end_date) {
      dateRange = `[${start_date},${end_date}]`;
    } else if (start_date) {
      dateRange = `[${start_date},)`;
    }
    
    // Insert event
    const result = await client.query(
      `INSERT INTO events 
       (name, slug, description, status, media, date_range, show_date_range)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        slug || generateSlug(name),
        description || '',
        status || 'draft',
        media ? JSON.stringify(media) : null,
        dateRange,
        show_date_range !== undefined ? show_date_range : true
      ]
    );
    
    const event = result.rows[0];
    
    // Insert categories
    if (category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)',
          [event.id, categoryId]
        );
      }
    }
    
    // Insert types
    if (type_ids.length > 0) {
      for (const typeId of type_ids) {
        await client.query(
          'INSERT INTO event_types (event_id, type_id) VALUES ($1, $2)',
          [event.id, typeId]
        );
      }
    }
    
    await client.query('COMMIT');
    return await getEventById(event.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Update event
async function updateEvent(id, data) {
  const {
    name, slug, description, status, media,
    start_date, end_date, show_date_range,
    category_ids, type_ids
  } = data;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Build date range if dates provided
    let dateRange = undefined;
    if (start_date !== undefined || end_date !== undefined) {
      if (start_date && end_date) {
        dateRange = `[${start_date},${end_date}]`;
      } else if (start_date) {
        dateRange = `[${start_date},)`;
      } else {
        dateRange = null;
      }
    }
    
    // Update event
    await client.query(
      `UPDATE events 
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           status = COALESCE($4, status),
           media = COALESCE($5, media),
           date_range = COALESCE($6, date_range),
           show_date_range = COALESCE($7, show_date_range),
           updated_at = NOW()
       WHERE id = $8`,
      [
        name, slug, description, status,
        media ? JSON.stringify(media) : undefined,
        dateRange,
        show_date_range,
        id
      ]
    );
    
    // Update categories if provided
    if (category_ids !== undefined) {
      await client.query('DELETE FROM event_categories WHERE event_id = $1', [id]);
      if (category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)',
            [id, categoryId]
          );
        }
      }
    }
    
    // Update types if provided
    if (type_ids !== undefined) {
      await client.query('DELETE FROM event_types WHERE event_id = $1', [id]);
      if (type_ids.length > 0) {
        for (const typeId of type_ids) {
          await client.query(
            'INSERT INTO event_types (event_id, type_id) VALUES ($1, $2)',
            [id, typeId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    return await getEventById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Delete event (and cascade to sub-events)
async function deleteEvent(id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Delete sub-events first (and their relationships)
    const subEvents = await client.query('SELECT id FROM sub_events WHERE event_id = $1', [id]);
    for (const subEvent of subEvents.rows) {
      await client.query('DELETE FROM sub_event_categories WHERE sub_event_id = $1', [subEvent.id]);
      await client.query('DELETE FROM sub_event_types WHERE sub_event_id = $1', [subEvent.id]);
    }
    await client.query('DELETE FROM sub_events WHERE event_id = $1', [id]);
    
    // Delete event relationships
    await client.query('DELETE FROM event_categories WHERE event_id = $1', [id]);
    await client.query('DELETE FROM event_types WHERE event_id = $1', [id]);
    
    // Delete event
    await client.query('DELETE FROM events WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Helper: generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
