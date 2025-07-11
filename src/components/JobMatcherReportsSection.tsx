
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3 } from "lucide-react";
import { CVCard } from "./CVCard";

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

interface JobMatcherReportsSectionProps {
  jobMatcherReports: CV[];
  filteredJobMatcherReports: CV[];
  searchTerm: string;
  isMobile: boolean;
  renamingCVId: string | null;
  renamingTitle: string;
  savingRename: boolean;
  logoEditCvId: string | null;
  logoQuery: string;
  logoSuggestions: CompanySuggestion[];
  logoMap: Record<string, string>;
  onSearchChange: (term: string) => void;
  onGoToJobMatcher: () => void;
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

export const JobMatcherReportsSection = ({
  jobMatcherReports,
  filteredJobMatcherReports,
  searchTerm,
  isMobile,
  renamingCVId,
  renamingTitle,
  savingRename,
  logoEditCvId,
  logoQuery,
  logoSuggestions,
  logoMap,
  onSearchChange,
  onGoToJobMatcher,
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
}: JobMatcherReportsSectionProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Informes JobMatcher
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Tus análisis de compatibilidad de CVs con ofertas de trabajo
            </p>
          </div>
          <Button 
            onClick={onGoToJobMatcher}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Nuevo Análisis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search for Job Matcher Reports */}
        {jobMatcherReports.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar informes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 h-12 text-base w-full"
              />
            </div>
          </div>
        )}

        {filteredJobMatcherReports.length === 0 ? (
          <div className="text-center py-6 sm:py-12 px-3 sm:px-6">
            <BarChart3 className="h-14 w-14 text-gray-400 mx-auto mb-5" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              {jobMatcherReports.length === 0 ? "No tienes informes de Job Matcher" : "No se encontraron informes"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
              {jobMatcherReports.length === 0 
                ? "Crea tu primer informe comparando un CV con ofertas de trabajo" 
                : "Intenta con otro término de búsqueda"
              }
            </p>
            {jobMatcherReports.length === 0 && (
              <Button 
                onClick={onGoToJobMatcher} 
                size={isMobile ? "default" : "lg"}
                className="h-12 px-5 text-base font-medium"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Crear Primer Informe
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header - only on desktop */}
            {!isMobile && (
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-3">
                <div className="col-span-6">Informe</div>
                <div className="col-span-3">Creado</div>
                <div className="col-span-2">Actualizado</div>
                <div className="col-span-1"></div>
              </div>
            )}

            {/* Table Rows */}
            {filteredJobMatcherReports.map(cv => (
              <CVCard
                key={cv.id}
                cv={cv}
                isMobile={isMobile}
                isRenaming={renamingCVId === cv.id}
                renamingTitle={renamingTitle}
                savingRename={savingRename}
                logoEditCvId={logoEditCvId}
                logoQuery={logoQuery}
                logoSuggestions={logoSuggestions}
                logoMap={logoMap}
                onView={onView}
                onEdit={onEdit}
                onDownload={onDownload}
                onDelete={onDelete}
                onStartRename={onStartRename}
                onSaveRename={onSaveRename}
                onCancelRename={onCancelRename}
                onRenamingTitleChange={onRenamingTitleChange}
                onStartLogoEdit={onStartLogoEdit}
                onSelectLogo={onSelectLogo}
                onLogoQueryChange={onLogoQueryChange}
                onAddToTracking={() => {}} // Removed for job matcher reports
              />
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {filteredJobMatcherReports.length > 0 && (
          <div className="flex items-center justify-center sm:justify-between mt-5 sm:mt-6 pt-4 border-t">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Mostrando 1 a {filteredJobMatcherReports.length} de {filteredJobMatcherReports.length} elementos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
