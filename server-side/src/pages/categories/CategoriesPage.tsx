import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { categoriesApi } from '@/api/categoriesApi';
import type { Category } from '@/types/content';
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

// Sortable row component
function SortableRow({ category, onEdit, onDelete }: { category: Category; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

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
        {category.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {category.slug || '-'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
        {category.description || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {category.image ? (
          <ImageIcon className="h-5 w-5 text-green-500" />
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {category.featured_category ? (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            Featured
          </span>
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: null as File | null,
    featured_category: false,
  });
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug || '',
        description: category.description || '',
        image: null,
        featured_category: category.featured_category || false,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: null,
        featured_category: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
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
        featured_category: formData.featured_category,
      };

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, submitData);
      } else {
        await categoriesApi.create(submitData);
      }

      handleCloseModal();
      loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesApi.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(newCategories);

    try {
      // Send the new order to the API
      const orderedIds = newCategories.map((cat) => cat.id);
      await fetch('http://localhost:3000/api/categories/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderedIds }),
      });
      
      // Reload categories to get the correct display_order from the server
      await loadCategories();
    } catch (error) {
      console.error('Failed to save order:', error);
      // Revert on error
      loadCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No categories found. Click "Add Category" to create your first category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Order
                    </th>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <SortableContext
                    items={categories.map((cat) => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableRow
                        key={category.id}
                        category={category}
                        onEdit={() => handleOpenModal(category)}
                        onDelete={() => handleDelete(category.id)}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
          />

          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="category-slug"
            helperText="URL-friendly version of the name"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter category description"
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

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured_category}
                onChange={(e) =>
                  setFormData({ ...formData, featured_category: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Category</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">Show this category on the homepage</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
