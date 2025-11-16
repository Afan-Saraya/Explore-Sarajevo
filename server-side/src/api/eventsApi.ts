import httpClient from './httpClient';
import { Event, SubEvent } from '@/types/content';

export const eventsApi = {
  getAll: async (params?: { status?: string; search?: string }): Promise<Event[]> => {
    return httpClient.get<Event[]>('/api/events', { params });
  },

  getById: async (id: number): Promise<Event> => {
    return httpClient.get<Event>(`/api/events/${id}`);
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    return httpClient.post<Event>('/api/events', data);
  },

  update: async (id: number, data: Partial<Event>): Promise<Event> => {
    return httpClient.put<Event>(`/api/events/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/events/${id}`);
  },

  // Sub-events
  getSubEvents: async (eventId?: number): Promise<SubEvent[]> => {
    return httpClient.get<SubEvent[]>('/api/subevents', {
      params: eventId ? { event_id: eventId } : undefined,
    });
  },

  getSubEventById: async (id: number): Promise<SubEvent> => {
    return httpClient.get<SubEvent>(`/api/subevents/${id}`);
  },

  createSubEvent: async (data: Partial<SubEvent>): Promise<SubEvent> => {
    return httpClient.post<SubEvent>('/api/subevents', data);
  },

  updateSubEvent: async (id: number, data: Partial<SubEvent>): Promise<SubEvent> => {
    return httpClient.put<SubEvent>(`/api/subevents/${id}`, data);
  },

  deleteSubEvent: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/subevents/${id}`);
  },
};

export default eventsApi;
