import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">Content Management System</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-5 w-5 mr-2" />
          <span>Admin User</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
