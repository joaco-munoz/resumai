
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
    <Sidebar className="w-[220px]" collapsible="icon">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1E63FF] rounded flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-[#1E63FF] text-lg">ResumAI</span>
            <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full inline-block mt-1">
              Plan Gratuito
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
                          isActive
                            ? "bg-[#1E63FF] text-white"
                            : "text-[#334155] hover:bg-gray-100"
                        }`
                      }
                      end={item.url === "/app"}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0`} />
                      <span className="group-data-[collapsible=icon]:hidden text-sm font-medium">
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            D
          </div>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-medium text-gray-900">Davitech</div>
            <div className="text-xs text-gray-500">davitech.dev@gmail.com</div>
          </div>
        </div>
        
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/app/profile"
                className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm"
              >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
