const db = require('./index');

function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

async function getAllContent(type) {
  if (type) {
    const res = await db.query('SELECT * FROM content WHERE content_type = $1 ORDER BY created_at DESC', [type]);
    return res.rows;
  }
  const res = await db.query('SELECT * FROM content ORDER BY created_at DESC');
  return res.rows;
}

async function getContentById(id) {
  const res = await db.query('SELECT * FROM content WHERE id = $1', [id]);
  return res.rows[0];
}

async function createContent(item) {
  const id = item.id || generateId();
  const sql = `INSERT INTO content (
    id, content_type, name, slug, description, address, location, category_id,
    parent_category_id, brand_id, phone, website, rating, working_hours,
    featured_business, featured_location, images, data
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`;
  const params = [
    id,
    item.contentType,
    item.name,
    item.slug,
    item.description || null,
    item.address || null,
    item.location || null,
    item.categoryId || null,
    item.parentCategoryId || null,
    item.brandId || null,
    item.phone || null,
    item.website || null,
    item.rating !== undefined ? item.rating : null,
    item.workingHours || null,
    item.featuredBusiness === true || item.featuredBusiness === 'true',
    item.featuredLocation === true || item.featuredLocation === 'true',
    JSON.stringify(item.images || []),
    JSON.stringify(item.data || {})
  ];
  const res = await db.query(sql, params);
  return res.rows[0];
}

async function updateContent(id, fields) {
  // Build dynamic SET clause
  const sets = [];
  const params = [];
  let idx = 1;
  for (const key of Object.keys(fields)) {
    if (key === 'images' || key === 'data') {
      sets.push(`${key} = $${idx}`);
      params.push(JSON.stringify(fields[key]));
    } else if (key === 'featuredBusiness' || key === 'featuredLocation') {
      const col = key === 'featuredBusiness' ? 'featured_business' : 'featured_location';
      sets.push(`${col} = $${idx}`);
      params.push(fields[key] === true || fields[key] === 'true');
    } else {
      // map camelCase to snake_case
      const col = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      sets.push(`${col} = $${idx}`);
      params.push(fields[key]);
    }
    idx++;
  }
  if (sets.length === 0) return getContentById(id);
  const sql = `UPDATE content SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
  params.push(id);
  const res = await db.query(sql, params);
  return res.rows[0];
}

async function deleteContent(id) {
  await db.query('DELETE FROM content WHERE id = $1', [id]);
  return true;
}

module.exports = { getAllContent, getContentById, createContent, updateContent, deleteContent };
