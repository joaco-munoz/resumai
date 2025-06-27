
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Edit, Building2 } from "lucide-react";
import { Interview } from "@/hooks/useJobApplications";
import { formatInterviewDate, getCompanyLogoUrl, getCompanyInitial } from "@/utils/kanbanUtils";

interface JobApplicationCardProps {
  interview: Interview;
  onEdit: (interview: Interview) => void;
  isDragging?: boolean;
}

export const JobApplicationCard = ({ interview, onEdit, isDragging = false }: JobApplicationCardProps) => {
  const companyLogo = interview.company_logo || getCompanyLogoUrl(interview.company);

  return (
    <Card
      className={`mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 ${
        isDragging ? 'shadow-lg rotate-1' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={interview.company}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.display = 'none';
                      const fallback = img.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : (
                  <Building2 className="h-4 w-4 text-gray-500" />
                )}
                <span className="hidden w-full h-full items-center justify-center text-xs font-medium text-gray-600">
                  {getCompanyInitial(interview.company)}
                </span>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-gray-900">
                  {interview.position}
                </CardTitle>
                <CardDescription className="text-xs text-blue-600">
                  {interview.company}
                </CardDescription>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(interview);
            }}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {interview.location && (
            <p className="text-xs text-gray-500">{interview.location}</p>
          )}
          
          {interview.notes && (
            <p className="text-xs text-gray-600 line-clamp-2">{interview.notes}</p>
          )}
          
          {interview.interview_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {formatInterviewDate(interview.interview_date)}
            </div>
          )}
          
          {interview.interview_link && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs p-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(interview.interview_link, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Ver enlace
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
