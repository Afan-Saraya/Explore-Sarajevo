const { supabase } = require('../index');

// Get all types
async function getAllTypes(filters = {}) {
  let query = supabase
    .from('types')
    .select('*, category:categories!types_category_id_fkey(id, name, slug)')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
  
  // Filter by category_id if provided
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data || []).map(type => ({
    ...type,
    category_name: type.category?.name || null,
    category_slug: type.category?.slug || null
  }));
}

// Get single type by ID
async function getTypeById(id) {
  const { data, error } = await supabase
    .from('types')
    .select('*, category:categories!types_category_id_fkey(id, name, slug)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return {
    ...data,
    category_name: data.category?.name || null,
    category_slug: data.category?.slug || null
  };
}

// Create type
async function createType(data) {
  const { name, slug, description, image, category_id } = data;
  
  const { data: newType, error } = await supabase
    .from('types')
    .insert([{
      name,
      slug: slug || generateSlug(name),
      description: description || '',
      image: image || null,
      category_id: category_id || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return await getTypeById(newType.id);
}

// Update type
async function updateType(id, data) {
  const { name, slug, description, image, category_id } = data;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (image !== undefined) updates.image = image;
  if (category_id !== undefined) updates.category_id = category_id;
  
  const { error } = await supabase
    .from('types')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
  return await getTypeById(id);
}

// Delete type
async function deleteType(id) {
  const { error } = await supabase
    .from('types')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Get usage count
async function getTypeUsageCount(id) {
  const [businessTypes, attractionTypes, eventTypes, subEventTypes] = await Promise.all([
    supabase.from('business_types').select('*', { count: 'exact', head: true }).eq('type_id', id),
    supabase.from('attraction_types').select('*', { count: 'exact', head: true }).eq('type_id', id),
    supabase.from('event_types').select('*', { count: 'exact', head: true }).eq('type_id', id),
    supabase.from('sub_event_types').select('*', { count: 'exact', head: true }).eq('type_id', id)
  ]);
  
  const usageCount = 
    (businessTypes.count || 0) +
    (attractionTypes.count || 0) +
    (eventTypes.count || 0) +
    (subEventTypes.count || 0);
  
  return usageCount;
}

// Reorder types
async function reorderTypes(orderedIds) {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from('types')
        .update({ display_order: i })
        .eq('id', orderedIds[i]);
      
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Reorder types error:', error);
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
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  getTypeUsageCount,
  reorderTypes
};
