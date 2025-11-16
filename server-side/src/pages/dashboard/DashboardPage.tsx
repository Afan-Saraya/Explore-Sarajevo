export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Businesses</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Attractions</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Categories</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Explore Sarajevo CMS</h2>
        <p className="text-gray-600">
          Use the sidebar navigation to manage your content. You can create and edit categories, types, 
          brands, businesses, attractions, events, and upload media files.
        </p>
      </div>
    </div>
  );
}
