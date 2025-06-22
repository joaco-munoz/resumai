import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus, FileText } from "lucide-react";
import { CV } from "@/types/cv";
import { CVCard } from "./CVCard";

interface GeneralCVSectionProps {
  generalCV: CV | null;
  isJobReport: (cv: CV) => boolean;
  formatDate: (date: string) => string;
  getScoreColor: (score?: number) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  onView: (cv: CV) => void;
  onEdit: (cv: CV) => void;
  onDownload: (cv: CV) => void;
  onDelete: (cv: CV) => void;
  onCreateNew: () => void;
}

export function GeneralCVSection({
  generalCV,
  isJobReport,
  formatDate,
  getScoreColor,
  getStatusColor,
  getStatusLabel,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onCreateNew,
}: GeneralCVSectionProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          CV Principal
        </CardTitle>
        <p className="text-sm text-gray-600">
          Tu CV principal que se actualiza cuando guardas desde el Editor de CVs
        </p>
      </CardHeader>
      <CardContent>
        {generalCV ? (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-3">
              <div className="col-span-5">CV</div>
              <div className="col-span-2">Puntuación</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Actualizado</div>
              <div className="col-span-1"></div>
            </div>
            <CVCard
              cv={generalCV}
              isReport={isJobReport(generalCV)}
              formatDate={formatDate}
              getScoreColor={getScoreColor}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              onView={onView}
              onEdit={onEdit}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes un CV Principal
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primer CV para que aparezca aquí como tu CV Principal
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Crear CV Principal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
