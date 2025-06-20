
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Mock data for CVs
const mockCVs = [
  {
    id: "1",
    title: "CV - Desarrollador Frontend",
    score: 85,
    createdAt: "hace 5 días",
    updatedAt: "hace 2 días",
    status: "Activo"
  },
  {
    id: "2", 
    title: "CV - Data Analyst",
    score: 92,
    createdAt: "hace 12 días",
    updatedAt: "hace 8 días",
    status: "Activo"
  },
  {
    id: "3",
    title: "CV - Product Manager",
    score: 78,
    createdAt: "hace 20 días", 
    updatedAt: "hace 15 días",
    status: "Borrador"
  }
];

export default function CVsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredCVs = mockCVs.filter(cv => 
    cv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusColor = (status: string) => {
    return status === "Activo" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mis CVs</h1>
                  <p className="text-gray-600 mt-2">
                    Una lista de todos tus currículums, mostrando título, puntuación y fecha de creación.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => navigate("/app/cv/new")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear CV
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar currículums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* CVs Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Currículums
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-3">
                      <div className="col-span-5">CV</div>
                      <div className="col-span-2">Puntuación</div>
                      <div className="col-span-2">Estado</div>
                      <div className="col-span-2">Actualizado</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Table Rows */}
                    {filteredCVs.map((cv) => (
                      <div key={cv.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{cv.title}</h3>
                            <p className="text-sm text-gray-500">Creado {cv.createdAt}</p>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <Badge className={`${getScoreColor(cv.score)} border-0`}>
                            {cv.score}%
                          </Badge>
                        </div>
                        
                        <div className="col-span-2">
                          <Badge className={`${getStatusColor(cv.status)} border-0`}>
                            {cv.status}
                          </Badge>
                        </div>
                        
                        <div className="col-span-2 flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {cv.updatedAt}
                        </div>
                        
                        <div className="col-span-1 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/app/cv/${cv.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Info */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Mostrando 1 a {filteredCVs.length} de {filteredCVs.length} CVs
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
