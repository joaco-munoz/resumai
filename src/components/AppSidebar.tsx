
import { Home, FileText, Search, BarChart3, User, Settings } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import LogoIcon from "./LogoIcon"
import { useAuth } from "@/contexts/AuthContext"
import { PlanBadge } from "./PlanBadge"
import { useFeatureLimits } from "@/hooks/useFeatureLimits"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },
  {
    title: "Mis CVs",
    url: "/app/cvs",
    icon: FileText,
  },
  {
    title: "Job Matcher",
    url: "/app/match",
    icon: Search,
  },
  {
    title: "Seguimiento",
    url: "/app/kanban",
    icon: BarChart3,
  },
  {
    title: "Mi Perfil",
    url: "/app/profile",
    icon: User,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { userPlan, isLoading } = useFeatureLimits()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/app')}
        >
          <LogoIcon className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-bold text-lg gradient-text">ResumAI</span>
            {!isLoading && (
              <PlanBadge plan={userPlan} className="text-xs mt-1" />
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-gray-500 text-center">
          <p>Usuario: {user?.email}</p>
          {!isLoading && (
            <PlanBadge plan={userPlan} className="mt-2 text-xs" />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
