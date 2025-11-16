import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TypesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Types</h1>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p>No types found. Click "Add Type" to create your first type.</p>
        </div>
      </div>
    </div>
  );
}
