import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ColorPicker } from '@/components/ui/ColorPicker';

interface HeroVideo {
  id: number;
  video_file?: string;
  thumbnail_image?: string;
  title_bs?: string;
  title_en?: string;
  button_text_bs?: string;
  button_text_en?: string;
  button_link?: string;
  title_color: string;
  button_bg_color: string;
  button_text_color: string;
  created_at?: string;
  updated_at?: string;
}

export default function HeroVideoPage() {
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HeroVideo | null>(null);
  const [formData, setFormData] = useState({
    video_file: null as File | null,
    thumbnail_image: null as File | null,
    title_bs: '',
    title_en: '',
    button_text_bs: '',
    button_text_en: '',
    button_link: '',
    title_color: 'rgba(255, 255, 255, 1)',
    button_bg_color: 'rgba(122, 73, 240, 1)',
    button_text_color: 'rgba(255, 255, 255, 1)',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHeroVideos();
  }, []);

  const loadHeroVideos = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await heroVideoApi.getAll();
      // setHeroVideos(data);
      setHeroVideos([]);
    } catch (error) {
      console.error('Failed to load hero videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (video?: HeroVideo) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        video_file: null,
        thumbnail_image: null,
        title_bs: video.title_bs || '',
        title_en: video.title_en || '',
        button_text_bs: video.button_text_bs || '',
        button_text_en: video.button_text_en || '',
        button_link: video.button_link || '',
        title_color: video.title_color,
        button_bg_color: video.button_bg_color,
        button_text_color: video.button_text_color,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        video_file: null,
        thumbnail_image: null,
        title_bs: '',
        title_en: '',
        button_text_bs: '',
        button_text_en: '',
        button_link: '',
        title_color: 'rgba(255, 255, 255, 1)',
        button_bg_color: 'rgba(122, 73, 240, 1)',
        button_text_color: 'rgba(255, 255, 255, 1)',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData: any = {
        title_bs: formData.title_bs,
        title_en: formData.title_en,
        button_text_bs: formData.button_text_bs,
        button_text_en: formData.button_text_en,
        button_link: formData.button_link,
        title_color: formData.title_color,
        button_bg_color: formData.button_bg_color,
        button_text_color: formData.button_text_color,
        video_file: formData.video_file ? formData.video_file.name : undefined,
        thumbnail_image: formData.thumbnail_image ? formData.thumbnail_image.name : undefined,
      };

      console.log('Hero video data prepared:', submitData);
      
      // TODO: Backend API endpoint needs to be created
      // The endpoint should be: POST/PUT /api/hotspot/hero-videos
      // Once backend is ready, uncomment below:
      // if (editingVideo) {
      //   await httpClient.put(`/api/hotspot/hero-videos/${editingVideo.id}`, submitData);
      // } else {
      //   await httpClient.post('/api/hotspot/hero-videos', submitData);
      // }

      alert('✅ Form validated successfully!\n\n⚠️ Backend API endpoint not yet created.\n\nData logged to console for development.');

      handleCloseModal();
    } catch (error) {
      console.error('Failed to save hero video:', error);
      alert('Failed to save hero video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero video?')) return;

    try {
      // TODO: Replace with actual API call
      // await heroVideoApi.delete(id);
      console.log('Deleting hero video:', id);
      loadHeroVideos();
    } catch (error) {
      console.error('Failed to delete hero video:', error);
      alert('Failed to delete hero video. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Videos</h1>
          <p className="text-sm text-gray-500 mt-1">Add multiple hero videos for rotation</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Hero Video
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading hero videos...</p>
          </div>
        ) : heroVideos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No hero videos found. Click "Add Hero Video" to create your first video.</p>
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
                    Button Text
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
                {heroVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {video.thumbnail_image ? (
                        <img
                          src={video.thumbnail_image}
                          alt="Thumbnail"
                          className="h-12 w-20 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-20 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {video.title_en || video.title_bs || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {video.button_text_en || video.button_text_bs || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {video.button_link || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(video)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
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
        title="Configure Hero Video"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Content</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setFormData({ ...formData, video_file: e.target.files?.[0] || null })
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_image: e.target.files?.[0] || null })
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

          {/* Colors & Styling Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Colors & Styling
            </h3>

            <ColorPicker
              label="Title Text Color"
              value={formData.title_color}
              onChange={(color) => setFormData({ ...formData, title_color: color })}
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
              Save Hero Video
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
