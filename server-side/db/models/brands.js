const db = require('../index');

// Get all brands with optional parent brand name
async function getAllBrands() {
  const result = await db.query(
    `SELECT b.*, pb.name as parent_brand_name,
      (SELECT COUNT(*) FROM businesses WHERE brand_id = b.id) as business_count
     FROM brands b
     LEFT JOIN brands pb ON b.parent_brand_id = pb.id
     ORDER BY b.name ASC`
  );
  return result.rows;
}

// Get single brand by ID
async function getBrandById(id) {
  const result = await db.query(
    `SELECT b.*, pb.name as parent_brand_name
     FROM brands b
     LEFT JOIN brands pb ON b.parent_brand_id = pb.id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0];
}

// Create brand
async function createBrand(data) {
  const { name, slug, description, media, business_id, parent_brand_id, brand_pdv } = data;
  const result = await db.query(
    `INSERT INTO brands (name, slug, description, media, business_id, parent_brand_id, brand_pdv)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      name,
      slug || generateSlug(name),
      description || '',
      media ? JSON.stringify(media) : null,
      business_id || null,
      parent_brand_id || null,
      brand_pdv || null
    ]
  );
  return result.rows[0];
}

// Update brand
async function updateBrand(id, data) {
  const { name, slug, description, media, business_id, parent_brand_id, brand_pdv } = data;
  
  const result = await db.query(
    `UPDATE brands 
     SET name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description),
         media = COALESCE($4, media),
         business_id = COALESCE($5, business_id),
         parent_brand_id = COALESCE($6, parent_brand_id),
         brand_pdv = COALESCE($7, brand_pdv),
         updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      name,
      slug,
      description,
      media ? JSON.stringify(media) : undefined,
      business_id,
      parent_brand_id,
      brand_pdv,
      id
    ]
  );
  return result.rows[0];
}

// Delete brand
async function deleteBrand(id) {
  await db.query('DELETE FROM brands WHERE id = $1', [id]);
  return true;
}

// Search brands by name or slug
async function searchBrands(searchTerm) {
  const result = await db.query(
    `SELECT b.*, pb.name as parent_brand_name
     FROM brands b
     LEFT JOIN brands pb ON b.parent_brand_id = pb.id
     WHERE b.name ILIKE $1 OR b.slug ILIKE $1
     ORDER BY b.name ASC`,
    [`%${searchTerm}%`]
  );
  return result.rows;
}

// Get brands by parent
async function getBrandsByParent(parentId) {
  const result = await db.query(
    'SELECT * FROM brands WHERE parent_brand_id = $1 ORDER BY name ASC',
    [parentId]
  );
  return result.rows;
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
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  searchBrands,
  getBrandsByParent
};
