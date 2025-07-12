
import { Home, FileText, Target, Folder, CheckSquare, User, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Inicio",
    url: "/app",
    icon: Home,
  },
  {
    title: "Editor de CV principal",
    url: "/app/cv-selector",
    icon: FileText,
  },
  {
    title: "Match de Ofertas",
    url: "/app/match",
    icon: Target,
  },
  {
    title: "Mis Currículums",
    url: "/app/cvs",
    icon: Folder,
  },
  {
    title: "Seguimiento de Postulaciones",
    url: "/app/kanban",
    icon: CheckSquare,
  },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <Sidebar className="w-[220px] border-r border-gray-200">
      <SidebarHeader className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#1E63FF] rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-[#1E63FF]">ResumAI</span>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
          Plan Gratuito
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 rounded-lg">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${
                          isActive
                            ? "bg-[#1E63FF] text-white"
                            : "text-[#334155] hover:bg-gray-50"
                        }`
                      }
                      end={item.url === "/app"}
                    >
                      <item.icon className={({ isActive }) => 
                        `h-5 w-5 ${isActive ? "text-white" : "text-[#667085]"}`
                      } />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#1E63FF] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">D</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Davitech</div>
            <div className="text-sm text-gray-500">davitech.dev@gmail.com</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <SidebarMenuButton asChild>
            <NavLink
              to="/app/profile"
              className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors w-full"
            >
              <User className="h-4 w-4" />
              <span>Mi Perfil</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton onClick={handleSignOut}>
            <div className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors w-full cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </div>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
