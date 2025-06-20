
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
} from "@/components/ui/sidebar";
import { Sparkles, FileText, Target, User, CheckCircle, CreditCard } from "lucide-react";

const menuItems = [
  { title: "Tablero Kanban", url: "/app/kanban", icon: CheckCircle },
  { title: "Editor de CVs", url: "/app/cv/new", icon: FileText },
  { title: "Job Matcher", url: "/app/match", icon: Target },
  { title: "Mi Perfil", url: "/app/profile", icon: User },
  { title: "Facturación", url: "/app/billing", icon: CreditCard },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/app/cv/new" && currentPath.startsWith("/app/cv/")) {
      return true;
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-brand-100 text-brand-700 font-medium border-r-2 border-brand-500" : "hover:bg-gray-100";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg gradient-text">CVMaster AI</span>
          )}
        </div>
      </div>

      <SidebarTrigger className="m-2 self-start" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavCls({ isActive: isActive || isActive(item.url) })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
