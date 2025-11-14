const db = require('../index');

// Get all attractions with related data
async function getAllAttractions(filters = {}) {
  let query = `
    SELECT a.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
    FROM attractions a
    LEFT JOIN attraction_categories ac ON a.id = ac.attraction_id
    LEFT JOIN categories c ON ac.category_id = c.id
    LEFT JOIN attraction_types at ON a.id = at.attraction_id
    LEFT JOIN types t ON at.type_id = t.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (filters.featured !== undefined) {
    query += ` AND a.featured_location = $${paramCount}`;
    params.push(filters.featured);
    paramCount++;
  }
  
  if (filters.search) {
    query += ` AND (a.name ILIKE $${paramCount} OR a.slug ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }
  
  query += ` GROUP BY a.id ORDER BY a.name ASC`;
  
  const result = await db.query(query, params);
  return result.rows;
}

// Get single attraction by ID
async function getAttractionById(id) {
  const result = await db.query(
    `SELECT a.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
     FROM attractions a
     LEFT JOIN attraction_categories ac ON a.id = ac.attraction_id
     LEFT JOIN categories c ON ac.category_id = c.id
     LEFT JOIN attraction_types at ON a.id = at.attraction_id
     LEFT JOIN types t ON at.type_id = t.id
     WHERE a.id = $1
     GROUP BY a.id`,
    [id]
  );
  return result.rows[0];
}

// Create attraction
async function createAttraction(data) {
  const {
    name, slug, description, address, location,
    featured_location, media,
    category_ids = [], type_ids = []
  } = data;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert attraction
    const result = await client.query(
      `INSERT INTO attractions 
       (name, slug, description, address, location, featured_location, media)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        slug || generateSlug(name),
        description || '',
        address || '',
        location || '',
        featured_location || false,
        media ? JSON.stringify(media) : null
      ]
    );
    
    const attraction = result.rows[0];
    
    // Insert categories
    if (category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO attraction_categories (attraction_id, category_id) VALUES ($1, $2)',
          [attraction.id, categoryId]
        );
      }
    }
    
    // Insert types
    if (type_ids.length > 0) {
      for (const typeId of type_ids) {
        await client.query(
          'INSERT INTO attraction_types (attraction_id, type_id) VALUES ($1, $2)',
          [attraction.id, typeId]
        );
      }
    }
    
    await client.query('COMMIT');
    return await getAttractionById(attraction.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Update attraction
async function updateAttraction(id, data) {
  const {
    name, slug, description, address, location,
    featured_location, media,
    category_ids, type_ids
  } = data;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update attraction
    await client.query(
      `UPDATE attractions 
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           address = COALESCE($4, address),
           location = COALESCE($5, location),
           featured_location = COALESCE($6, featured_location),
           media = COALESCE($7, media),
           updated_at = NOW()
       WHERE id = $8`,
      [
        name, slug, description, address, location,
        featured_location,
        media ? JSON.stringify(media) : undefined,
        id
      ]
    );
    
    // Update categories if provided
    if (category_ids !== undefined) {
      await client.query('DELETE FROM attraction_categories WHERE attraction_id = $1', [id]);
      if (category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO attraction_categories (attraction_id, category_id) VALUES ($1, $2)',
            [id, categoryId]
          );
        }
      }
    }
    
    // Update types if provided
    if (type_ids !== undefined) {
      await client.query('DELETE FROM attraction_types WHERE attraction_id = $1', [id]);
      if (type_ids.length > 0) {
        for (const typeId of type_ids) {
          await client.query(
            'INSERT INTO attraction_types (attraction_id, type_id) VALUES ($1, $2)',
            [id, typeId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    return await getAttractionById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Delete attraction
async function deleteAttraction(id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM attraction_categories WHERE attraction_id = $1', [id]);
    await client.query('DELETE FROM attraction_types WHERE attraction_id = $1', [id]);
    await client.query('DELETE FROM attractions WHERE id = $1', [id]);
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
  getAllAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction
};
