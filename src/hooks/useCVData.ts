import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVData } from "@/types/cv";

export const useCVData = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: cvId } = useParams();
  
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: 'Andrés Hernandez',
      email: 'andres.hernandez@gmail.com',
      phone: '+569 9876 5432',
      location: 'Valparaíso, Chile',
      linkedin: 'linkedin.com/in/andreshernandez',
      website: 'juanperez.dev'
    },
    summary: 'Desarrollador Frontend con 3+ años de experiencia en React, TypeScript y Node.js. Especializado en crear aplicaciones web modernas y escalables.',
    experience: [
      {
        id: '1',
        position: 'Frontend Developer',
        company: 'TechCorp',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: '• Desarrollé aplicaciones React con TypeScript\n• Implementé arquitecturas escalables\n• Colaboré con equipos multidisciplinarios'
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Ingeniería Informática',
        institution: 'Universidad Politécnica de Madrid',
        year: '2020',
        description: 'Especialización en Desarrollo de Software'
      }
    ],
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'SQL', 'Git', 'Docker']
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (cvId && cvId !== 'new') {
        loadCV(cvId);
      } else {
        loadLastCV();
      }
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
        setCvData(data.content as unknown as CVData);
        setCurrentCvId(data.id);
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      toast.error("Error al cargar el CV");
      navigate('/app/cvs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastCV = async () => {
    setIsLoading(true);
    try {
      console.log('Loading last saved CV for user:', user?.id);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('cv_source', 'editor')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading last CV:', error);
        toast.error(`Error al cargar el último CV: ${error.message}`);
        return;
      }

      if (data && data.content) {
        console.log('Last CV loaded successfully:', data);
        setCvData(data.content as unknown as CVData);
        setCurrentCvId(data.id);
        navigate(`/app/cv/${data.id}`, { replace: true });
      } else {
        console.log('No CVs found, keeping default data');
        setCurrentCvId(null);
      }
    } catch (error) {
      console.error('Error loading last CV:', error);
      toast.error("Error al cargar el último CV");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCV = async () => {
    if (!user) {
      toast.error("Debes estar autenticado para guardar el CV");
      return;
    }

    try {
      const cvTitle = `CV - ${cvData.personalInfo.fullName}`;
      
      // Always update or create a CV with cv_source = 'editor' (General CV)
      const { data: existingCV, error: searchError } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .eq('cv_source', 'editor')
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing CV:', searchError);
      }

      let result;

      if (existingCV) {
        // Update existing general CV
        result = await supabase
          .from('cvs')
          .update({
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern',
            last_updated: new Date().toISOString()
          })
          .eq('id', existingCV.id)
          .select();
        
        setCurrentCvId(existingCV.id);
      } else {
        // Create new general CV
        result = await supabase
          .from('cvs')
          .insert({
            user_id: user.id,
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern',
            cv_source: 'editor'
          })
          .select();

        if (result.data && result.data[0]) {
          setCurrentCvId(result.data[0].id);
          navigate(`/app/cv/${result.data[0].id}`, { replace: true });
        }
      }

      if (result.error) {
        console.error('Error saving CV:', result.error);
        toast.error(`Error al guardar el CV: ${result.error.message}`);
        return;
      }
      
      toast.success("CV principal guardado exitosamente");
      navigate("/app/cvs");
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error("Error al guardar el CV");
    }
  };

  const saveAndAdapt = async () => {
    if (!user) {
      toast.error("Debes estar autenticado para guardar el CV");
      return;
    }

    try {
      const cvTitle = `CV - ${cvData.personalInfo.fullName}`;
      
      // First save as general CV (same logic as saveCV)
      const { data: existingCV, error: searchError } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .eq('cv_source', 'editor')
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing CV:', searchError);
      }

      let result;

      if (existingCV) {
        // Update existing general CV
        result = await supabase
          .from('cvs')
          .update({
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern',
            last_updated: new Date().toISOString()
          })
          .eq('id', existingCV.id)
          .select();
        
        setCurrentCvId(existingCV.id);
      } else {
        // Create new general CV
        result = await supabase
          .from('cvs')
          .insert({
            user_id: user.id,
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern',
            cv_source: 'editor'
          })
          .select();

        if (result.data && result.data[0]) {
          setCurrentCvId(result.data[0].id);
        }
      }

      if (result.error) {
        console.error('Error saving CV:', result.error);
        toast.error(`Error al guardar el CV: ${result.error.message}`);
        return;
      }
      
      toast.success("CV principal guardado exitosamente");
      navigate("/app/match");
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error("Error al guardar el CV");
    }
  };

  return {
    cvData,
    setCvData,
    isLoading,
    currentCvId,
    saveCV,
    saveAndAdapt
  };
};
