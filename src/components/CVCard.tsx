import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  Edit3, 
  Download, 
  Trash2, 
  MoreHorizontal, 
  Edit, 
  Check, 
  X, 
  Building2,
  ChevronDown,
  FileText,
  BarChart3,
  Star,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  onAddToTracking: (cv: CV) => void;
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
  onLogoQueryChange,
  onAddToTracking
}: CVCardProps) => {
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveRename();
    } else if (e.key === 'Escape') {
      onCancelRename();
    }
  };

  const isJobReportCV = isJobReport(cv);
  const currentLogo = logoMap[cv.id] || cv.content?.companyLogo;
  const isJobMatcherCV = cv.cv_source === 'job_matcher';

  if (isMobile) {
    return (
      <Card className="p-4 space-y-3 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Logo */}
            <div className="flex-shrink-0">
              {!isJobMatcherCV ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
              ) : currentLogo ? (
                <div className="relative group">
                  <img 
                    src={currentLogo} 
                    alt="Company logo" 
                    className="w-10 h-10 rounded object-contain bg-gray-50 dark:bg-gray-700 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => isJobMatcherCV && onStartLogoEdit(cv.id)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center">
                    <Edit className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() => isJobMatcherCV && onStartLogoEdit(cv.id)}
                >
                  <Building2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {isRenaming ? (
                <div className="flex gap-2 mb-2">
                  <Input
                    value={renamingTitle}
                    onChange={(e) => onRenamingTitleChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="text-sm h-8"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={onSaveRename}
                    disabled={savingRename}
                    className="h-8 px-2"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelRename}
                    disabled={savingRename}
                    className="h-8 px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  {isJobReportCV && (
                    <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                    {cv.title}
                  </h3>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {cv.status !== 'draft' && (
                  <Badge className={getStatusColor(cv.status)}>
                    {getStatusLabel(cv.status)}
                  </Badge>
                )}
                {cv.ai_score && (
                  <Badge className={getScoreColor(cv.ai_score)}>
                    {cv.ai_score}%
                  </Badge>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div>Creado: {formatDate(cv.created_at)}</div>
                <div>Actualizado: {formatDate(cv.last_updated)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isJobMatcherCV && (
              <Button
                size="sm"
                onClick={() => onAddToTracking(cv)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir a seguimiento
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(cv)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </DropdownMenuItem>
                {!isJobReportCV && (
                  <DropdownMenuItem onClick={() => onEdit(cv)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {!isJobReportCV && (
                  <>
                    <DropdownMenuSeparator />
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onStartRename(cv)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Renombrar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(cv)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Logo Edit Interface */}
        {isJobMatcherCV && logoEditCvId === cv.id && (
          <div className="border-t pt-3 space-y-3">
            <Input
              placeholder="Buscar empresa..."
              value={logoQuery}
              onChange={(e) => onLogoQueryChange(e.target.value)}
              className="text-sm"
            />
            
            {logoSuggestions.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {logoSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.domain}
                    onClick={() => onSelectLogo(cv, suggestion.logo)}
                    className="flex items-center gap-2 p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <img 
                      src={suggestion.logo} 
                      alt={suggestion.name}
                      className="w-6 h-6 object-contain flex-shrink-0"
                    />
                    <span className="text-sm truncate">{suggestion.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  // Desktop version
  return (
    <div className="grid grid-cols-13 gap-4 py-4 items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* CV Info Column */}
      <div className="col-span-5 flex items-center gap-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          {!isJobMatcherCV ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
              ) : currentLogo ? (
            <div className="relative group">
              <img 
                src={currentLogo} 
                alt="Company logo" 
                className="w-10 h-10 rounded object-contain bg-gray-50 dark:bg-gray-700 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => isJobMatcherCV && onStartLogoEdit(cv.id)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center">
                <Edit className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={() => isJobMatcherCV && onStartLogoEdit(cv.id)}
            >
              <Building2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex gap-2 items-center">
              <Input
                value={renamingTitle}
                onChange={(e) => onRenamingTitleChange(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-sm h-8"
                autoFocus
              />
              <Button
                size="sm"
                onClick={onSaveRename}
                disabled={savingRename}
                className="h-8 px-2"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelRename}
                disabled={savingRename}
                className="h-8 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isJobReportCV && (
                  <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {cv.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {cv.status !== 'draft' && (
                  <Badge className={getStatusColor(cv.status)}>
                    {getStatusLabel(cv.status)}
                  </Badge>
                )}
                {cv.ai_score && (
                  <Badge className={getScoreColor(cv.ai_score)}>
                    {cv.ai_score}%
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logo Edit Interface */}
        {isJobMatcherCV && logoEditCvId === cv.id && (
          <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 space-y-3">
            <Input
              placeholder="Buscar empresa..."
              value={logoQuery}
              onChange={(e) => onLogoQueryChange(e.target.value)}
              className="text-sm"
            />
            
            {logoSuggestions.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logoSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.domain}
                    onClick={() => onSelectLogo(cv, suggestion.logo)}
                    className="flex items-center gap-3 p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                  >
                    <img 
                      src={suggestion.logo} 
                      alt={suggestion.name}
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                    <span className="text-sm truncate">{suggestion.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Created Date Column */}
      <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(cv.created_at)}
      </div>

      {/* Updated Date Column */}
      <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(cv.last_updated)}
      </div>

      {/* Add to Tracking Column */}
      <div className="col-span-1 flex items-center justify-end">
        {isJobMatcherCV && (
          <Button
            size="sm"
            onClick={() => onAddToTracking(cv)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir a seguimiento
          </Button>
        )}
      </div>

      {/* Actions Column */}
      <div className="col-span-1 flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(cv)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </DropdownMenuItem>
            {!isJobReportCV && (
              <DropdownMenuItem onClick={() => onEdit(cv)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            {!isJobReportCV && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                      <ChevronDown className="h-3 w-3 ml-auto" />
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="left">
                    <DropdownMenuItem onClick={() => onDownload(cv, 'pdf')}>
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(cv, 'word')}>
                      Word
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStartRename(cv)}>
              <Edit className="h-4 w-4 mr-2" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(cv)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
