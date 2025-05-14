import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Database, FileText, Layers, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const userItems = [
    { title: 'Dataset Creation', url: '/dashboard/dataset-creation', icon: Database },
    { title: 'Dataset Annotation', url: '/dashboard/dataset-annotation', icon: FileText },
    { title: 'New Model Creation', url: '/dashboard/new-model', icon: Layers }
  ];

  const adminItems = [
    { title: 'User Management', url: '/admin/users', icon: Database }
  ];

  const items = user?.role === 'admin' ? adminItems : userItems;

  const isActive = (path: string) => currentPath.includes(path);
  const isExpanded = items.some(i => isActive(i.url));
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-green-light text-green-dark font-medium" : "hover:bg-green-light/50";

  return (
    <Sidebar
      className={`border-r shadow-sm transition-all duration-300 ${collapsed ? "w-14" : "w-64"} bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40`}
      collapsible="icon"
    >
      <div className="p-4 flex justify-center">
        {!collapsed ? (
          <div className="text-lg font-bold font-poppins bg-gradient-green bg-clip-text text-transparent">MLOps Platform</div>
        ) : (
          <div className="text-xl font-bold text-green">ML</div>
        )}
      </div>

      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} font-poppins`}>
            {user?.role === 'admin' ? 'Admin' : 'User'} Dashboard
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span className="font-poppins">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4">
        <button 
          onClick={logout} 
          className="flex items-center justify-center w-full px-4 py-2 rounded-md 
                  bg-red-50 text-red-600 hover:bg-red-100 transition-colors 
                  border border-red-200 shadow-sm font-poppins font-medium"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
