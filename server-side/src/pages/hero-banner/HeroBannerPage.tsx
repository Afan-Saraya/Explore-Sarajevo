import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ColorPicker } from '@/components/ui/ColorPicker';

interface HeroBanner {
  id: number;
  banner_image?: string;
  title_bs?: string;
  title_en?: string;
  subtitle_bs?: string;
  subtitle_en?: string;
  button_text_bs?: string;
  button_text_en?: string;
  button_link?: string;
  title_color: string;
  subtitle_color: string;
  button_bg_color: string;
  button_text_color: string;
  created_at?: string;
  updated_at?: string;
}

export default function HeroBannerPage() {
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [formData, setFormData] = useState({
    banner_image: null as File | null,
    title_bs: '',
    title_en: '',
    subtitle_bs: '',
    subtitle_en: '',
    button_text_bs: '',
    button_text_en: '',
    button_link: '',
    title_color: 'rgba(255, 255, 255, 1)',
    subtitle_color: 'rgba(255, 255, 255, 1)',
    button_bg_color: 'rgba(122, 73, 240, 1)',
    button_text_color: 'rgba(255, 255, 255, 1)',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHeroBanners();
  }, []);

  const loadHeroBanners = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await httpClient.get('/api/hotspot/hero-banners');
      // setHeroBanners(data);
      setHeroBanners([]);
    } catch (error) {
      console.error('Failed to load hero banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner?: HeroBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        banner_image: null,
        title_bs: banner.title_bs || '',
        title_en: banner.title_en || '',
        subtitle_bs: banner.subtitle_bs || '',
        subtitle_en: banner.subtitle_en || '',
        button_text_bs: banner.button_text_bs || '',
        button_text_en: banner.button_text_en || '',
        button_link: banner.button_link || '',
        title_color: banner.title_color,
        subtitle_color: banner.subtitle_color,
        button_bg_color: banner.button_bg_color,
        button_text_color: banner.button_text_color,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        banner_image: null,
        title_bs: '',
        title_en: '',
        subtitle_bs: '',
        subtitle_en: '',
        button_text_bs: '',
        button_text_en: '',
        button_link: '',
        title_color: 'rgba(255, 255, 255, 1)',
        subtitle_color: 'rgba(255, 255, 255, 1)',
        button_bg_color: 'rgba(122, 73, 240, 1)',
        button_text_color: 'rgba(255, 255, 255, 1)',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData: any = {
        title_bs: formData.title_bs,
        title_en: formData.title_en,
        subtitle_bs: formData.subtitle_bs,
        subtitle_en: formData.subtitle_en,
        button_text_bs: formData.button_text_bs,
        button_text_en: formData.button_text_en,
        button_link: formData.button_link,
        title_color: formData.title_color,
        subtitle_color: formData.subtitle_color,
        button_bg_color: formData.button_bg_color,
        button_text_color: formData.button_text_color,
        banner_image: formData.banner_image ? formData.banner_image.name : undefined,
      };

      console.log('Hero banner data prepared:', submitData);
      
      // TODO: Backend API endpoint needs to be created
      // The endpoint should be: POST/PUT /api/hotspot/hero-banners
      // Once backend is ready, uncomment below:
      // if (editingBanner) {
      //   await httpClient.put(`/api/hotspot/hero-banners/${editingBanner.id}`, submitData);
      // } else {
      //   await httpClient.post('/api/hotspot/hero-banners', submitData);
      // }

      alert('✅ Form validated successfully!\n\n⚠️ Backend API endpoint not yet created.\n\nData logged to console for development.');

      handleCloseModal();
    } catch (error) {
      console.error('Failed to save hero banner:', error);
      alert('Failed to save hero banner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;

    try {
      // TODO: Replace with actual API call
      // await httpClient.delete(`/api/hotspot/hero-banners/${id}`);
      console.log('Deleting hero banner:', id);
      loadHeroBanners();
    } catch (error) {
      console.error('Failed to delete hero banner:', error);
      alert('Failed to delete hero banner. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Add multiple hero banners for rotation (4:3 ratio)</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Hero Banner
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading hero banners...</p>
          </div>
        ) : heroBanners.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No hero banners found. Click "Add Hero Banner" to create your first banner.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Button Link
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {heroBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {banner.banner_image ? (
                        <img
                          src={banner.banner_image}
                          alt="Banner"
                          className="h-16 w-20 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-20 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {banner.title_en || banner.title_bs || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {banner.subtitle_en || banner.subtitle_bs || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {banner.button_link || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(banner)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
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
        title={`Hero Banner ${editingBanner ? editingBanner.id : heroBanners.length + 1}`}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Content</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image (4:3 ratio recommended)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, banner_image: e.target.files?.[0] || null })
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bosnian"
                  value={formData.title_bs}
                  onChange={(e) => setFormData({ ...formData, title_bs: e.target.value })}
                  placeholder="Enter title in Bosnian"
                />
                <Input
                  label="English"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Enter title in English"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bosnian"
                  value={formData.subtitle_bs}
                  onChange={(e) => setFormData({ ...formData, subtitle_bs: e.target.value })}
                  placeholder="Enter subtitle in Bosnian"
                />
                <Input
                  label="English"
                  value={formData.subtitle_en}
                  onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                  placeholder="Enter subtitle in English"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bosnian"
                  value={formData.button_text_bs}
                  onChange={(e) => setFormData({ ...formData, button_text_bs: e.target.value })}
                  placeholder="Enter button text in Bosnian"
                />
                <Input
                  label="English"
                  value={formData.button_text_en}
                  onChange={(e) => setFormData({ ...formData, button_text_en: e.target.value })}
                  placeholder="Enter button text in English"
                />
              </div>
            </div>

            <Input
              label="Button Link"
              value={formData.button_link}
              onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          {/* Banner Styling Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Banner Styling
            </h3>

            <ColorPicker
              label="Title Color"
              value={formData.title_color}
              onChange={(color) => setFormData({ ...formData, title_color: color })}
            />

            <ColorPicker
              label="Subtitle Color"
              value={formData.subtitle_color}
              onChange={(color) => setFormData({ ...formData, subtitle_color: color })}
            />

            <ColorPicker
              label="Button Background"
              value={formData.button_bg_color}
              onChange={(color) => setFormData({ ...formData, button_bg_color: color })}
            />

            <ColorPicker
              label="Button Text Color"
              value={formData.button_text_color}
              onChange={(color) => setFormData({ ...formData, button_text_color: color })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Hero Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
