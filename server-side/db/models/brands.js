const { supabase } = require('../index');

// Get all brands with optional parent brand name
async function getAllBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*, parent_brand:brands!parent_brand_id(id, name)')
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  // Get business counts for each brand
  const brandsWithCounts = await Promise.all(
    data.map(async (brand) => {
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id);
      
      return {
        ...brand,
        parent_brand_name: brand.parent_brand?.name || null,
        business_count: count || 0
      };
    })
  );
  
  return brandsWithCounts;
}

// Get single brand by ID
async function getBrandById(id) {
  const { data, error } = await supabase
    .from('brands')
    .select('*, parent_brand:brands!parent_brand_id(id, name)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    parent_brand_name: data.parent_brand?.name || null
  };
}

// Create brand
async function createBrand(data) {
  const { name, slug, description, media, business_id, parent_brand_id, brand_pdv } = data;
  
  const { data: newBrand, error } = await supabase
    .from('brands')
    .insert([{
      name,
      slug: slug || generateSlug(name),
      description: description || '',
      media: media || null,
      business_id: business_id || null,
      parent_brand_id: parent_brand_id || null,
      brand_pdv: brand_pdv || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return newBrand;
}

// Update brand
async function updateBrand(id, data) {
  const { name, slug, description, media, business_id, parent_brand_id, brand_pdv } = data;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (media !== undefined) updates.media = media;
  if (business_id !== undefined) updates.business_id = business_id;
  if (parent_brand_id !== undefined) updates.parent_brand_id = parent_brand_id;
  if (brand_pdv !== undefined) updates.brand_pdv = brand_pdv;
  
  const { data: updatedBrand, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return updatedBrand;
}

// Delete brand
async function deleteBrand(id) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Search brands by name or slug
async function searchBrands(searchTerm) {
  const { data, error } = await supabase
    .from('brands')
    .select('*, parent_brand:brands!parent_brand_id(id, name)')
    .or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return data.map(brand => ({
    ...brand,
    parent_brand_name: brand.parent_brand?.name || null
  }));
}

// Get brands by parent
async function getBrandsByParent(parentId) {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('parent_brand_id', parentId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
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
