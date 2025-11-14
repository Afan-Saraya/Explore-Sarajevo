const db = require('../index');

// Get all businesses with related data
async function getAllBusinesses(filters = {}) {
  let query = `
    SELECT b.*, br.name as brand_name,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
    FROM businesses b
    LEFT JOIN brands br ON b.brand_id = br.id
    LEFT JOIN business_categories bc ON b.id = bc.business_id
    LEFT JOIN categories c ON bc.category_id = c.id
    LEFT JOIN business_types bt ON b.id = bt.business_id
    LEFT JOIN types t ON bt.type_id = t.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (filters.brand_id) {
    query += ` AND b.brand_id = $${paramCount}`;
    params.push(filters.brand_id);
    paramCount++;
  }
  
  if (filters.featured !== undefined) {
    query += ` AND b.featured_business = $${paramCount}`;
    params.push(filters.featured);
    paramCount++;
  }
  
  if (filters.search) {
    query += ` AND (b.name ILIKE $${paramCount} OR b.slug ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }
  
  query += ` GROUP BY b.id, br.name ORDER BY b.name ASC`;
  
  const result = await db.query(query, params);
  return result.rows;
}

// Get single business by ID
async function getBusinessById(id) {
  const result = await db.query(
    `SELECT b.*, br.name as brand_name,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) 
        FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
        FILTER (WHERE t.id IS NOT NULL), '[]') as types
     FROM businesses b
     LEFT JOIN brands br ON b.brand_id = br.id
     LEFT JOIN business_categories bc ON b.id = bc.business_id
     LEFT JOIN categories c ON bc.category_id = c.id
     LEFT JOIN business_types bt ON b.id = bt.business_id
     LEFT JOIN types t ON bt.type_id = t.id
     WHERE b.id = $1
     GROUP BY b.id, br.name`,
    [id]
  );
  return result.rows[0];
}

// Create business
async function createBusiness(data) {
  const {
    name, slug, brand_id, description, address, location,
    rating, working_hours, featured_business, telephone, website, media,
    category_ids = [], type_ids = []
  } = data;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert business
    const result = await client.query(
      `INSERT INTO businesses 
       (name, slug, brand_id, description, address, location, rating, working_hours,
        featured_business, telephone, website, media)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name,
        slug || generateSlug(name),
        brand_id || null,
        description || '',
        address || '',
        location || '',
        rating || null,
        working_hours || null,
        featured_business || false,
        telephone || null,
        website || null,
        media ? JSON.stringify(media) : null
      ]
    );
    
    const business = result.rows[0];
    
    // Insert categories
    if (category_ids.length > 0) {
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO business_categories (business_id, category_id) VALUES ($1, $2)',
          [business.id, categoryId]
        );
      }
    }
    
    // Insert types
    if (type_ids.length > 0) {
      for (const typeId of type_ids) {
        await client.query(
          'INSERT INTO business_types (business_id, type_id) VALUES ($1, $2)',
          [business.id, typeId]
        );
      }
    }
    
    await client.query('COMMIT');
    return await getBusinessById(business.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Update business
async function updateBusiness(id, data) {
  const {
    name, slug, brand_id, description, address, location,
    rating, working_hours, featured_business, telephone, website, media,
    category_ids, type_ids
  } = data;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update business
    await client.query(
      `UPDATE businesses 
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           brand_id = COALESCE($3, brand_id),
           description = COALESCE($4, description),
           address = COALESCE($5, address),
           location = COALESCE($6, location),
           rating = COALESCE($7, rating),
           working_hours = COALESCE($8, working_hours),
           featured_business = COALESCE($9, featured_business),
           telephone = COALESCE($10, telephone),
           website = COALESCE($11, website),
           media = COALESCE($12, media),
           updated_at = NOW()
       WHERE id = $13`,
      [
        name, slug, brand_id, description, address, location,
        rating, working_hours, featured_business, telephone, website,
        media ? JSON.stringify(media) : undefined,
        id
      ]
    );
    
    // Update categories if provided
    if (category_ids !== undefined) {
      await client.query('DELETE FROM business_categories WHERE business_id = $1', [id]);
      if (category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO business_categories (business_id, category_id) VALUES ($1, $2)',
            [id, categoryId]
          );
        }
      }
    }
    
    // Update types if provided
    if (type_ids !== undefined) {
      await client.query('DELETE FROM business_types WHERE business_id = $1', [id]);
      if (type_ids.length > 0) {
        for (const typeId of type_ids) {
          await client.query(
            'INSERT INTO business_types (business_id, type_id) VALUES ($1, $2)',
            [id, typeId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    return await getBusinessById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Delete business
async function deleteBusiness(id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM business_categories WHERE business_id = $1', [id]);
    await client.query('DELETE FROM business_types WHERE business_id = $1', [id]);
    await client.query('DELETE FROM businesses WHERE id = $1', [id]);
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
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness
};
