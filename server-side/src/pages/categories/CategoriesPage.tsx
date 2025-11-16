import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CategoriesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p>No categories found. Click "Add Category" to create your first category.</p>
        </div>
      </div>
    </div>
  );
}
