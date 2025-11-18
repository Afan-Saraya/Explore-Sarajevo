import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { typesApi } from '@/api/typesApi';
import type { Type } from '@/types/content';

export default function TypesPage() {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<Type | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: null as File | null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await typesApi.getAll();
      setTypes(data);
    } catch (error) {
      console.error('Failed to load types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type?: Type) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        slug: type.slug || '',
        description: type.description || '',
        image: null,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = undefined;
      
      // Upload image if provided
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.image);
        
        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: imageFormData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const result = await response.json();
        imageUrl = result.url;
      }
      
      const submitData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: imageUrl,
      };

      if (editingType) {
        await typesApi.update(editingType.id, submitData);
      } else {
        await typesApi.create(submitData);
      }

      handleCloseModal();
      loadTypes();
    } catch (error) {
      console.error('Failed to save type:', error);
      alert('Failed to save type. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this type?')) return;

    try {
      await typesApi.delete(id);
      loadTypes();
    } catch (error) {
      console.error('Failed to delete type:', error);
      alert('Failed to delete type. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Types</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading types...</p>
          </div>
        ) : types.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No types found. Click "Add Type" to create your first type.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {types.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {type.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {type.slug || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {type.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {type.image ? (
                        <ImageIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(type)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
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
        title={editingType ? 'Edit Type' : 'Add Type'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter type name"
          />

          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="type-slug"
            helperText="URL-friendly version of the name"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter type description"
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingType ? 'Update' : 'Create'} Type
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
