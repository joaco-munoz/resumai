
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
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
              <DashboardStats />

              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Activity */}
              <RecentActivity />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
