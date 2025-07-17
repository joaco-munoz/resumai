
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AIUsageProvider } from "@/contexts/AIUsageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import RedirectHandler from "@/components/RedirectHandler";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CVBuilder from "./pages/CVBuilder";
import CVsList from "./pages/CVsList";
import CVSelector from "./pages/CVSelector";
import JobMatcher from "./pages/JobMatcher";
import Kanban from "./pages/Kanban";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("🚀 App component rendered");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AIUsageProvider>
            <TooltipProvider>
            <Toaster />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              
              {/* Protected routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/app/cv-builder/:id?" element={
                <ProtectedRoute>
                  <CVBuilder />
                </ProtectedRoute>
              } />
              <Route path="/app/cv-selector" element={
                <ProtectedRoute>
                  <CVSelector />
                </ProtectedRoute>
              } />
              <Route path="/app/cvs" element={
                <ProtectedRoute>
                  <CVsList />
                </ProtectedRoute>
              } />
              <Route path="/app/match" element={
                <ProtectedRoute>
                  <JobMatcher />
                </ProtectedRoute>
              } />
              <Route path="/app/kanban" element={
                <ProtectedRoute>
                  <Kanban />
                </ProtectedRoute>
              } />
              <Route path="/app/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/app/billing" element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } />
              <Route path="/app/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Redirect handler for auth callbacks */}
              <Route path="/redirect" element={<RedirectHandler />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
          </AIUsageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
