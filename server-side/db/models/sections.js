const { supabase } = require('../index');

// Get all sections
async function getAllSections() {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get single section by ID
async function getSectionById(id) {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Get section by slug
async function getSectionBySlug(slug) {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Create section
async function createSection(data) {
  const { name, slug, description, domain, image, is_active, featured } = data;
  
  const { data: section, error } = await supabase
    .from('sections')
    .insert([{
      name,
      slug: slug || generateSlug(name),
      description: description || '',
      domain: domain || null,
      image: image || null,
      is_active: is_active !== undefined ? is_active : true,
      featured: featured !== undefined ? featured : false,
      meta: data.meta || {}
    }])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return section;
}

// Update section
async function updateSection(id, data) {
  const { name, slug, description, domain, image, is_active, featured, meta } = data;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (domain !== undefined) updates.domain = domain;
  if (image !== undefined) updates.image = image;
  if (is_active !== undefined) updates.is_active = is_active;
  if (featured !== undefined) updates.featured = featured;
  if (meta !== undefined) updates.meta = meta;
  
  const { data: section, error } = await supabase
    .from('sections')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return section;
}

// Delete section
async function deleteSection(id) {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Reorder sections
async function reorderSections(orderedIds) {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from('sections')
        .update({ display_order: i })
        .eq('id', orderedIds[i]);
      
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Reorder sections error:', error);
    throw error;
  }
}

// Get section usage count
async function getSectionUsageCount(id) {
  const [businessCount, attractionCount, eventCount] = await Promise.all([
    supabase.from('section_businesses').select('*', { count: 'exact', head: true }).eq('section_id', id),
    supabase.from('section_attractions').select('*', { count: 'exact', head: true }).eq('section_id', id),
    supabase.from('section_events').select('*', { count: 'exact', head: true }).eq('section_id', id)
  ]);
  
  return (businessCount.count || 0) + (attractionCount.count || 0) + (eventCount.count || 0);
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
  getAllSections,
  getSectionById,
  getSectionBySlug,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  getSectionUsageCount
};
