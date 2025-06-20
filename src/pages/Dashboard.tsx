
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Home } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Bienvenido a tu espacio de trabajo</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Seguimiento de Postulaciones</h3>
                <p className="text-gray-600 mb-4">Gestiona y rastrea todas tus postulaciones laborales</p>
                <Button onClick={() => navigate("/app/kanban")} className="w-full">
                  Ver Kanban
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Mis CVs</h3>
                <p className="text-gray-600 mb-4">Revisa y gestiona todos tus currículums</p>
                <Button onClick={() => navigate("/app/cvs")} className="w-full">
                  Ver CVs
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Editor de CVs</h3>
                <p className="text-gray-600 mb-4">Crea y edita nuevos currículums</p>
                <Button onClick={() => navigate("/app/cv/new")} className="w-full">
                  Crear CV
                </Button>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
