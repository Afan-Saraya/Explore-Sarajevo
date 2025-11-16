import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BusinessesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p>No businesses found. Click "Add Business" to create your first business.</p>
        </div>
      </div>
    </div>
  );
}
