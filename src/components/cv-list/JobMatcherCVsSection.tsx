import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CV } from "@/types/cv";
import { CVCard } from "./CVCard";

interface JobMatcherCVsSectionProps {
  cvs: CV[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isJobReport: (cv: CV) => boolean;
  formatDate: (date: string) => string;
  getScoreColor: (score?: number) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  onView: (cv: CV) => void;
  onEdit: (cv: CV) => void;
  onDownload: (cv: CV) => void;
  onDelete: (cv: CV) => void;
  onGoToJobMatcher: () => void;
}

export function JobMatcherCVsSection({
  cvs,
  searchTerm,
  onSearchChange,
  isJobReport,
  formatDate,
  getScoreColor,
  getStatusColor,
  getStatusLabel,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onGoToJobMatcher,
}: JobMatcherCVsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          CVs de Job Matcher
        </CardTitle>
        <p className="text-sm text-gray-600">
          CVs adaptados e informes de compatibilidad de ofertas de trabajo
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar CVs de Job Matcher..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {cvs.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes CVs de Job Matcher
            </h3>
            <p className="text-gray-500 mb-4">
              Los CVs adaptados e informes desde Job Matcher aparecerán aquí
            </p>
            <Button onClick={onGoToJobMatcher}>
              <Target className="h-4 w-4 mr-2" />
              Ir a Job Matcher
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-3">
              <div className="col-span-5">CV / Informe</div>
              <div className="col-span-2">Puntuación</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Actualizado</div>
              <div className="col-span-1"></div>
            </div>

            {cvs.map(cv => (
              <CVCard
                key={cv.id}
                cv={cv}
                isReport={isJobReport(cv)}
                formatDate={formatDate}
                getScoreColor={getScoreColor}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                onView={onView}
                onEdit={onEdit}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            ))}

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Mostrando 1 a {cvs.length} de {cvs.length} elementos de Job Matcher
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
