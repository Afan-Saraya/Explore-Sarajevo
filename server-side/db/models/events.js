const { supabase } = require('../index');

// Get all events with related data
async function getAllEvents(filters = {}) {
  let query = supabase
    .from('events')
    .select('*, event_categories(category:categories(id, name)), event_types(type:types(id, name))');
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }
  
  query = query.order('name', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform nested data - note: date_range is a PostgreSQL range type, 
  // Supabase may return it as string, need to parse if needed
  return data.map(event => ({
    ...event,
    categories: event.event_categories.map(ec => ec.category).filter(Boolean),
    event_categories: undefined,
    types: event.event_types.map(et => et.type).filter(Boolean),
    event_types: undefined
  }));
}

// Get single event by ID
async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*, event_categories(category:categories(id, name)), event_types(type:types(id, name))')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    categories: data.event_categories.map(ec => ec.category).filter(Boolean),
    event_categories: undefined,
    types: data.event_types.map(et => et.type).filter(Boolean),
    event_types: undefined
  };
}

// Create event
async function createEvent(data) {
  const {
    name, slug, description, status, media,
    start_date, end_date, show_date_range,
    category_ids = [], type_ids = []
  } = data;
  
  try {
    // Build date range if dates provided (PostgreSQL range type)
    let dateRange = null;
    if (start_date && end_date) {
      dateRange = `[${start_date},${end_date}]`;
    } else if (start_date) {
      dateRange = `[${start_date},)`;
    }
    
    // Insert event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        name,
        slug: slug || generateSlug(name),
        description: description || '',
        status: status || 'draft',
        media: media || null,
        date_range: dateRange,
        show_date_range: show_date_range !== undefined ? show_date_range : true
      }])
      .select()
      .single();
    
    if (eventError) throw eventError;
    
    // Insert categories
    if (category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        event_id: event.id,
        category_id: categoryId
      }));
      
      const { error: catError } = await supabase
        .from('event_categories')
        .insert(categoryLinks);
      
      if (catError) throw catError;
    }
    
    // Insert types
    if (type_ids.length > 0) {
      const typeLinks = type_ids.map(typeId => ({
        event_id: event.id,
        type_id: typeId
      }));
      
      const { error: typeError } = await supabase
        .from('event_types')
        .insert(typeLinks);
      
      if (typeError) throw typeError;
    }
    
    return await getEventById(event.id);
  } catch (err) {
    throw err;
  }
}

// Update event
async function updateEvent(id, data) {
  const {
    name, slug, description, status, media,
    start_date, end_date, show_date_range,
    category_ids, type_ids
  } = data;
  
  try {
    // Build update object
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (media !== undefined) updates.media = media;
    if (show_date_range !== undefined) updates.show_date_range = show_date_range;
    
    // Build date range if dates provided
    if (start_date !== undefined || end_date !== undefined) {
      if (start_date && end_date) {
        updates.date_range = `[${start_date},${end_date}]`;
      } else if (start_date) {
        updates.date_range = `[${start_date},)`;
      } else {
        updates.date_range = null;
      }
    }
    
    // Update event
    const { error: updateError } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Update categories if provided
    if (category_ids !== undefined) {
      await supabase.from('event_categories').delete().eq('event_id', id);
      
      if (category_ids.length > 0) {
        const categoryLinks = category_ids.map(categoryId => ({
          event_id: id,
          category_id: categoryId
        }));
        
        const { error: catError } = await supabase
          .from('event_categories')
          .insert(categoryLinks);
        
        if (catError) throw catError;
      }
    }
    
    // Update types if provided
    if (type_ids !== undefined) {
      await supabase.from('event_types').delete().eq('event_id', id);
      
      if (type_ids.length > 0) {
        const typeLinks = type_ids.map(typeId => ({
          event_id: id,
          type_id: typeId
        }));
        
        const { error: typeError } = await supabase
          .from('event_types')
          .insert(typeLinks);
        
        if (typeError) throw typeError;
      }
    }
    
    return await getEventById(id);
  } catch (err) {
    throw err;
  }
}

// Delete event (and cascade to sub-events)
async function deleteEvent(id) {
  try {
    // Get sub-events to delete their relationships
    const { data: subEvents } = await supabase
      .from('sub_events')
      .select('id')
      .eq('event_id', id);
    
    // Delete sub-event relationships
    if (subEvents && subEvents.length > 0) {
      for (const subEvent of subEvents) {
        await supabase.from('sub_event_categories').delete().eq('sub_event_id', subEvent.id);
        await supabase.from('sub_event_types').delete().eq('sub_event_id', subEvent.id);
      }
    }
    
    // Delete sub-events
    await supabase.from('sub_events').delete().eq('event_id', id);
    
    // Delete event relationships
    await supabase.from('event_categories').delete().eq('event_id', id);
    await supabase.from('event_types').delete().eq('event_id', id);
    
    // Delete event
    const { error } = await supabase
      .from('events')
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
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
