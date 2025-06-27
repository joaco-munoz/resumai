import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Target } from "lucide-react";
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

interface JobMatcherCVsSectionProps {
  jobMatcherCVs: CV[];
  filteredJobMatcherCVs: CV[];
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

export const JobMatcherCVsSection = ({
  jobMatcherCVs,
  filteredJobMatcherCVs,
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
}: JobMatcherCVsSectionProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          Currículums del Match de Ofertas
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Currículums adaptados e informes de compatibilidad de ofertas de trabajo
        </p>
      </CardHeader>
      <CardContent>
        {/* Search for Job Matcher CVs */}
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar currículums del Match de Ofertas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

        {filteredJobMatcherCVs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {jobMatcherCVs.length === 0 ? "No tienes currículums del Match de Ofertas" : "No se encontraron currículums"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
              {jobMatcherCVs.length === 0 
                ? "Los currículums adaptados e informes desde Match de Ofertas aparecerán aquí" 
                : "Intenta con otro término de búsqueda"
              }
            </p>
            {jobMatcherCVs.length === 0 && (
              <Button onClick={onGoToJobMatcher} size={isMobile ? "default" : "lg"}>
                <Target className="h-4 w-4 mr-2" />
                Ir a Job Matcher
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header - only on desktop */}
            {!isMobile && (
              <div className="grid grid-cols-13 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-3">
                <div className="col-span-5">CV / Informe</div>
                <div className="col-span-3">Creado</div>
                <div className="col-span-3">Actualizado</div>
                <div className="col-span-1"></div>
                <div className="col-span-1"></div>
              </div>
            )}

            {/* Table Rows */}
            {filteredJobMatcherCVs.map(cv => (
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
                onAddToTracking={onAddToTracking}
              />
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {filteredJobMatcherCVs.length > 0 && (
          <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 border-t">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Mostrando 1 a {filteredJobMatcherCVs.length} de {filteredJobMatcherCVs.length} elementos de Match de Ofertas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
