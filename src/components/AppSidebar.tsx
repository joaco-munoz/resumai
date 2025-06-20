
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
import { Sparkles, FileText, Target, User, CheckCircle, House, FolderOpen } from "lucide-react";

const mainMenuItems = [
  { title: "Dashboard", url: "/app", icon: House },
  { title: "Mis CVs", url: "/app/cvs", icon: FolderOpen },
  { title: "Editor de CVs", url: "/app/cv/new", icon: FileText },
  { title: "Job Matcher", url: "/app/match", icon: Target },
  { title: "Seguimiento Postulaciones", url: "/app/kanban", icon: CheckCircle },
];

const profileItem = { title: "Mi Perfil", url: "/app/profile", icon: User };

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

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

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg gradient-text">ResumAI</span>
          )}
        </div>
      </div>

      <SidebarTrigger className="m-2 self-start" />

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
                          ? "bg-blue-500 text-white font-medium hover:bg-blue-600" 
                          : "hover:bg-gray-100"
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to={profileItem.url} 
                className={isActive(profileItem.url)
                  ? "bg-blue-500 text-white font-medium hover:bg-blue-600" 
                  : "hover:bg-gray-100"
                }
              >
                <profileItem.icon className="h-4 w-4" />
                {!isCollapsed && <span>{profileItem.title}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
