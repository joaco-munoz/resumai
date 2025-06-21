
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    cvsCreated: 0,
    applications: 0,
    interviews: 0,
    responseRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch applications count
      const { count: applicationsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch interviews count
      const { count: interviewsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'interview');

      // Calculate response rate
      const responseRate = applicationsCount && interviewsCount 
        ? Math.round((interviewsCount / applicationsCount) * 100)
        : 0;

      setStats({
        cvsCreated: cvsCount || 0,
        applications: applicationsCount || 0,
        interviews: interviewsCount || 0,
        responseRate
      });

      // Fetch recent activities (last 5 CVs and applications)
      const { data: recentCVs } = await supabase
        .from('cvs')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentApplications } = await supabase
        .from('job_applications')
        .select('id, status, applied_date, job_descriptions(title)')
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
          title: app.job_descriptions?.title || 'Aplicación',
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

  if (loading) {
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
        <SidebarInset>
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center gap-4">
              {/*<SidebarTrigger />*/}
              <div className="flex justify-between items-center w-full">
                <div>
                  <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                  <p className="text-gray-600 mt-2">Resumen de tu actividad y progreso</p>
                </div>
                <Button 
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="text-gray-600 border-gray-300"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Landing (Test)
                </Button>
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
