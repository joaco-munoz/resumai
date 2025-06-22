
export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  skills: string[];
}

export interface CVBuilderProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  isImproving: string | null;
  improveWithAI: (section: string) => void;
  activeTab: string;
  completedSections: string[];
  goToNextTab: () => void;
  goToPreviousTab: () => void;
}
