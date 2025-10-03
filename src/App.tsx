import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AddResource from "./pages/admin/AddResource";
import EditResource from "./pages/admin/EditResource";
import AddCoach from "./pages/admin/AddCoach";
import EditCoach from "./pages/admin/EditCoach";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/resources/new" 
              element={
                <ProtectedRoute>
                  <AddResource />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/resources/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditResource />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/coaches/new" 
              element={
                <ProtectedRoute>
                  <AddCoach />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/coaches/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditCoach />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;