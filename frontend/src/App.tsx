import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import Index from "./pages/Index";
import MainApp from "./pages/MainApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* App Routes - MainApp handles authentication and routing */}
            <Route path="/app" element={<MainApp />} />
            <Route path="/app/dashboard" element={<MainApp />} />
            <Route path="/app/submit" element={<MainApp />} />
            <Route path="/app/map" element={<MainApp />} />
            <Route path="/app/settings" element={<MainApp />} />
            <Route path="/app/profile" element={<MainApp />} />
            
            {/* Admin Routes */}
            <Route path="/app/admin" element={<Navigate to="/app/admin/dashboard" replace />} />
            <Route path="/app/admin/dashboard" element={<MainApp />} />
            <Route path="/app/admin/complaints" element={<MainApp />} />
            <Route path="/app/admin/users" element={<MainApp />} />
            <Route path="/app/admin/settings" element={<MainApp />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
