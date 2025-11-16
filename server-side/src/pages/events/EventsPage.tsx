import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EventsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p>No events found. Click "Add Event" to create your first event.</p>
        </div>
      </div>
    </div>
  );
}
