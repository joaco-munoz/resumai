import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { NPSModal } from "@/components/NPSModal";
import { useNPS } from "@/hooks/useNPS";

const Dashboard = () => {
  const { user } = useAuth();
  const { showOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();
  const { tier, isPremium, isLoading: statusLoading } = useSubscriptionStatus();
  const [stats, setStats] = useState({
    cvsCreated: 0,
    applications: 0,
    interviews: 0,
    responseRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { shouldShowNPS, dismissNPS } = useNPS();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch CVs count
      const { count: cvsCount } = await supabase
        .from('cvs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count applications with status 'applied' (Postulado)
      const { count: applicationsCount } = await supabase
        .from('job_applications_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'applied');

      // Count applications with status 'interviewing' (En entrevista)
      const { count: interviewsCount } = await supabase
        .from('job_applications_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'interviewing');

      setStats({
        cvsCreated: cvsCount || 0,
        applications: applicationsCount || 0,
        interviews: interviewsCount || 0,
        responseRate: 0
      });

      // Fetch recent activities
      const { data: recentCVs } = await supabase
        .from('cvs')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentApplications } = await supabase
        .from('job_applications_tracking')
        .select('id, status, applied_date, position, company')
        .eq('user_id', user.id)
        .order('applied_date', { ascending: false })
        .limit(3);

      const activities = [
        ...(recentCVs || []).map(cv => ({
          id: cv.id,
          type: 'cv_created' as const,
          title: cv.title,
          date: new Date(cv.created_at).toLocaleDateString('es-ES'),
          status: 'Completado'
        })),
        ...(recentApplications || []).map(app => ({
          id: app.id,
          type: 'application_sent' as const,
          title: app.position || 'Aplicación',
          date: new Date(app.applied_date).toLocaleDateString('es-ES'),
          status: app.status
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingClose = () => {
    completeOnboarding();
  };

  if (loading || onboardingLoading || statusLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando dashboard...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex justify-between items-center w-full">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                  {/*<Badge 
                      variant={isPremium ? "default" : "secondary"} 
                      className={`${
                        isPremium 
                          ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white" 
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isPremium ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" />
                          Plan Pro
                        </>
                      ) : (
                        "Plan Gratuito"
                      )}
                    </Badge>
                    */}
                  </div>
                  <p className="text-gray-600 mt-2">
                    {isPremium 
                      ? "Aprovecha todas las funciones premium" 
                      : "Resumen de tu actividad y progreso"
                    }
                  </p>
                </div>
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <DashboardStats stats={stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickActions />
                <RecentActivity activities={recentActivities} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={handleOnboardingClose}
      />

      <NPSModal 
        isOpen={shouldShowNPS} 
        onClose={dismissNPS} 
      />
    </SidebarProvider>
  );
};

export default Dashboard;
