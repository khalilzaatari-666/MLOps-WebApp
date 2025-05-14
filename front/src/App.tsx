import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/admin/UserManagement";
import DatasetCreation from "./pages/dashboard/DatasetCreation";
import DatasetAnnotation from "./pages/dashboard/DatasetAnnotation";
import NewModel from "./pages/dashboard/NewModel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter
      future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Redirect root to login if not authenticated */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute 
                  element={<DashboardLayout />}
                  allowedRoles={["admin"]} 
                />
              }
            >
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            
            {/* User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute 
                  element={<DashboardLayout />}
                  allowedRoles={["user"]} 
                />
              }
            >
              <Route index element={<Navigate to="/dashboard/dataset-creation" replace />} />
              <Route path="dataset-creation" element={<DatasetCreation />} />
              <Route path="dataset-annotation" element={<DatasetAnnotation />} />
              <Route path="new-model" element={<NewModel />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
