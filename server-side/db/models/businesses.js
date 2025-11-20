const { supabase } = require('../index');

// Get all businesses with related data
async function getAllBusinesses(filters = {}) {
  let query = supabase
    .from('businesses')
    .select(`
      *,
      brand:brands(id, name, slug),
      business_categories(category:categories(id, name), is_highlight, is_premium),
      business_types(type:types(id, name), is_highlight, is_premium),
      section_businesses(section:sections(id, name, slug), is_highlight, is_premium)
    `)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
  
  if (filters.brand_id) {
    query = query.eq('brand_id', filters.brand_id);
  }
  
  if (filters.featured !== undefined) {
    query = query.eq('featured_business', filters.featured);
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }
  
  // Filter by section_id if provided
  if (filters.section_id) {
    query = query.eq('section_businesses.section_id', filters.section_id);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform data to match expected format
  return (data || []).map(business => ({
    ...business,
    brand_name: business.brand?.name || null,
    brand_slug: business.brand?.slug || null,
    categories: business.business_categories?.map(bc => ({
      ...bc.category,
      is_highlight: bc.is_highlight || false,
      is_premium: bc.is_premium || false
    })).filter(c => c.id) || [],
    types: business.business_types?.map(bt => ({
      ...bt.type,
      is_highlight: bt.is_highlight || false,
      is_premium: bt.is_premium || false
    })).filter(t => t.id) || [],
    sections: business.section_businesses?.map(sb => ({
      ...sb.section,
      is_highlight: sb.is_highlight || false,
      is_premium: sb.is_premium || false
    })).filter(s => s.id) || [],
    category_ids: business.business_categories?.map(bc => bc.category?.id).filter(Boolean) || [],
    type_ids: business.business_types?.map(bt => bt.type?.id).filter(Boolean) || [],
    section_ids: business.section_businesses?.map(sb => sb.section?.id).filter(Boolean) || []
  }));
}

// Get single business by ID
async function getBusinessById(id) {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      brand:brands(id, name, slug),
      business_categories(category:categories(id, name), is_highlight, is_premium),
      business_types(type:types(id, name), is_highlight, is_premium),
      section_businesses(section:sections(id, name, slug), is_highlight, is_premium)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  // Transform data to match expected format
  return {
    ...data,
    brand_name: data.brand?.name || null,
    brand_slug: data.brand?.slug || null,
    categories: data.business_categories?.map(bc => ({
      ...bc.category,
      is_highlight: bc.is_highlight || false,
      is_premium: bc.is_premium || false
    })).filter(c => c.id) || [],
    types: data.business_types?.map(bt => ({
      ...bt.type,
      is_highlight: bt.is_highlight || false,
      is_premium: bt.is_premium || false
    })).filter(t => t.id) || [],
    sections: data.section_businesses?.map(sb => ({
      ...sb.section,
      is_highlight: sb.is_highlight || false,
      is_premium: sb.is_premium || false
    })).filter(s => s.id) || [],
    category_ids: data.business_categories?.map(bc => bc.category?.id).filter(Boolean) || [],
    type_ids: data.business_types?.map(bt => bt.type?.id).filter(Boolean) || [],
    section_ids: data.section_businesses?.map(sb => sb.section?.id).filter(Boolean) || []
  };
}

// Create business
async function createBusiness(data) {
  const {
    name, slug, brand_id, description, address, location,
    rating, working_hours, featured_business, telephone, website, media,
    price_range, email, social_media,
    category_ids = [], type_ids = [], section_ids = []
  } = data;
  
  try {
    // Insert business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert([{
        name,
        slug: slug || generateSlug(name),
        brand_id: brand_id || null,
        description: description || '',
        address: address || '',
        location: location || '',
        rating: rating || null,
        working_hours: working_hours || null,
        featured_business: featured_business || false,
        telephone: telephone || null,
        website: website || null,
        media: media || null,
        price_range: price_range || null,
        email: email || null,
        social_media: social_media || null
      }])
      .select()
      .single();
    
    if (businessError) throw businessError;
    
    // Insert categories (support both old array format and new relationship format)
    const catRels = category_relationships || (category_ids || []).map(id => ({ id, is_highlight: false, is_premium: false }));
    if (catRels.length > 0) {
      const categoryLinks = catRels.map(rel => ({
        business_id: business.id,
        category_id: rel.id,
        is_highlight: rel.is_highlight || false,
        is_premium: rel.is_premium || false
      }));
      
      const { error: catError } = await supabase
        .from('business_categories')
        .insert(categoryLinks);
      
      if (catError) throw catError;
    }
    
    // Insert types (support both old array format and new relationship format)
    const typeRels = type_relationships || (type_ids || []).map(id => ({ id, is_highlight: false, is_premium: false }));
    if (typeRels.length > 0) {
      const typeLinks = typeRels.map(rel => ({
        business_id: business.id,
        type_id: rel.id,
        is_highlight: rel.is_highlight || false,
        is_premium: rel.is_premium || false
      }));
      
      const { error: typeError } = await supabase
        .from('business_types')
        .insert(typeLinks);
      
      if (typeError) throw typeError;
    }
    
    // Insert sections (support both old array format and new relationship format)
    const secRels = section_relationships || (section_ids || []).map(id => ({ id, is_highlight: false, is_premium: false }));
    if (secRels.length > 0) {
      const sectionLinks = secRels.map(rel => ({
        business_id: business.id,
        section_id: rel.id,
        is_highlight: rel.is_highlight || false,
        is_premium: rel.is_premium || false
      }));
      
      const { error: secError } = await supabase
        .from('section_businesses')
        .insert(sectionLinks);
      
      if (secError) throw secError;
    }
    
    return await getBusinessById(business.id);
  } catch (err) {
    throw err;
  }
}

