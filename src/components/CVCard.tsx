import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Star,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getScoreColor, getStatusColor, getStatusLabel, formatDate, isJobReport } from "@/utils/cvUtils";

interface CV {
  id: string;
  title: string;
  status: string;
  created_at: string;
  last_updated: string;
  ai_score?: number;
  content?: any;
  cv_source: string;
}

interface CompanySuggestion {
  name: string;
  logo: string;
  domain: string;
}

interface CVCardProps {
  cv: CV;
  isMobile: boolean;
  isRenaming: boolean;
  renamingTitle: string;
  savingRename: boolean;
  logoEditCvId: string | null;
  logoQuery: string;
  logoSuggestions: CompanySuggestion[];
  logoMap: Record<string, string>;
  onView: (cv: CV) => void;
  onEdit: (cv: CV) => void;
  onDownload: (cv: CV, format: 'pdf' | 'word') => void;
  onDelete: (cv: CV) => void;
  onStartRename: (cv: CV) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onRenamingTitleChange: (title: string) => void;
  onStartLogoEdit: (cvId: string) => void;
  onSelectLogo: (cv: CV, logoUrl: string) => void;
  onLogoQueryChange: (query: string) => void;
}

export const CVCard = ({
  cv,
  isMobile,
  isRenaming,
  renamingTitle,
  savingRename,
  logoEditCvId,
  logoQuery,
  logoSuggestions,
  logoMap,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onRenamingTitleChange,
  onStartLogoEdit,
  onSelectLogo,
  onLogoQueryChange
}: CVCardProps) => {
  const isReport = isJobReport(cv);
  
  const renderLogoSection = () => {
    if (cv.cv_source === 'editor') {
      return <Star className="h-5 w-5 text-yellow-400" />;
    }
    
    if (logoEditCvId === cv.id) {
      return (
        <div className="absolute inset-0 z-50 bg-white p-2 rounded shadow-lg w-64" onClick={(e) => e.stopPropagation()}>
          <Input
            placeholder="Buscar empresa..."
            value={logoQuery}
            onChange={(e) => onLogoQueryChange(e.target.value)}
            className="mb-2 h-8"
            autoFocus
          />
          <div className="max-h-40 overflow-y-auto space-y-1">
            {logoSuggestions.map(s => (
              <button
                key={s.domain}
                className="flex items-center w-full px-2 py-1 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                onClick={() => onSelectLogo(cv, s.logo)}
              >
                <img src={s.logo} alt={s.name} className="w-5 h-5 mr-2 rounded" />
                <span className="text-sm truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    if (logoMap[cv.id]) {
      return (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onStartLogoEdit(cv.id); }}>
          <img src={logoMap[cv.id]} alt={cv.title} className="w-8 h-8 object-contain" />
        </Button>
      );
    }
    
    return (
      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onStartLogoEdit(cv.id); }}>
        <Plus className="h-4 w-4" />
      </Button>
    );
  };

  const renderTitle = () => {
    if (isRenaming) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={renamingTitle}
            onChange={e => onRenamingTitleChange(e.target.value)}
            className="h-8 py-1"
            autoFocus
          />
          <Button size="sm" disabled={savingRename} onClick={onSaveRename}>
            Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={onCancelRename}>
            Cancelar
          </Button>
        </div>
      );
    }
    
    return <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{cv.title}</h3>;
  };

  const renderDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
        {cv.cv_source === 'job_matcher' && (
          <DropdownMenuItem onClick={() => onStartRename(cv)}>
            <Edit className="h-4 w-4 mr-2" />
            Renombrar
          </DropdownMenuItem>
        )}
        {!isReport && (
          <>
            <DropdownMenuItem onClick={() => onDownload(cv, 'pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(cv, 'word')}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Word
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem 
          className="text-red-600 dark:text-red-400"
          onClick={() => onDelete(cv)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className={`${isMobile ? 'space-y-3 p-4 border rounded-lg' : 'grid grid-cols-12 gap-4 items-center py-3'} border-b border-gray-100 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-lg transition-colors`}>
      <div className={`${isMobile ? 'w-full' : 'col-span-5'} flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 shrink-0 relative">
          {renderLogoSection()}
        </div>
        <div className="min-w-0 flex-1">
          {renderTitle()}
          {isReport ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Informe de compatibilidad</p>
          ) : cv.cv_source === 'job_matcher' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">CV adaptado</p>
          )}
        </div>
      </div>
      
      {isMobile ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${getScoreColor(cv.ai_score)} border-0 text-xs`}>
              {cv.ai_score ? `${cv.ai_score}%` : "Sin evaluar"}
            </Badge>
            <Badge className={`${getStatusColor(cv.status)} border-0 text-xs`}>
              {getStatusLabel(cv.status)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(cv.last_updated || cv.created_at)}
            </span>
            {renderDropdownMenu()}
          </div>
        </div>
      ) : (
        <>
          <div className="col-span-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            {formatDate(cv.created_at)}
          </div>
          
          <div className="col-span-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            {formatDate(cv.last_updated || cv.created_at)}
          </div>
          
          <div className="col-span-1 flex justify-end">
            {renderDropdownMenu()}
          </div>
        </>
      )}
    </div>
  );
};
