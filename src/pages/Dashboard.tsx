import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useKanbanStats, KanbanStatsProvider } from "@/contexts/KanbanStatsContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Componente interno que usa el hook useKanbanStats
function DashboardContent() {
  const { user } = useAuth();
  const { stats: kanbanStats } = useKanbanStats();
  const [cvsCount, setCvsCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(true);
  
  // Obtener el número real de CVs creados
  useEffect(() => {
    const fetchCVsCount = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('cvs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('cv_source', 'editor'); // Solo contar CVs creados por el usuario, no los informes
        
        if (error) {
          console.error('Error fetching CVs count:', error);
          return;
        }
        
        setCvsCount(count || 0);
      } catch (error) {
        console.error('Error fetching CVs count:', error);
      }
    };
    
    fetchCVsCount();
    
    // Suscribirse a cambios en la tabla de CVs
    const subscription = supabase
      .channel('cvs_count_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cvs',
          filter: `user_id=eq.${user?.id}` 
        }, 
        () => {
          // Actualizar conteo cuando haya cambios
          fetchCVsCount();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  
  // Obtener actividades recientes (CVs creados, postulaciones, entrevistas)
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user) return;
      
      setActivitiesLoading(true);
      
      try {
        // 1. Obtener CVs recientes
        const { data: recentCVs, error: cvsError } = await supabase
          .from('cvs')
          .select('id, title, created_at, cv_source')
          .eq('user_id', user.id)
          .eq('cv_source', 'editor')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (cvsError) {
          console.error('Error fetching recent CVs:', cvsError);
        }
        
        // 2. Obtener postulaciones recientes
        const { data: recentApplications, error: applicationsError } = await supabase
          .from('job_applications_tracking')
          .select('id, job_title, company_name, created_at, status')
          .eq('user_id', user.id)
          .eq('status', 'applied')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (applicationsError) {
          console.error('Error fetching recent applications:', applicationsError);
        }
        
        // 3. Obtener entrevistas recientes
        const { data: recentInterviews, error: interviewsError } = await supabase
          .from('job_applications_tracking')
          .select('id, job_title, company_name, created_at, status')
          .eq('user_id', user.id)
          .eq('status', 'interviewing')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (interviewsError) {
          console.error('Error fetching recent interviews:', interviewsError);
        }
        
        // Formatear los datos para el componente RecentActivity
        const formattedActivities = [
          ...(recentCVs || []).map(cv => ({
            id: cv.id,
            type: 'cv_created' as const,
            title: cv.title,
            date: formatRelativeTime(String(cv.created_at)),
            status: 'Completado'
          })),
          ...(recentApplications || []).map(app => ({
            id: app.id,
            type: 'application_sent' as const,
            title: `${app.job_title} en ${app.company_name}`,
            date: formatRelativeTime(String(app.created_at))
          })),
          ...(recentInterviews || []).map(interview => ({
            id: interview.id,
            type: 'interview_scheduled' as const,
            title: `${interview.job_title} en ${interview.company_name}`,
            date: formatRelativeTime(String(interview.created_at)),
            status: 'En proceso'
          }))
        ];
        
        // Guardamos el timestamp original para ordenar correctamente
        const activitiesWithTimestamp = formattedActivities.map(activity => {
          // Extraer la fecha original del objeto antes de formatearla
          const sourceObj = 
            activity.type === 'cv_created' ? recentCVs?.find(cv => cv.id === activity.id) :
            activity.type === 'application_sent' ? recentApplications?.find(app => app.id === activity.id) :
            recentInterviews?.find(int => int.id === activity.id);
          
          return {
            ...activity,
            timestamp: sourceObj ? new Date(String(sourceObj.created_at)).getTime() : 0
          };
        });
        
        // Ordenar por timestamp (más reciente primero)
        const sortedActivities = [...activitiesWithTimestamp]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)
          .map(({ timestamp, ...activity }) => activity); // Eliminar el campo timestamp adicional
        
        setRecentActivities(sortedActivities);
        
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };
    
    // Función auxiliar para formatear fechas relativas
    const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Hace unos segundos';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
      } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
      } else {
        const months = Math.floor(diffInSeconds / 2592000);
        return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
      }
    };
    
    fetchRecentActivities();
    
    // Suscribirse a cambios en las tablas relevantes
    const cvSubscription = supabase
      .channel('cvs_activity_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cvs',
          filter: `user_id=eq.${user?.id}` 
        }, 
        () => fetchRecentActivities()
      )
      .subscribe();
      
    const applicationSubscription = supabase
      .channel('job_applications_activity_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_applications_tracking',
          filter: `user_id=eq.${user?.id}` 
        }, 
        () => fetchRecentActivities()
      )
      .subscribe();
    
    return () => {
      cvSubscription.unsubscribe();
      applicationSubscription.unsubscribe();
    };
  }, [user]);
  
  // Combinamos los datos de kanbanStats con cvsCount
  const dashboardStats = {
    cvsCreated: cvsCount,
    applications: kanbanStats.applications,
    interviews: kanbanStats.interviews
  };

  return (
    <div className="min-h-screen flex w-full">
      <SidebarInset>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-bold text-3xl gradient-text mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bienvenido a tu panel de control. Aquí puedes gestionar tus CVs y ver tu progreso.
                </p>
              </div>

              {/* Stats */}
              <DashboardStats stats={dashboardStats} />

              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Activity */}
              <RecentActivity 
                activities={recentActivities} 
                loading={activitiesLoading}
              />
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

// Componente principal que envuelve DashboardContent con los providers necesarios
export default function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <KanbanStatsProvider>
        <DashboardContent />
      </KanbanStatsProvider>
    </SidebarProvider>
  );
}
