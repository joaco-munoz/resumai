import { Interview } from '@/hooks/useJobApplications';

export const filterInterviews = (
  interviews: Interview[],
  searchTerm: string,
  statusFilter: string
): Interview[] => {
  return interviews.filter(interview => {
    const matchesSearch = interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export const formatInterviewDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES');
};

export const getCompanyLogoUrl = (companyName: string): string => {
  return `https://logo.clearbit.com/${companyName.replace(/\s+/g, '').toLowerCase()}.com`;
};

export const getCompanyInitial = (companyName: string): string => {
  return companyName.charAt(0).toUpperCase();
};
