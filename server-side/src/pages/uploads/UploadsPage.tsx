import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UploadsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">File Uploads</h1>
        <Button variant="primary">
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p>No files uploaded yet. Click "Upload File" to add your first file.</p>
        </div>
      </div>
    </div>
  );
}
