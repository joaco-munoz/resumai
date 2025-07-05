import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UsageLimits } from "@/components/UsageLimits";

const Dashboard = () => {
  const mockStats = {
    cvsCreated: 3,
    applications: 12,
    interviews: 2,
    responseRate: 25
  };

  const mockActivities = [
    {
      id: '1',
      type: 'cv_created',
      title: 'Nuevo CV creado',
      description: 'CV para Desarrollador Frontend',
      date: new Date().toISOString(),
      metadata: {}
    },
    {
      id: '2',
      type: 'application_sent',
      title: 'Aplicación enviada',
      description: 'Desarrollador React en TechCorp',
      date: new Date(Date.now() - 3600000).toISOString(),
      metadata: {}
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
                <p className="text-gray-600">Bienvenido a tu centro de control de CVs</p>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <DashboardStats stats={mockStats} />
                <QuickActions />
                <RecentActivity activities={mockActivities} />
              </div>
              <div className="space-y-6">
                <UsageLimits />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
