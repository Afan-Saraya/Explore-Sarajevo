import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Star, Image as ImageIcon, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { businessesApi } from '@/api/businessesApi';
import { brandsApi } from '@/api/brandsApi';
import { categoriesApi } from '@/api/categoriesApi';
import { typesApi } from '@/api/typesApi';
import type { Business, Brand, Category, Type } from '@/types/content';

// Sortable row component
function SortableRow({ 
  business, 
  getBrandName,
  onEdit, 
  onDelete 
}: { 
  business: Business; 
  getBrandName: (id: any) => string;
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: business.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="h-5 w-5" />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {business.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {getBrandName(business.brand_id)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
        {business.address || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {business.rating ? (
          <span className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
            {business.rating}
          </span>
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {business.featured_business ? (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            Featured
          </span>
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {business.media ? (
          <ImageIcon className="h-5 w-5 text-green-500" />
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-900 mr-4"
        >
          <Pencil className="h-4 w-4 inline" />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-4 w-4 inline" />
        </button>
      </td>
    </tr>
  );
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand_id: '',
    address: '',
    location: '',
    rating: '',
    working_hours: '',
    media: null as File | null,
    telephone: '',
    website: '',
    description: '',
    featured_business: false,
    category_ids: [] as number[],
    type_ids: [] as number[],
  });
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [businessesData, brandsData, categoriesData, typesData] = await Promise.all([
        businessesApi.getAll(),
        brandsApi.getAll(),
        categoriesApi.getAll(),
        typesApi.getAll(),
      ]);
      setBusinesses(businessesData);
      setBrands(brandsData);
      setCategories(categoriesData);
      setTypes(typesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (business?: Business) => {
    if (business) {
      console.log('Opening modal with business:', business);
      console.log('Category IDs:', business.category_ids);
      console.log('Type IDs:', business.type_ids);
      console.log('Media:', business.media);
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        slug: business.slug || '',
        brand_id: business.brand_id?.toString() || '',
        address: business.address || '',
        location: business.location || '',
        rating: business.rating?.toString() || '',
        working_hours: business.working_hours || '',
        media: null,
        telephone: business.telephone || '',
        website: business.website || '',
        description: business.description || '',
        featured_business: business.featured_business || false,
        category_ids: business.category_ids || [],
        type_ids: business.type_ids || [],
      });
    } else {
      setEditingBusiness(null);
      setFormData({
        name: '',
        slug: '',
        brand_id: '',
        address: '',
        location: '',
        rating: '',
        working_hours: '',
        media: null,
        telephone: '',
        website: '',
        description: '',
        featured_business: false,
        category_ids: [],
        type_ids: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBusiness(null);
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
        // Store as JSON array of URLs for consistency with other sections
        mediaUrl = JSON.stringify([result.url]);
      }

      const submitData: any = {
        name: formData.name,
        slug: formData.slug,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        address: formData.address,
        location: formData.location,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        working_hours: formData.working_hours,
        telephone: formData.telephone,
        website: formData.website,
        description: formData.description,
        featured_business: formData.featured_business,
        media: mediaUrl,
        category_ids: formData.category_ids,
        type_ids: formData.type_ids,
      };

      if (editingBusiness) {
        await businessesApi.update(editingBusiness.id, submitData);
      } else {
        await businessesApi.create(submitData);
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Failed to save business:', error);
      alert('Failed to save business. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      await businessesApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete business:', error);
      alert('Failed to delete business. Please try again.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = businesses.findIndex((b) => b.id === active.id);
    const newIndex = businesses.findIndex((b) => b.id === over.id);

    const newBusinesses = arrayMove(businesses, oldIndex, newIndex);
    setBusinesses(newBusinesses);

    try {
      // Send the new order to the API
      const orderedIds = newBusinesses.map((b) => b.id);
      await fetch('http://localhost:3000/api/businesses/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderedIds }),
      });
      
      // Reload businesses to get the correct display_order from the server
      await loadData();
    } catch (error) {
      console.error('Failed to save order:', error);
      // Revert on error
      loadData();
    }
  };

  const getBrandName = (brandId?: number) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : '-';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No businesses found. Click "Add Business" to create your first business.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {/* Drag handle column */}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
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
                  <SortableContext
                    items={businesses.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {businesses.map((business) => (
                      <SortableRow
                        key={business.id}
                        business={business}
                        getBrandName={getBrandName}
                        onEdit={() => handleOpenModal(business)}
                        onDelete={() => handleDelete(business.id)}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </div>
          </DndContext>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBusiness ? 'Edit Business' : 'Add Business'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter business name"
            />

            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="business-slug"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Brand"
              value={formData.brand_id}
              onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
            >
              <option value="">None (No Brand)</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>

            <Input
              label="Rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              placeholder="0.0 - 5.0"
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter business address"
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter location coordinates"
            helperText="Format: latitude,longitude"
          />

          <Input
            label="Working Hours"
            value={formData.working_hours}
            onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
            placeholder="e.g., Mon-Fri: 9AM-5PM"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telephone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="Enter phone number"
            />

            <Input
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter business description"
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
            {editingBusiness?.media && (
              <div className="mb-2 text-sm text-gray-600">
                Current: <span className="text-green-600 font-medium">✓ Image uploaded</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, media: e.target.files?.[0] || null })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to keep existing image</p>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured_business}
                onChange={(e) =>
                  setFormData({ ...formData, featured_business: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Business</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories {formData.category_ids.length > 0 && (
                <span className="text-purple-600 font-normal">({formData.category_ids.length} selected)</span>
              )}
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types {formData.type_ids.length > 0 && (
                <span className="text-purple-600 font-normal">({formData.type_ids.length} selected)</span>
              )}
            </label>
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
              {editingBusiness ? 'Update' : 'Create'} Business
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
