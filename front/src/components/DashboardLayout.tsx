import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full font-poppins">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-6 bg-white shadow-sm">
            <div className="flex-1">
              <h2 className="inline-block text-xl font-semibold px-4 py-1.5 
                  border-2 border-green-500/30 rounded-lg bg-green-50/50
                  shadow-sm text-green-dark">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username || 'User'}
              </span>
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;