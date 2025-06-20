
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CVBuilder from "./pages/CVBuilder";
import CVsList from "./pages/CVsList";
import JobMatcher from "./pages/JobMatcher";
import Profile from "./pages/Profile";
import Kanban from "./pages/Kanban";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/app" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/app/kanban" element={
              <ProtectedRoute>
                <Kanban />
              </ProtectedRoute>
            } />
            <Route path="/app/cvs" element={
              <ProtectedRoute>
                <CVsList />
              </ProtectedRoute>
            } />
            <Route path="/app/cv/:id" element={
              <ProtectedRoute>
                <CVBuilder />
              </ProtectedRoute>
            } />
            <Route path="/app/match" element={
              <ProtectedRoute>
                <JobMatcher />
              </ProtectedRoute>
            } />
            <Route path="/app/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
