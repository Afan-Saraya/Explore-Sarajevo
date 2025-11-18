import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { brandsApi } from '@/api/brandsApi';
import type { Brand } from '@/types/content';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    media: null as File | null,
    business_id: '',
    brand_pdv: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandsApi.getAll();
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug || '',
        description: brand.description || '',
        media: null,
        business_id: brand.business_id || '',
        brand_pdv: brand.brand_pdv || '',
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        media: null,
        business_id: '',
        brand_pdv: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      media: null,
      business_id: '',
      brand_pdv: '',
    });
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
        
        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: mediaFormData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload media');
        }
        
        const result = await response.json();
        mediaUrl = JSON.stringify([result.url]);
      }
      
      const submitData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        business_id: formData.business_id,
        brand_pdv: formData.brand_pdv,
        media: mediaUrl,
      };

      if (editingBrand) {
        await brandsApi.update(editingBrand.id, submitData);
      } else {
        await brandsApi.create(submitData);
      }

      handleCloseModal();
      loadBrands();
    } catch (error) {
      console.error('Failed to save brand:', error);
      alert('Failed to save brand. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await brandsApi.delete(id);
      loadBrands();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      alert('Failed to delete brand. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading brands...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No brands found. Click "Add Brand" to create your first brand.</p>
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
                    Business ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand PDV
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
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {brand.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.slug || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.business_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.brand_pdv || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.media ? (
                        <ImageIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(brand)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
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
        title={editingBrand ? 'Edit Brand' : 'Add Brand'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter brand name"
          />

          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="brand-slug"
            helperText="URL-friendly version of the name"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter brand description"
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, media: e.target.files?.[0] || null })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <Input
            label="Business ID"
            value={formData.business_id}
            onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
            placeholder="Enter business ID"
          />

          <Input
            label="Brand PDV"
            value={formData.brand_pdv}
            onChange={(e) => setFormData({ ...formData, brand_pdv: e.target.value })}
            placeholder="Enter brand PDV"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingBrand ? 'Update' : 'Create'} Brand
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
