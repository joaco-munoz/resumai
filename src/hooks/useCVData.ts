import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVData } from "@/types/cv";

const LOCAL_STORAGE_KEY = 'cv-editor-data';
const SESSION_STORAGE_DRAFT_KEY = 'cv-editor-draft';

export const useCVData = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: cvId } = useParams();
  
  // Obtener el nombre completo del usuario desde su perfil
  const userFullName = user?.user_metadata?.full_name || '';
  
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: userFullName,
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: []
  });
  
  // Actualizar el nombre si cambia el usuario
  useEffect(() => {
    if (user?.user_metadata?.full_name && !cvData.personalInfo.fullName) {
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: user.user_metadata.full_name
        }
      }));
    }
  }, [user]);

  const [isLoading, setIsLoading] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [existingCvTitle, setExistingCvTitle] = useState<string | null>(null);

  // Save data to storage whenever cvData changes
  useEffect(() => {
    if (currentCvId) {
      // Persist edits for existing CVs in localStorage
      localStorage.setItem(`${LOCAL_STORAGE_KEY}-${currentCvId}`, JSON.stringify(cvData));
    } else {
      // Persist edits for a new (unsaved) CV draft - only keep in sessionStorage
      sessionStorage.setItem(SESSION_STORAGE_DRAFT_KEY, JSON.stringify(cvData));
    }
  }, [cvData, currentCvId]);

  // Load data from localStorage when component mounts or cvId changes
  useEffect(() => {
    console.log('useCVData - useEffect triggered with cvId:', cvId, 'user:', !!user);
    if (!user) return;

    // 1. If we have a specific CV ID, load that CV directly
    if (cvId && cvId !== 'new') {
      console.log('Loading specific CV with ID:', cvId);
      loadCV(cvId);
      return;
    }

    // 2. If we are creating a new CV, try to restore the session draft first
    console.log('useCVData - Creating new CV or no cvId. cvId:', cvId);
    if (!cvId || cvId === 'new') {
      const draft = sessionStorage.getItem(SESSION_STORAGE_DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setCvData(parsed);
          console.log('Draft CV loaded from sessionStorage');
        } catch (err) {
          console.error('Error parsing draft CV from sessionStorage', err);
        }
      }
      // Reset currentCvId for new CVs
      console.log('useCVData - Setting currentCvId to null for new CV, cvId:', cvId);
      setCurrentCvId(null);
      setExistingCvTitle(null);
      setIsLoading(false);
    }
  }, [cvId, user]);

  const loadCV = async (id: string) => {
    setIsLoading(true);
    try {
      console.log('Loading CV with ID:', id);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading CV:', error);
        toast.error(`Error al cargar el CV: ${error.message}`);
        navigate('/app/cvs');
        return;
      }

      if (data && data.content) {
        console.log('CV loaded successfully:', data);
        setCurrentCvId(data.id);
        setExistingCvTitle(data.title);
        
        // Check if we have unsaved local changes for this CV
        const localData = localStorage.getItem(`${LOCAL_STORAGE_KEY}-${id}`);
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            setCvData(parsedData);
            console.log('CV loaded from localStorage (unsaved changes preserved):', parsedData);
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
            setCvData(data.content as unknown as CVData);
          }
        } else {
          setCvData(data.content as unknown as CVData);
        }
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      toast.error("Error al cargar el CV");
      navigate('/app/cvs');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear the session draft when discarding
  const clearDraft = () => {
    sessionStorage.removeItem(SESSION_STORAGE_DRAFT_KEY);
  };

  return {
    cvData,
    setCvData,
    isLoading,
    currentCvId,
    existingCvTitle,
    clearDraft
  };
};
