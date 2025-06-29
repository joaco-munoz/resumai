
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { FileText, Target, User, CheckCircle, House, FolderOpen, LogOut } from "lucide-react";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const mainMenuItems = [
  { title: "Inicio", url: "/app", icon: House },
  { title: "Mis Currículums", url: "/app/cvs", icon: FolderOpen },
  { title: "Editor de CV principal", url: "/app/cv/new", icon: FileText },
  { title: "Match de Ofertas", url: "/app/match", icon: Target },
  { title: "Seguimiento de Postulaciones", url: "/app/kanban", icon: CheckCircle },
];

const profileItem = { title: "Mi Perfil", url: "/app/profile", icon: User };

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const currentPath = location.pathname;
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const isCollapsed = state === "collapsed";

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
    if (url === "/app/cv/new" && currentPath.startsWith("/app/cv/")) {
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

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <img src={Logo} alt="ResumAI logo" className="h-10 w-10" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg gradient-text">ResumAI</span>
          )}
        </div>
      </div>

      {/*<SidebarTrigger className="m-2 self-start" />*/}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const active = isActive(item.url);
                console.log(`${item.title} is ${active ? 'active' : 'inactive'}`);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={active 
                          ? "bg-blue-500 text-white font-medium" 
                          : "text-gray-700"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* User Profile Section */}
          {!isCollapsed && user && (
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
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to={profileItem.url} 
                className={isActive(profileItem.url)
                  ? "bg-blue-500 text-white font-medium" 
                  : "text-gray-700"
                }
              >
                <profileItem.icon className="h-4 w-4" />
                {!isCollapsed && <span>{profileItem.title}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start h-10 px-2 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Cerrar Sesión</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
