import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BrandsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p>No brands found. Click "Add Brand" to create your first brand.</p>
        </div>
      </div>
    </div>
  );
}
