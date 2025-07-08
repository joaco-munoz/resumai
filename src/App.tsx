
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { AIUsageProvider } from "@/contexts/AIUsageContext";
import { ThemeProvider } from "next-themes";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import CVBuilder from "@/pages/CVBuilder";
import CVsList from "@/pages/CVsList";
import JobMatcher from "@/pages/JobMatcher";
import Kanban from "@/pages/Kanban";
import Profile from "@/pages/Profile";
import Billing from "@/pages/Billing";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import RedirectHandler from "@/components/RedirectHandler";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <AIUsageProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/redirect" element={<RedirectHandler />} />
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cv-builder"
                    element={
                      <ProtectedRoute>
                        <CVBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cvs"
                    element={
                      <ProtectedRoute>
                        <CVsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/job-matcher"
                    element={
                      <ProtectedRoute>
                        <JobMatcher />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/kanban"
                    element={
                      <ProtectedRoute>
                        <Kanban />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/billing"
                    element={
                      <ProtectedRoute>
                        <Billing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </AIUsageProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
