const db = require('../index');

// Get all sub-events (optionally filtered by event)
async function getAllSubEvents(eventId = null) {
  let query = `
    SELECT se.*,
      e.name as event_name,
      LOWER(se.date_range) as start_date,
      UPPER(se.date_range) as end_date,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
    FROM sub_events se
    LEFT JOIN events e ON se.event_id = e.id
    LEFT JOIN sub_event_categories sec ON se.id = sec.sub_event_id
    LEFT JOIN categories c ON sec.category_id = c.id
    LEFT JOIN sub_event_types set ON se.id = set.sub_event_id
    LEFT JOIN types t ON set.type_id = t.id
  `;
  
  const params = [];
  if (eventId) {
    query += ` WHERE se.event_id = $1`;
    params.push(eventId);
  }
  
  query += ` GROUP BY se.id, e.name ORDER BY se.date_range DESC NULLS LAST`;
  
  const result = await db.query(query, params);
  return result.rows;
}

// Get single sub-event by ID
async function getSubEventById(id) {
  const result = await db.query(
    `SELECT se.*,
      e.name as event_name,
      LOWER(se.date_range) as start_date,
      UPPER(se.date_range) as end_date,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
     FROM sub_events se
     LEFT JOIN events e ON se.event_id = e.id
     LEFT JOIN sub_event_categories sec ON se.id = sec.sub_event_id
     LEFT JOIN categories c ON sec.category_id = c.id
     LEFT JOIN sub_event_types set ON se.id = set.sub_event_id
     LEFT JOIN types t ON set.type_id = t.id
     WHERE se.id = $1
     GROUP BY se.id, e.name`,
    [id]
  );
  return result.rows[0];
}

// Create sub-event
async function createSubEvent(data) {
  const {
    event_id, description, media, status, show_event,
    start_date, end_date,
    category_ids = [], type_ids = []
  } = data;
  
  if (!event_id) {
    throw new Error('event_id is required for sub-events');
  }
  
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
    
    // Insert sub-event
    const result = await client.query(
      `INSERT INTO sub_events 
       (event_id, description, media, date_range, status, show_event)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        event_id,
        description || '',
        media ? JSON.stringify(media) : null,
        dateRange,
        status || 'draft',
        show_event !== undefined ? show_event : true
      ]
    );
    
    const subEvent = result.rows[0];
    
    // Insert categories
    if (category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO sub_event_categories (sub_event_id, category_id) VALUES ($1, $2)',
          [subEvent.id, categoryId]
        );
      }
    }
    
    // Insert types
    if (type_ids.length > 0) {
      for (const typeId of type_ids) {
        await client.query(
          'INSERT INTO sub_event_types (sub_event_id, type_id) VALUES ($1, $2)',
          [subEvent.id, typeId]
        );
      }
    }
    
    await client.query('COMMIT');
    return await getSubEventById(subEvent.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Update sub-event
async function updateSubEvent(id, data) {
  const {
    description, media, status, show_event,
    start_date, end_date,
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
    
    // Update sub-event
    await client.query(
      `UPDATE sub_events 
       SET description = COALESCE($1, description),
           media = COALESCE($2, media),
           date_range = COALESCE($3, date_range),
           status = COALESCE($4, status),
           show_event = COALESCE($5, show_event),
           updated_at = NOW()
       WHERE id = $6`,
      [
        description,
        media ? JSON.stringify(media) : undefined,
        dateRange,
        status,
        show_event,
        id
      ]
    );
    
    // Update categories if provided
    if (category_ids !== undefined) {
      await client.query('DELETE FROM sub_event_categories WHERE sub_event_id = $1', [id]);
      if (category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO sub_event_categories (sub_event_id, category_id) VALUES ($1, $2)',
            [id, categoryId]
          );
        }
      }
    }
    
    // Update types if provided
    if (type_ids !== undefined) {
      await client.query('DELETE FROM sub_event_types WHERE sub_event_id = $1', [id]);
      if (type_ids.length > 0) {
        for (const typeId of type_ids) {
          await client.query(
            'INSERT INTO sub_event_types (sub_event_id, type_id) VALUES ($1, $2)',
            [id, typeId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    return await getSubEventById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Delete sub-event
async function deleteSubEvent(id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM sub_event_categories WHERE sub_event_id = $1', [id]);
    await client.query('DELETE FROM sub_event_types WHERE sub_event_id = $1', [id]);
    await client.query('DELETE FROM sub_events WHERE id = $1', [id]);
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllSubEvents,
  getSubEventById,
  createSubEvent,
  updateSubEvent,
  deleteSubEvent
};
