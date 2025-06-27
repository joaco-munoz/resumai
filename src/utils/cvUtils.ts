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

export const getScoreColor = (score?: number) => {
  if (!score) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200";
};

export const getStatusColor = (status: string) => {
  return status === "active" 
    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200" 
    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
};

export const getStatusLabel = (status: string) => {
  return status === "active" ? "Activo" : "Borrador";
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return "ahora mismo";
  if (diffMinutes === 1) return "hace 1 minuto";
  if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
  
  if (diffHours === 1) return "hace 1 hora";
  if (diffHours < 24) return `hace ${diffHours} horas`;
  
  if (diffDays === 1) return "hace 1 día";
  if (diffDays < 30) return `hace ${diffDays} días`;
  
  if (diffDays < 365) return `hace ${Math.ceil(diffDays / 30)} meses`;
  return `hace ${Math.ceil(diffDays / 365)} años`;
};

export const isJobReport = (cv: CV) => {
  return cv.content?.type === 'job_report';
};

export const extractJobTitle = (title: string) => {
  return title.split(' - ')[1]?.split(' en ')[0] || "";
};

export const extractCompanyName = (title: string) => {
  return title.split(' en ')[1] || "";
};
