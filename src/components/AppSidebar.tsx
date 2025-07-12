
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
    <Sidebar className="w-64 bg-white border-r border-gray-100 shadow-sm">
      <SidebarHeader className="px-6 py-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-gray-900">ResumAI</span>
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 text-xs text-gray-600 font-medium mt-1">
              Plan Gratuito
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 rounded-xl transition-all duration-200 hover:shadow-sm">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                      end={item.url === "/app"}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                          <span className="font-medium text-sm">{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-gray-50 bg-gray-25">
        <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl border border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            D
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">Davitech</div>
            <div className="text-xs text-gray-500 truncate">davitech.dev@gmail.com</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <SidebarMenuButton asChild>
            <NavLink
              to="/app/profile"
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 w-full text-sm"
            >
              <User className="h-4 w-4" />
              <span>Mi Perfil</span>
            </NavLink>
          </SidebarMenuButton>
          
          <SidebarMenuButton onClick={handleSignOut}>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 w-full cursor-pointer text-sm">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </div>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
