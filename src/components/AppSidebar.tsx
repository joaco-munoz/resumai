
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { 
  Home, 
  FileText, 
  Search, 
  Kanban, 
  User, 
  CreditCard,
  Shield,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/Logo - copia.png";

export function AppSidebar() {
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/app",
      icon: Home,
    },
    {
      title: "Editor de CV",
      url: "/cv-builder",
      icon: FileText,
    },
    {
      title: "Mis CVs",
      url: "/cvs",
      icon: FileText,
    },
    {
      title: "Job Matcher",
      url: "/job-matcher",
      icon: Search,
    },
    {
      title: "Seguimiento",
      url: "/kanban",
      icon: Kanban,
    },
    {
      title: "Perfil",
      url: "/profile",
      icon: User,
    },
    {
      title: "Facturación",
      url: "/billing",
      icon: CreditCard,
    },
  ];

  // Add admin menu item only for admin users
  if (isAdmin) {
    menuItems.push({
      title: "Panel Admin",
      url: "/admin",
      icon: Shield,
    });
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="ResumAI" className="w-8 h-8" />
          <span className="font-bold text-lg gradient-text">ResumAI</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      navigate(item.url);
                    }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
