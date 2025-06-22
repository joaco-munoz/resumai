import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Target, FileText, MoreHorizontal, Eye, Edit, Download, Trash2 } from "lucide-react";
import { CV } from "@/types/cv";

interface CVCardProps {
  cv: CV;
  isReport: boolean;
  formatDate: (date: string) => string;
  getScoreColor: (score?: number) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  onView: (cv: CV) => void;
  onEdit: (cv: CV) => void;
  onDownload: (cv: CV) => void;
  onDelete: (cv: CV) => void;
}

export function CVCard({
  cv,
  isReport,
  formatDate,
  getScoreColor,
  getStatusColor,
  getStatusLabel,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: CVCardProps) {
  return (
    <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="col-span-5 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isReport ? 'bg-yellow-100' : 'bg-blue-100'}`}>
          {isReport ? (
            <Target className="h-5 w-5 text-yellow-600" />
          ) : (
            <FileText className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{cv.title}</h3>
          <p className="text-sm text-gray-500">
            {isReport ? "Informe de compatibilidad" : "CV adaptado"} - Creado {formatDate(cv.created_at)}
          </p>
        </div>
      </div>
      
      <div className="col-span-2">
        <Badge className={`${getScoreColor(cv.ai_score)} border-0`}>
          {cv.ai_score ? `${cv.ai_score}%` : "Sin evaluar"}
        </Badge>
      </div>
      
      <div className="col-span-2">
        <Badge className={`${getStatusColor(cv.status)} border-0`}>
          {getStatusLabel(cv.status)}
        </Badge>
      </div>
      
      <div className="col-span-2 flex items-center gap-1 text-sm text-gray-500">
        <Calendar className="h-4 w-4" />
        {formatDate(cv.last_updated || cv.created_at)}
      </div>
      
      <div className="col-span-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(cv)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </DropdownMenuItem>
            {!isReport && (
              <DropdownMenuItem onClick={() => onEdit(cv)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            {!isReport && (
              <DropdownMenuItem onClick={() => onDownload(cv)}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(cv)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
