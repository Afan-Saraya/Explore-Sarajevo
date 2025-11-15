const { supabase } = require('./index');

function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

async function getAllContent(type) {
  let query = supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (type) {
    query = query.eq('content_type', type);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getContentById(id) {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

async function createContent(item) {
  const id = item.id || generateId();
  
  const { data, error } = await supabase
    .from('content')
    .insert([{
      id,
      content_type: item.contentType,
      name: item.name,
      slug: item.slug,
      description: item.description || null,
      address: item.address || null,
      location: item.location || null,
      category_id: item.categoryId || null,
      parent_category_id: item.parentCategoryId || null,
      brand_id: item.brandId || null,
      phone: item.phone || null,
      website: item.website || null,
      rating: item.rating !== undefined ? item.rating : null,
      working_hours: item.workingHours || null,
      featured_business: item.featuredBusiness === true || item.featuredBusiness === 'true',
      featured_location: item.featuredLocation === true || item.featuredLocation === 'true',
      images: item.images || [],
      data: item.data || {}
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateContent(id, fields) {
  // Build update object with mapped fields
  const updates = {};
  
  for (const key of Object.keys(fields)) {
    if (key === 'images' || key === 'data') {
      updates[key] = fields[key];
    } else if (key === 'featuredBusiness') {
      updates.featured_business = fields[key] === true || fields[key] === 'true';
    } else if (key === 'featuredLocation') {
      updates.featured_location = fields[key] === true || fields[key] === 'true';
    } else {
      // map camelCase to snake_case
      const col = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      updates[col] = fields[key];
    }
  }
  
  if (Object.keys(updates).length === 0) return getContentById(id);
  
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteContent(id) {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

module.exports = { getAllContent, getContentById, createContent, updateContent, deleteContent };
