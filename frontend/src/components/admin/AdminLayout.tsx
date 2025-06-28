import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 md:min-h-screen">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">NyayChain Admin</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin/dashboard" 
                className={`block p-2 rounded-md ${isActive('/admin/dashboard') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/complaints" 
                className={`block p-2 rounded-md ${isActive('/admin/complaints') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Complaints
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/officials" 
                className={`block p-2 rounded-md ${isActive('/admin/officials') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Officials
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/analytics" 
                className={`block p-2 rounded-md ${isActive('/admin/analytics') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Analytics
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/profile" 
                className={`block p-2 rounded-md ${isActive('/admin/profile') 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Profile
              </Link>
            </li>
            <li className="pt-4 mt-4 border-t border-gray-200">
              <button 
                onClick={logout}
                className="w-full text-left p-2 rounded-md text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 