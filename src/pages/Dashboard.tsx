
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
  // Mock data for dashboard stats
  const mockStats = {
    cvsCreated: 3,
    applications: 12,
    interviews: 4,
    responseRate: 33
  };

  // Mock data for recent activities
  const mockActivities = [
    {
      id: '1',
      type: 'cv_created' as const,
      title: 'CV Desarrollador Frontend',
      date: 'Hace 2 días',
      status: 'Completado'
    },
    {
      id: '2',
      type: 'application_sent' as const,
      title: 'Aplicación a TechCorp',
      date: 'Hace 3 días'
    },
    {
      id: '3',
      type: 'interview_scheduled' as const,
      title: 'Entrevista con StartupXYZ',
      date: 'Hace 5 días',
      status: 'Programada'
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
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
              <DashboardStats stats={mockStats} />

              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Activity */}
              <RecentActivity activities={mockActivities} />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
