import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { eventsApi } from '@/api/eventsApi';
import { categoriesApi } from '@/api/categoriesApi';
import { typesApi } from '@/api/typesApi';
import type { SubEvent, Event, Category, Type } from '@/types/content';

export default function SubEventsPage() {
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubEvent, setEditingSubEvent] = useState<SubEvent | null>(null);
  const [formData, setFormData] = useState({
    event_id: '',
    description: '',
    media: null as File | null,
    start_date: '',
    end_date: '',
    status: 'draft',
    show_event: true,
    category_ids: [] as number[],
    type_ids: [] as number[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, categoriesData, typesData, subEventsData] = await Promise.all([
        eventsApi.getAll(),
        categoriesApi.getAll(),
        typesApi.getAll(),
        eventsApi.getSubEvents(),
      ]);
      setEvents(eventsData);
      setCategories(categoriesData);
      setTypes(typesData);
      setSubEvents(subEventsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subEvent?: SubEvent) => {
    if (subEvent) {
      setEditingSubEvent(subEvent);
      setFormData({
        event_id: subEvent.event_id?.toString() || '',
        description: subEvent.description || '',
        media: null,
        start_date: subEvent.start_date || '',
        end_date: subEvent.end_date || '',
        status: subEvent.status || 'draft',
        show_event: subEvent.show_event ?? true,
        category_ids: [],
        type_ids: [],
      });
    } else {
      setEditingSubEvent(null);
      setFormData({
        event_id: '',
        description: '',
        media: null,
        start_date: '',
        end_date: '',
        status: 'draft',
        show_event: true,
        category_ids: [],
        type_ids: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let mediaUrl = undefined;

      // Upload media if provided
      if (formData.media) {
        const mediaFormData = new FormData();
        mediaFormData.append('file', formData.media);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: mediaFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload media');
        }

        const result = await uploadResponse.json();
        mediaUrl = JSON.stringify([result.url]);
      }

      const submitData: any = {
        event_id: parseInt(formData.event_id),
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        show_event: formData.show_event,
        media: mediaUrl,
      };

      if (editingSubEvent) {
        await eventsApi.updateSubEvent(editingSubEvent.id, submitData);
      } else {
        await eventsApi.createSubEvent(submitData);
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Failed to save sub-event:', error);
      alert('Failed to save sub-event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subEventId: number) => {
    if (!confirm('Are you sure you want to delete this sub-event?')) return;

    try {
      await eventsApi.deleteSubEvent(subEventId);
      loadData();
    } catch (error) {
      console.error('Failed to delete sub-event:', error);
      alert('Failed to delete sub-event. Please try again.');
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const handleTypeToggle = (typeId: number) => {
    setFormData((prev) => ({
      ...prev,
      type_ids: prev.type_ids.includes(typeId)
        ? prev.type_ids.filter((id) => id !== typeId)
        : [...prev.type_ids, typeId],
    }));
  };

  const getEventName = (eventId?: number) => {
    const event = events.find((e) => e.id === eventId);
    return event ? event.name : '-';
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sub-events</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sub-event
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading sub-events...</p>
          </div>
        ) : subEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No sub-events found. Click "Add Sub-event" to create your first sub-event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subEvents.map((subEvent) => (
                  <tr key={subEvent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getEventName(subEvent.event_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">{subEvent.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subEvent.start_date)} - {formatDate(subEvent.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          subEvent.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subEvent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subEvent.media ? (
                        <ImageIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(subEvent)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(subEvent.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSubEvent ? 'Edit Sub-event' : 'Add Sub-event'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Parent Event"
            required
            value={formData.event_id}
            onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter sub-event description"
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, media: e.target.files?.[0] || null })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />

            <Input
              label="End Date"
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.show_event}
                  onChange={(e) =>
                    setFormData({ ...formData, show_event: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Event</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.category_ids.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Types</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {types.map((type) => (
                <label key={type.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.type_ids.includes(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingSubEvent ? 'Update' : 'Create'} Sub-event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
