import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Calendar } from "lucide-react";

type ActivityType = 'cv_created' | 'application_sent' | 'interview_scheduled';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  status?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
}

export const RecentActivity = ({ activities, loading = false }: RecentActivityProps) => {
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'cv_created':
        return <FileText className="h-4 w-4 text-brand-500" />;
      case 'application_sent':
        return <Send className="h-4 w-4 text-success-500" />;
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionText = (type: ActivityType) => {
    switch (type) {
      case 'cv_created':
        return 'CV creado';
      case 'application_sent':
        return 'Aplicación enviada';
      case 'interview_scheduled':
        return 'Entrevista programada';
      default:
        return 'Actividad';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay actividad reciente</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                {getIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {getActionText(activity.type)} • {activity.date}
                  </p>
                </div>
                {activity.status && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