// Update business
async function updateBusiness(id, data) {
  const {
    name, slug, brand_id, description, address, location,
    rating, working_hours, featured_business, telephone, website, media,
    price_range, email, social_media,
    category_ids, type_ids, section_ids,
    category_relationships, type_relationships, section_relationships
  } = data;
  
  try {
    // Build update object with only provided fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (brand_id !== undefined) updates.brand_id = brand_id;
    if (description !== undefined) updates.description = description;
    if (address !== undefined) updates.address = address;
    if (location !== undefined) updates.location = location;
    if (rating !== undefined) updates.rating = rating;
    if (working_hours !== undefined) updates.working_hours = working_hours;
    if (featured_business !== undefined) updates.featured_business = featured_business;
    if (telephone !== undefined) updates.telephone = telephone;
    if (website !== undefined) updates.website = website;
    if (media !== undefined) updates.media = media;
    if (price_range !== undefined) updates.price_range = price_range;
    if (email !== undefined) updates.email = email;
    if (social_media !== undefined) updates.social_media = social_media;
    
    // Update business
    const { error: updateError } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Update categories if provided (support both old and new format)
    const catRels = category_relationships || (category_ids !== undefined ? (category_ids || []).map(id => ({ id, is_highlight: false, is_premium: false })) : undefined);
    if (catRels !== undefined) {
      await supabase.from('business_categories').delete().eq('business_id', id);
      
      if (catRels.length > 0) {
        const categoryLinks = catRels.map(rel => ({
          business_id: id,
          category_id: rel.id,
          is_highlight: rel.is_highlight || false,
          is_premium: rel.is_premium || false
        }));
        
        const { error: catError } = await supabase
          .from('business_categories')
          .insert(categoryLinks);
        
        if (catError) throw catError;
      }
    }
    
    // Update types if provided (support both old and new format)
    const typeRels = type_relationships || (type_ids !== undefined ? (type_ids || []).map(id => ({ id, is_highlight: false, is_premium: false })) : undefined);
    if (typeRels !== undefined) {
      await supabase.from('business_types').delete().eq('business_id', id);
      
      if (typeRels.length > 0) {
        const typeLinks = typeRels.map(rel => ({
          business_id: id,
          type_id: rel.id,
          is_highlight: rel.is_highlight || false,
          is_premium: rel.is_premium || false
        }));
        
        const { error: typeError } = await supabase
          .from('business_types')
          .insert(typeLinks);
        
        if (typeError) throw typeError;
      }
    }
    
    // Update sections if provided (support both old and new format)
    const secRels = section_relationships || (section_ids !== undefined ? (section_ids || []).map(id => ({ id, is_highlight: false, is_premium: false })) : undefined);
    if (secRels !== undefined) {
      await supabase.from('section_businesses').delete().eq('business_id', id);
      
      if (secRels.length > 0) {
        const sectionLinks = secRels.map(rel => ({
          business_id: id,
          section_id: rel.id,
          is_highlight: rel.is_highlight || false,
          is_premium: rel.is_premium || false
        }));
        
        const { error: secError } = await supabase
          .from('section_businesses')
          .insert(sectionLinks);
        
        if (secError) throw secError;
      }
    }
    
    return await getBusinessById(id);
  } catch (err) {
    throw err;
  }
}

// Delete business
async function deleteBusiness(id) {
  try {
    // Delete relationships first (if no CASCADE is set)
    await supabase.from('business_categories').delete().eq('business_id', id);
    await supabase.from('business_types').delete().eq('business_id', id);
    await supabase.from('section_businesses').delete().eq('business_id', id);
    
    // Delete business
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    throw err;
  }
}

// Reorder businesses
async function reorderBusinesses(orderedIds) {
  // Update display_order for each business sequentially to avoid conflicts
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from('businesses')
        .update({ display_order: i })
        .eq('id', orderedIds[i]);
      
      if (error) {
        console.error('Error updating business order:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Reorder businesses error:', error);
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
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  reorderBusinesses
};
