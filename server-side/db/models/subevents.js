const { supabase } = require('../index');

// Get all sub-events (optionally filtered by event)
async function getAllSubEvents(eventId = null) {
  let query = supabase
    .from('sub_events')
    .select('*, event:events(id, name), sub_event_categories(category:categories(id, name)), sub_event_types(type:types(id, name))');
  
  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform nested data
  return data.map(subEvent => ({
    ...subEvent,
    event_name: subEvent.event?.name || null,
    event: undefined,
    categories: subEvent.sub_event_categories.map(sec => sec.category).filter(Boolean),
    sub_event_categories: undefined,
    types: subEvent.sub_event_types.map(set => set.type).filter(Boolean),
    sub_event_types: undefined
  }));
}

// Get single sub-event by ID
async function getSubEventById(id) {
  const { data, error } = await supabase
    .from('sub_events')
    .select('*, event:events(id, name), sub_event_categories(category:categories(id, name)), sub_event_types(type:types(id, name))')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    event_name: data.event?.name || null,
    event: undefined,
    categories: data.sub_event_categories.map(sec => sec.category).filter(Boolean),
    sub_event_categories: undefined,
    types: data.sub_event_types.map(set => set.type).filter(Boolean),
    sub_event_types: undefined
  };
}

// Create sub-event
async function createSubEvent(data) {
  const {
    event_id, description, media, status, show_event,
    start_date, end_date,
    category_ids = [], type_ids = []
  } = data;
  
  if (!event_id) {
    throw new Error('event_id is required for sub-events');
  }
  
  try {
    // Build date range if dates provided
    let dateRange = null;
    if (start_date && end_date) {
      dateRange = `[${start_date},${end_date}]`;
    } else if (start_date) {
      dateRange = `[${start_date},)`;
    }
    
    // Insert sub-event
    const { data: subEvent, error: subEventError } = await supabase
      .from('sub_events')
      .insert([{
        event_id,
        description: description || '',
        media: media || null,
        date_range: dateRange,
        status: status || 'draft',
        show_event: show_event !== undefined ? show_event : true
      }])
      .select()
      .single();
    
    if (subEventError) throw subEventError;
    
    // Insert categories
    if (category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        sub_event_id: subEvent.id,
        category_id: categoryId
      }));
      
      const { error: catError } = await supabase
        .from('sub_event_categories')
        .insert(categoryLinks);
      
      if (catError) throw catError;
    }
    
    // Insert types
    if (type_ids.length > 0) {
      const typeLinks = type_ids.map(typeId => ({
        sub_event_id: subEvent.id,
        type_id: typeId
      }));
      
      const { error: typeError } = await supabase
        .from('sub_event_types')
        .insert(typeLinks);
      
      if (typeError) throw typeError;
    }
    
    return await getSubEventById(subEvent.id);
  } catch (err) {
    throw err;
  }
}

// Update sub-event
async function updateSubEvent(id, data) {
  const {
    description, media, status, show_event,
    start_date, end_date,
    category_ids, type_ids
  } = data;
  
  try {
    // Build update object
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (media !== undefined) updates.media = media;
    if (status !== undefined) updates.status = status;
    if (show_event !== undefined) updates.show_event = show_event;
    
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
    
    // Update sub-event
    const { error: updateError } = await supabase
      .from('sub_events')
      .update(updates)
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Update categories if provided
    if (category_ids !== undefined) {
      await supabase.from('sub_event_categories').delete().eq('sub_event_id', id);
      
      if (category_ids.length > 0) {
        const categoryLinks = category_ids.map(categoryId => ({
          sub_event_id: id,
          category_id: categoryId
        }));
        
        const { error: catError } = await supabase
          .from('sub_event_categories')
          .insert(categoryLinks);
        
        if (catError) throw catError;
      }
    }
    
    // Update types if provided
    if (type_ids !== undefined) {
      await supabase.from('sub_event_types').delete().eq('sub_event_id', id);
      
      if (type_ids.length > 0) {
        const typeLinks = type_ids.map(typeId => ({
          sub_event_id: id,
          type_id: typeId
        }));
        
        const { error: typeError } = await supabase
          .from('sub_event_types')
          .insert(typeLinks);
        
        if (typeError) throw typeError;
      }
    }
    
    return await getSubEventById(id);
  } catch (err) {
    throw err;
  }
}

// Delete sub-event
async function deleteSubEvent(id) {
  try {
    await supabase.from('sub_event_categories').delete().eq('sub_event_id', id);
    await supabase.from('sub_event_types').delete().eq('sub_event_id', id);
    
    const { error } = await supabase
      .from('sub_events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getAllSubEvents,
  getSubEventById,
  createSubEvent,
  updateSubEvent,
  deleteSubEvent
};
