import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

export const useCVsManager = () => {
  const [generalCV, setGeneralCV] = useState<CV | null>(null);
  const [jobMatcherCVs, setJobMatcherCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCVs = async () => {
    try {
      console.log('Loading CVs for user:', user?.id);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('id, title, status, created_at, last_updated, ai_score, content, cv_source')
        .eq('user_id', user?.id)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error loading CVs:', error);
        toast.error(`Error al cargar los CVs: ${error.message}`);
        return;
      }

      console.log('CVs loaded successfully:', data);
      
      // Separate CVs by source
      const editorCVs = data?.filter(cv => cv.cv_source === 'editor') || [];
      const matcherCVs = data?.filter(cv => cv.cv_source === 'job_matcher') || [];
      
      // Set the most recent editor CV as general CV
      setGeneralCV(editorCVs.length > 0 ? editorCVs[0] : null);
      setJobMatcherCVs(matcherCVs);
      
    } catch (error) {
      console.error('Error loading CVs:', error);
      toast.error("Error al cargar los CVs");
    } finally {
      setLoading(false);
    }
  };

  const deleteCV = async (cvId: string) => {
    try {
      console.log('Deleting CV:', cvId);
      
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvId);

      if (error) {
        console.error('Error deleting CV:', error);
        toast.error(`Error al eliminar el CV: ${error.message}`);
        return false;
      }

      console.log('CV deleted successfully');
      toast.success("CV eliminado exitosamente");
      loadCVs();
      return true;
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error("Error al eliminar el CV");
      return false;
    }
  };

  const renameCV = async (cvId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('cvs')
        .update({ title: newTitle.trim() })
        .eq('id', cvId);
      
      if (error) {
        console.error('Error renaming CV:', error);
        toast.error(`Error al renombrar el CV: ${error.message}`);
        return false;
      } else {
        toast.success("CV renombrado exitosamente");
        loadCVs();
        return true;
      }
    } catch (err) {
      console.error('Error renaming CV:', err);
      toast.error("Error al renombrar el CV");
      return false;
    }
  };

  const updateCVLogo = async (cv: CV, logoUrl: string) => {
    const newContent = { ...(cv.content || {}), company_logo: logoUrl };
    try {
      const { error } = await supabase
        .from('cvs')
        .update({ content: newContent })
        .eq('id', cv.id);
      
      if (error) {
        console.error('Error saving company logo:', error);
        toast.error(`Error al guardar el logo: ${error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving company logo:', err);
      toast.error('Error al guardar el logo');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadCVs();
    }
  }, [user]);

  return {
    generalCV,
    jobMatcherCVs,
    loading,
    loadCVs,
    deleteCV,
    renameCV,
    updateCVLogo
  };
};
