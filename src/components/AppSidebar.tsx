
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { FileText, Target, User, CheckCircle, House, FolderOpen, LogOut, Crown, LayoutDashboard, Menu } from "lucide-react";
import Logo from "@/assets/Favicon.png";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, memo, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useAdmin } from "@/hooks/useAdmin";
import { useIsMobile } from "@/hooks/use-mobile";

const mainMenuItems = [
  { title: "Inicio", url: "/app", icon: House },
  { title: "Editor de CV principal", url: "/app/cv-selector", icon: FileText },
  { title: "Match de Ofertas", url: "/app/match", icon: Target },
  { title: "Mis Currículums", url: "/app/cvs", icon: FolderOpen },
  { title: "Seguimiento de Postulaciones", url: "/app/kanban", icon: CheckCircle },
];

const profileItem = { title: "Mi Perfil", url: "/app/profile", icon: User };

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

// Componente memorizado para el encabezado del sidebar
const SidebarHeader = memo(({ isCollapsed, isPremium, statusLoading, isMobile, toggleSidebar }: { 
  isCollapsed: boolean;
  isPremium: boolean;
  statusLoading: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}) => {
  return (
    <div className="p-4 pb-5 border-b">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="ResumAI logo" className="h-10 w-10" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-2xl gradient-text">ResumAI</span>
              {!statusLoading && (
                <Badge 
                  variant={isPremium ? "default" : "secondary"} 
                  className={`text-sm mt-1 ${
                    isPremium 
                      ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white" 
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isPremium ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Plan Pro
                    </>
                  ) : (
                    "Plan Gratuito"
                  )}
                </Badge>
              )}
            </div>
          )}
        </div>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar} 
            className="p-1"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
});

// Componente memorizado para los elementos de menú
const MenuItem = memo(({ item, isActive, isCollapsed, isMobile }: {
  item: typeof mainMenuItems[0];
  isActive: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
}) => {
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink 
          to={item.url} 
          className={({ isActive: navIsActive }) =>
            `flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${
              navIsActive 
                ? "bg-[#1E63FF] text-white font-medium" 
                : "text-[#334155] hover:bg-[#F1F5F9]"
            } ${isMobile ? "py-3" : ""} touch-manipulation`
          }
          end={item.url === "/app"}
        >
          <item.icon className={`${isMobile ? "h-5 w-5" : "h-4 w-4"} flex-shrink-0`} />
          {!isCollapsed && <span className={isMobile ? "text-base" : "text-sm"}>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

// Componente memorizado para el perfil de usuario
const UserProfile = memo(({ profile, user, getDisplayName, getInitials, isCollapsed }: {
  profile: Profile | null;
  user: any;
  getDisplayName: () => string;
  getInitials: (name: string | null) => string;
  isCollapsed: boolean;
}) => {
  if (isCollapsed || !user) return null;
  
  return (
    <div className="px-2 py-3 border-t">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || undefined} alt={getDisplayName()} />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {getDisplayName()}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
});

export function AppSidebar() {
  const sidebar = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { tier, isPremium, isLoading: statusLoading } = useSubscriptionStatus();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const currentPath = location.pathname;
  const [profile, setProfile] = useState<Profile | null>(null);
  const isMobile = useIsMobile();
  
  const isCollapsed = sidebar.state === "collapsed";
  
  // Auto-collapse sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      sidebar.setOpen(false);
    }
  }, [location.pathname, isMobile, sidebar]);
  
  const toggleSidebar = () => {
    sidebar.toggleSidebar();
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const isActive = (url: string) => {
    console.log(`Checking if ${url} is active. Current path: ${currentPath}`);
    
    if (url === "/app" && currentPath === "/app") {
      return true;
    }
    if (url === "/app/cv-selector" && currentPath.startsWith("/app/cv/")) {
      return true;
    }
    if (url !== "/app" && currentPath === url) {
      return true;
    }
    return false;
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.substring(0, 2).toUpperCase() || "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    return user?.email?.split('@')[0] || "Usuario";
  };

  // Memoizar funciones para evitar recreaciones en cada renderizado
  const getInitialsMemo = useMemo(() => {
    return (name: string | null) => {
      if (!name) return user?.email?.substring(0, 2).toUpperCase() || "U";
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };
  }, [user?.email]);

  const getDisplayNameMemo = useMemo(() => {
    return () => {
      if (profile?.full_name) {
        return profile.full_name;
      }
      return user?.email?.split('@')[0] || "Usuario";
    };
  }, [profile?.full_name, user?.email]);

  const isActiveMemo = useMemo(() => {
    return (url: string) => {
      if (url === "/app" && currentPath === "/app") {
        return true;
      }
      if (url === "/app/cv-selector" && currentPath.startsWith("/app/cv/")) {
        return true;
      }
      if (url !== "/app" && currentPath === url) {
        return true;
      }
      return false;
    };
  }, [currentPath]);

  // Renderizar los elementos del menú de forma memoizada
  const menuItems = useMemo(() => {
    return mainMenuItems.map((item) => (
      <MenuItem 
        key={item.url}
        item={item} 
        isActive={isActiveMemo(item.url)} 
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />
    ));
  }, [mainMenuItems, isActiveMemo, isCollapsed, isMobile]);

  return (
    <Sidebar
      className={`${isCollapsed ? (isMobile ? "w-16" : "w-14") : (isMobile ? "w-72" : "w-64")} transition-all duration-300 ease-in-out`}
    >
      {/* Usar el componente memorizado para el encabezado */}
      <SidebarHeader 
        isCollapsed={isCollapsed} 
        isPremium={isPremium} 
        statusLoading={statusLoading}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
      />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems}
              
              {/* Enlace al panel de administrador (solo visible para administradores) */}
              {isAdmin && !adminLoading && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/app/admin" 
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${
                          isActive
                            ? "bg-[#1E63FF] text-white font-medium" 
                            : "text-[#334155] hover:bg-[#F1F5F9]"
                        }`
                      }
                    >
                      <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm">Panel Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Usar el componente memorizado para el perfil de usuario */}
          <UserProfile 
            profile={profile} 
            user={user} 
            getDisplayName={getDisplayNameMemo} 
            getInitials={getInitialsMemo} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to={profileItem.url} 
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${
                    isActive
                      ? "bg-[#1E63FF] text-white font-medium" 
                      : "text-[#334155] hover:bg-[#F1F5F9]"
                  } ${isMobile ? "py-3" : ""} touch-manipulation`
                }
              >
                <profileItem.icon className={`${isMobile ? "h-5 w-5" : "h-4 w-4"} flex-shrink-0`} />
                {!isCollapsed && <span className={isMobile ? "text-base" : "text-sm"}>{profileItem.title}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                onClick={signOut}
                className={`w-full justify-start gap-2 rounded-md px-3 py-2 transition-colors duration-200 text-[#334155] hover:bg-[#F1F5F9] hover:text-[#334155] ${isMobile ? "h-12 py-3" : "h-10"} touch-manipulation`}
              >
                <LogOut className={`${isMobile ? "h-5 w-5" : "h-4 w-4"} flex-shrink-0`} />
                {!isCollapsed && <span className={isMobile ? "text-base" : "text-sm"}>Cerrar Sesión</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
