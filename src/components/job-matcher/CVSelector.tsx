
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CV {
  id: string;
  title: string;
  created_at: string;
}

interface CVSelectorProps {
  selectedCVId: string | null;
  onCVSelect: (cvId: string, cvTitle: string) => void;
  className?: string;
}

export const CVSelector = ({ selectedCVId, onCVSelect, className = "" }: CVSelectorProps) => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCVs();
  }, [user]);

  const loadCVs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cvs')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .eq('cv_source', 'editor')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading CVs:', error);
        toast.error('Error al cargar los CVs');
        return;
      }

      setCvs(data || []);
      
      // If no CV is selected and we have CVs, select the most recent one
      if (!selectedCVId && data && data.length > 0) {
        onCVSelect(data[0].id, data[0].title);
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
      toast.error('Error al cargar los CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (cvId: string) => {
    const selectedCV = cvs.find(cv => cv.id === cvId);
    if (selectedCV) {
      onCVSelect(cvId, selectedCV.title);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>Seleccionar CV</Label>
        <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>Seleccionar CV</Label>
        <div className="p-3 text-sm text-gray-500 bg-gray-50 rounded-md border">
          No tienes CVs guardados. Crea un CV primero desde el editor.
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="cv-selector">Seleccionar CV para el análisis</Label>
      <Select value={selectedCVId || ""} onValueChange={handleValueChange}>
        <SelectTrigger id="cv-selector">
          <SelectValue placeholder="Selecciona un CV..." />
        </SelectTrigger>
        <SelectContent>
          {cvs.map((cv) => (
            <SelectItem key={cv.id} value={cv.id}>
              {cv.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCVId && (
        <p className="text-xs text-gray-500">
          El análisis se realizará con el CV seleccionado
        </p>
      )}
    </div>
  );
};
