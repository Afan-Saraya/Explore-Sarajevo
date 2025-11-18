import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Chip {
  id: number;
  name_bs: string;
  name_en: string;
  link_url: string;
  icon_image?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ChipsPage() {
  const [chips, setChips] = useState<Chip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChip, setEditingChip] = useState<Chip | null>(null);
  const [formData, setFormData] = useState({
    name_bs: '',
    name_en: '',
    link_url: '',
    icon_image: null as File | null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChips();
  }, []);

  const loadChips = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await httpClient.get('/api/hotspot/chips');
      // setChips(data);
      setChips([]);
    } catch (error) {
      console.error('Failed to load chips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (chip?: Chip) => {
    if (chip) {
      setEditingChip(chip);
      setFormData({
        name_bs: chip.name_bs,
        name_en: chip.name_en,
        link_url: chip.link_url,
        icon_image: null,
      });
    } else {
      setEditingChip(null);
      setFormData({
        name_bs: '',
        name_en: '',
        link_url: '',
        icon_image: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChip(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData: any = {
        name_bs: formData.name_bs,
        name_en: formData.name_en,
        link_url: formData.link_url,
        icon_image: formData.icon_image ? formData.icon_image.name : undefined,
      };

      console.log('Chip data prepared:', submitData);
      
      // TODO: Backend API endpoint needs to be created
      // The endpoint should be: POST/PUT /api/hotspot/chips
      // Once backend is ready, uncomment below:
      // if (editingChip) {
      //   await httpClient.put(`/api/hotspot/chips/${editingChip.id}`, submitData);
      // } else {
      //   await httpClient.post('/api/hotspot/chips', submitData);
      // }

      alert('✅ Form validated successfully!\n\n⚠️ Backend API endpoint not yet created.\n\nData logged to console for development.');

      handleCloseModal();
    } catch (error) {
      console.error('Failed to save chip:', error);
      alert('Failed to save chip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this chip?')) return;

    try {
      // TODO: Replace with actual API call
      // await httpClient.delete(`/api/hotspot/chips/${id}`);
      console.log('Deleting chip:', id);
      loadChips();
    } catch (error) {
      console.error('Failed to delete chip:', error);
      alert('Failed to delete chip. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Navigation Chips</h1>
          <p className="text-sm text-gray-500 mt-1">Add quick action buttons with icons</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chip
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading chips...</p>
          </div>
        ) : chips.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No chips found. Click "Add Chip" to create your first chip.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name (Bosnian)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name (English)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link URL
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chips.map((chip) => (
                  <tr key={chip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {chip.icon_image ? (
                        <img
                          src={chip.icon_image}
                          alt="Icon"
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {chip.name_bs || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {chip.name_en || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <a
                        href={chip.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {chip.link_url || '-'}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(chip)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(chip.id)}
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
        title={`Chip ${editingChip ? editingChip.id : chips.length + 1}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name (Bosnian)"
              required
              value={formData.name_bs}
              onChange={(e) => setFormData({ ...formData, name_bs: e.target.value })}
              placeholder="Enter name in Bosnian"
            />
            <Input
              label="Name (English)"
              required
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Enter name in English"
            />
          </div>

          <Input
            label="Link URL"
            required
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            placeholder="https://example.com"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, icon_image: e.target.files?.[0] || null })
              }
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Chip
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
