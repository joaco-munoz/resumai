import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CVData } from '@/types/cv';

const LOCAL_STORAGE_TAB_KEY = 'cv-editor-active-tab';

export const useCVBuilder = (cvData: CVData, setCvData: (data: CVData | ((prev: CVData) => CVData)) => void) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Load active tab from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem(LOCAL_STORAGE_TAB_KEY);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TAB_KEY, activeTab);
  }, [activeTab]);

  // Validation functions
  const validatePersonalInfo = () => {
    const { fullName, email, phone, location } = cvData.personalInfo;
    return fullName.trim() && email.trim() && phone.trim() && location.trim();
  };

  const validateSummary = () => {
    return cvData.summary.trim().length > 0;
  };

  const validateExperience = () => {
    return cvData.experience.length > 0 && cvData.experience.every(exp => 
      exp.position.trim() && exp.company.trim() && exp.startDate && exp.description.trim()
    );
  };

  const validateEducation = () => {
    return cvData.education.length > 0 && cvData.education.every(edu => 
      edu.degree.trim() && edu.institution.trim() && edu.year.trim()
    );
  };

  const validateSkills = () => {
    return cvData.skills.length > 0;
  };

  const getSectionValidation = () => {
    return {
      personal: validatePersonalInfo(),
      summary: validateSummary(),
      experience: validateExperience(),
      education: validateEducation(),
      skills: validateSkills()
    };
  };

  const getProgress = () => {
    return completedSections.length * 20;
  };

  // Tab navigation
  const goToNextTab = () => {
    const tabOrder = ['personal', 'summary', 'experience', 'education', 'skills'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const validations = getSectionValidation();
    
    if (!validations[activeTab as keyof typeof validations]) {
      toast.error("Por favor completa todos los campos requeridos antes de continuar");
      return;
    }

    if (!completedSections.includes(activeTab)) {
      setCompletedSections(prev => [...prev, activeTab]);
    }

    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    const tabOrder = ['personal', 'summary', 'experience', 'education', 'skills'];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  // Data handlers
  const handlePersonalInfoChange = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSummaryChange = (value: string) => {
    setCvData(prev => ({
      ...prev,
      summary: value
    }));
  };

  // Experience handlers
  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Education handlers
  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      year: '',
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Skills handlers
  const addSkill = (skillName?: string) => {
    if (skillName && skillName.trim() !== "") {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, skillName.trim()]
      }));
      return;
    }

    // Fallback to prompt (backward compatibility)
    const newSkill = prompt("Enter new skill:");
    if (newSkill && newSkill.trim() !== "") {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return {
    activeTab,
    setActiveTab,
    completedSections,
    setCompletedSections,
    getProgress,
    goToNextTab,
    goToPreviousTab,
    handlePersonalInfoChange,
    handleSummaryChange,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
    getSectionValidation
  };
};
