const db = require('../index');

// Get all categories
async function getAllCategories() {
  const result = await db.query(
    'SELECT * FROM categories ORDER BY name ASC'
  );
  return result.rows;
}

// Get single category by ID
async function getCategoryById(id) {
  const result = await db.query(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Create category
async function createCategory(data) {
  const { name, slug, description, image } = data;
  const result = await db.query(
    `INSERT INTO categories (name, slug, description, image)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, slug || generateSlug(name), description || '', image || null]
  );
  return result.rows[0];
}

// Update category
async function updateCategory(id, data) {
  const { name, slug, description, image } = data;
  const result = await db.query(
    `UPDATE categories 
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

// Delete category
async function deleteCategory(id) {
  await db.query('DELETE FROM categories WHERE id = $1', [id]);
  return true;
}

// Get usage count (businesses + attractions + events)
async function getCategoryUsageCount(id) {
  const result = await db.query(
    `SELECT 
      (SELECT COUNT(*) FROM business_categories WHERE category_id = $1) +
      (SELECT COUNT(*) FROM attraction_categories WHERE category_id = $1) +
      (SELECT COUNT(*) FROM event_categories WHERE category_id = $1) +
      (SELECT COUNT(*) FROM sub_event_categories WHERE category_id = $1) AS usage_count`,
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
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryUsageCount
};
