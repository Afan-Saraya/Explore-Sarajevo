const db = require('../index');

// Get all types
async function getAllTypes() {
  const result = await db.query(
    'SELECT * FROM types ORDER BY name ASC'
  );
  return result.rows;
}

// Get single type by ID
async function getTypeById(id) {
  const result = await db.query(
    'SELECT * FROM types WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Create type
async function createType(data) {
  const { name, slug, description, image } = data;
  const result = await db.query(
    `INSERT INTO types (name, slug, description, image)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, slug || generateSlug(name), description || '', image || null]
  );
  return result.rows[0];
}

// Update type
async function updateType(id, data) {
  const { name, slug, description, image } = data;
  const result = await db.query(
    `UPDATE types 
     SET name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description),
         image = COALESCE($4, image),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name, slug, description, image, id]
  );
  return result.rows[0];
}

// Delete type
async function deleteType(id) {
  await db.query('DELETE FROM types WHERE id = $1', [id]);
  return true;
}

// Get usage count
async function getTypeUsageCount(id) {
  const result = await db.query(
    `SELECT 
      (SELECT COUNT(*) FROM business_types WHERE type_id = $1) +
      (SELECT COUNT(*) FROM attraction_types WHERE type_id = $1) +
      (SELECT COUNT(*) FROM event_types WHERE type_id = $1) +
      (SELECT COUNT(*) FROM sub_event_types WHERE type_id = $1) AS usage_count`,
    [id]
  );
  return result.rows[0].usage_count;
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
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  getTypeUsageCount
};
