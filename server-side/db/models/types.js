const { supabase } = require('../index');

// Get all types
async function getAllTypes() {
  const { data, error } = await supabase
    .from('types')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Get single type by ID
async function getTypeById(id) {
  const { data, error } = await supabase
    .from('types')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// Create type
async function createType(data) {
  const { name, slug, description, image } = data;
  
  const { data: newType, error } = await supabase
    .from('types')
    .insert([{
      name,
      slug: slug || generateSlug(name),
      description: description || '',
      image: image || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return newType;
}

// Update type
async function updateType(id, data) {
  const { name, slug, description, image } = data;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (image !== undefined) updates.image = image;
  
  const { data: updatedType, error } = await supabase
    .from('types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return updatedType;
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
