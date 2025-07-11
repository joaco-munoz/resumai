
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Calendar, TrendingUp, Plus, FilePlus, CheckCircle, Folder, Target, File } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  // Mock data for dashboard stats
  const stats = {
    cvsCreated: 5,
    applications: 0,
    interviews: 0,
    responseRate: 0
  };

  // Mock data for recent activities
  const activities = [
    {
      id: '1',
      type: 'cv_created',
      title: 'CV sin título',
      subtitle: 'CV creado • 10/7/2025',
      status: 'Completado'
    },
    {
      id: '2',
      type: 'cv_created',
      title: 'Informe - Posición en Empresa',
      subtitle: 'CV creado • 10/7/2025',
      status: 'Completado'
    },
    {
      id: '3',
      type: 'cv_created',
      title: 'David Poblete',
      subtitle: 'CV creado • 10/7/2025',
      status: 'Completado'
    },
    {
      id: '4',
      type: 'application_sent',
      title: 'David Poblete',
      subtitle: 'Aplicación enviada • 10/7/2025',
      status: 'saved'
    }
  ];

  const quickActions = [
    {
      title: "Crear Nuevo CV",
      icon: FilePlus,
      action: () => navigate("/app/cv-selector")
    },
    {
      title: "Ver Mis CVs",
      icon: Folder,
      action: () => navigate("/app/cvs")
    },
    {
      title: "Seguimiento",
      icon: CheckCircle,
      action: () => navigate("/app/kanban")
    },
    {
      title: "Match de ofertas",
      icon: Target,
      action: () => navigate("/app/match")
    }
  ];

  const getActivityIcon = (type: string) => {
    if (type === 'cv_created') {
      return <File className="h-4 w-4 text-[#1E63FF]" />;
    }
    return <Send className="h-4 w-4 text-green-500" />;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-[#F8FAFC] p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-bold text-4xl text-[#1E63FF] mb-2">
                  Dashboard
                </h1>
                <p className="text-[#475569] text-lg">
                  Resumen de tu actividad y progreso
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white border border-gray-200 rounded-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Curriculums Creados</CardTitle>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#2563EB] mb-1">{stats.cvsCreated}</div>
                    <p className="text-sm text-gray-500">Total de currículums</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Postulaciones</CardTitle>
                    <Send className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#16A34A] mb-1">{stats.applications}</div>
                    <p className="text-sm text-gray-500">Postulaciones enviadas</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Entrevistas</CardTitle>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#D97706] mb-1">{stats.interviews}</div>
                    <p className="text-sm text-gray-500">Entrevistas conseguidas</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Tasa de Respuesta</CardTitle>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#2563EB] mb-1">{stats.responseRate}%</div>
                    <p className="text-sm text-gray-500">Respuestas positivas</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Acciones Rápidas
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.action}
                        variant="outline"
                        className="h-auto p-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 justify-start"
                      >
                        <action.icon className="h-5 w-5 mr-3 text-gray-500" />
                        <span className="text-sm font-medium">{action.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900">
                    Actividad Reciente
                  </h2>
                  <Card className="bg-white border border-gray-200 rounded-lg">
                    <CardContent className="p-6">
                      {activities.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay actividad reciente</p>
                      ) : (
                        <div className="space-y-4">
                          {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getActivityIcon(activity.type)}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                  <p className="text-xs text-gray-500">{activity.subtitle}</p>
                                </div>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="bg-gray-100 text-[#1E63FF] text-xs border-0"
                              >
                                {activity.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
