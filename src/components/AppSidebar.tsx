
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
  { title: "Dashboard", url: "", icon: House },
  { title: "Mis CVs", url: "/app/cvs", icon: FolderOpen },
  { title: "Editor de CVs", url: "/app/cv/new", icon: FileText },
  { title: "Job Matcher", url: "/app/match", icon: Target },
  { title: "Seguimiento Postulaciones", url: "/app/kanban", icon: CheckCircle }
];

const profileItem = { title: "Mi Perfil", url: "/app/profile", icon: User };

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/app/cv/new" && currentPath.startsWith("/app/cv/")) {
      return true;
    }
    if (path === "/app/cvs" && currentPath === "/app/cvs") {
      return true;
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-brand-100 text-brand-700 font-medium border-r-2 border-brand-500" : "hover:bg-gray-100";

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
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive: linkIsActive }) => getNavCls({ isActive: linkIsActive || isActive(item.url) })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                className={({ isActive: linkIsActive }) => getNavCls({ isActive: linkIsActive || isActive(profileItem.url) })}
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
