const { supabase } = require('../index');

// Get all attractions with related data
async function getAllAttractions(filters = {}) {
  let query = supabase
    .from('attractions')
    .select('*, attraction_categories(category:categories(id, name)), attraction_types(type:types(id, name))');
  
  if (filters.featured !== undefined) {
    query = query.eq('featured_location', filters.featured);
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }
  
  query = query.order('name', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform nested data to match original format
  return data.map(attraction => ({
    ...attraction,
    categories: attraction.attraction_categories.map(ac => ac.category).filter(Boolean),
    attraction_categories: undefined,
    types: attraction.attraction_types.map(at => at.type).filter(Boolean),
    attraction_types: undefined
  }));
}

// Get single attraction by ID
async function getAttractionById(id) {
  const { data, error } = await supabase
    .from('attractions')
    .select('*, attraction_categories(category:categories(id, name)), attraction_types(type:types(id, name))')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  // Transform nested data
  return {
    ...data,
    categories: data.attraction_categories.map(ac => ac.category).filter(Boolean),
    attraction_categories: undefined,
    types: data.attraction_types.map(at => at.type).filter(Boolean),
    attraction_types: undefined
  };
}

// Create attraction
async function createAttraction(data) {
  const {
    name, slug, description, address, location,
    featured_location, media,
    category_ids = [], type_ids = []
  } = data;
  
  try {
    // Insert attraction
    const { data: attraction, error: attractionError } = await supabase
      .from('attractions')
      .insert([{
        name,
        slug: slug || generateSlug(name),
        description: description || '',
        address: address || '',
        location: location || '',
        featured_location: featured_location || false,
        media: media || null
      }])
      .select()
      .single();
    
    if (attractionError) throw attractionError;
    
    // Insert categories
    if (category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        attraction_id: attraction.id,
        category_id: categoryId
      }));
      
      const { error: catError } = await supabase
        .from('attraction_categories')
        .insert(categoryLinks);
      
      if (catError) throw catError;
    }
    
    // Insert types
    if (type_ids.length > 0) {
      const typeLinks = type_ids.map(typeId => ({
        attraction_id: attraction.id,
        type_id: typeId
      }));
      
      const { error: typeError } = await supabase
        .from('attraction_types')
        .insert(typeLinks);
      
      if (typeError) throw typeError;
    }
    
    return await getAttractionById(attraction.id);
  } catch (err) {
    throw err;
  }
}

// Update attraction
async function updateAttraction(id, data) {
  const {
    name, slug, description, address, location,
    featured_location, media,
    category_ids, type_ids
  } = data;
  
  try {
    // Build update object
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (address !== undefined) updates.address = address;
    if (location !== undefined) updates.location = location;
    if (featured_location !== undefined) updates.featured_location = featured_location;
    if (media !== undefined) updates.media = media;
    
    // Update attraction
    const { error: updateError } = await supabase
      .from('attractions')
      .update(updates)
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Update categories if provided
    if (category_ids !== undefined) {
      await supabase.from('attraction_categories').delete().eq('attraction_id', id);
      
      if (category_ids.length > 0) {
        const categoryLinks = category_ids.map(categoryId => ({
          attraction_id: id,
          category_id: categoryId
        }));
        
        const { error: catError } = await supabase
          .from('attraction_categories')
          .insert(categoryLinks);
        
        if (catError) throw catError;
      }
    }
    
    // Update types if provided
    if (type_ids !== undefined) {
      await supabase.from('attraction_types').delete().eq('attraction_id', id);
      
      if (type_ids.length > 0) {
        const typeLinks = type_ids.map(typeId => ({
          attraction_id: id,
          type_id: typeId
        }));
        
        const { error: typeError } = await supabase
          .from('attraction_types')
          .insert(typeLinks);
        
        if (typeError) throw typeError;
      }
    }
    
    return await getAttractionById(id);
  } catch (err) {
    throw err;
  }
}

// Delete attraction
async function deleteAttraction(id) {
  try {
    await supabase.from('attraction_categories').delete().eq('attraction_id', id);
    await supabase.from('attraction_types').delete().eq('attraction_id', id);
    
    const { error } = await supabase
      .from('attractions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    throw err;
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
  getAllAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction
};
