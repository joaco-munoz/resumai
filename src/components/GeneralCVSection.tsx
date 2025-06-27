import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, User } from "lucide-react";
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

interface GeneralCVSectionProps {
  generalCV: CV | null;
  isMobile: boolean;
  renamingCVId: string | null;
  renamingTitle: string;
  savingRename: boolean;
  logoEditCvId: string | null;
  logoQuery: string;
  logoSuggestions: CompanySuggestion[];
  logoMap: Record<string, string>;
  onCreateCV: () => void;
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

export const GeneralCVSection = ({
  generalCV,
  isMobile,
  renamingCVId,
  renamingTitle,
  savingRename,
  logoEditCvId,
  logoQuery,
  logoSuggestions,
  logoMap,
  onCreateCV,
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
}: GeneralCVSectionProps) => {
  return (
    <Card className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Currículum Principal
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tu Currículum principal que se actualiza cuando guardas desde el Editor de Currículums
        </p>
      </CardHeader>
      <CardContent>
        {generalCV ? (
          <div className="space-y-4">
            {!isMobile && (
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-3">
                <div className="col-span-5">CV</div>
                <div className="col-span-3">Creado</div>
                <div className="col-span-3">Actualizado</div>
                <div className="col-span-1"></div>
              </div>
            )}
            <CVCard
              cv={generalCV}
              isMobile={isMobile}
              isRenaming={renamingCVId === generalCV.id}
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
            />
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No tienes un CV Principal
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
              Crea tu primer CV para que aparezca aquí como tu CV Principal
            </p>
            <Button onClick={onCreateCV} size={isMobile ? "default" : "lg"}>
              <Plus className="h-4 w-4 mr-2" />
              Crear CV Principal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
