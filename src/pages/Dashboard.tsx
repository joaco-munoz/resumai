
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to kanban by default
    navigate("/app/kanban", { replace: true });
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="text-center">
            <p className="text-lg text-gray-600">Redirigiendo al tablero...</p>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
