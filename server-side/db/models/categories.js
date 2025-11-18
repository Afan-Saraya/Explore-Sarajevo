const { supabase } = require('../index');

// Get all categories
async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get single category by ID
async function getCategoryById(id) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Create category
async function createCategory(data) {
  const { name, slug, description, image, featured_category } = data;
  
  const { data: category, error } = await supabase
    .from('categories')
    .insert([{
      name,
      slug: slug || generateSlug(name),
      description: description || '',
      image: image || null,
      featured_category: featured_category || false
    }])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return category;
}

// Update category
async function updateCategory(id, data) {
  const { name, slug, description, image, featured_category } = data;
  
  // Build update object with only provided fields
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (featured_category !== undefined) updates.featured_category = featured_category;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (image !== undefined) updates.image = image;
  
  const { data: category, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return category;
}

// Delete category
async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Get usage count (businesses + attractions + events)
async function getCategoryUsageCount(id) {
  const [businessCount, attractionCount, eventCount, subEventCount] = await Promise.all([
    supabase.from('business_categories').select('*', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('attraction_categories').select('*', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('event_categories').select('*', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('sub_event_categories').select('*', { count: 'exact', head: true }).eq('category_id', id)
  ]);
  
  return (businessCount.count || 0) + (attractionCount.count || 0) + (eventCount.count || 0) + (subEventCount.count || 0);
}

// Reorder categories
async function reorderCategories(orderedIds) {
  // Update display_order for each category sequentially to avoid conflicts
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from('categories')
        .update({ display_order: i })
        .eq('id', orderedIds[i]);
      
      if (error) {
        console.error('Error updating category order:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Reorder categories error:', error);
    throw error;
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
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryUsageCount,
  reorderCategories
};
