
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import Dock from "@/components/ui/Dock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVPreview } from "@/components/cv-builder/CVPreview";
import { CVData } from "@/types/cv";

interface CV {
  id: string;
  title: string;
  content: CVData;
  is_favorite: boolean;
  created_at: string;
  last_updated: string;
}

const CVSelector = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<string>("");
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
    try {
      const { data, error } = await supabase
        .from('cvs')
        .select('id, title, content, is_favorite, created_at, last_updated')
        .eq('user_id', user?.id)
        .eq('cv_source', 'editor')
        .order('is_favorite', { ascending: false })
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error loading CVs:', error);
        toast.error("Error al cargar los CVs");
        return;
      }

      const sortedCVs = (data || []).map(cv => ({
        ...cv,
        content: cv.content as unknown as CVData
      }));
      setCvs(sortedCVs);

      // Auto-select favorite CV or first CV
      if (sortedCVs.length > 0) {
        const favoriteCV = sortedCVs.find(cv => cv.is_favorite);
        const defaultCV = favoriteCV || sortedCVs[0];
        setSelectedCVId(defaultCV.id);
        setSelectedCV(defaultCV);
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
      toast.error("Error al cargar los CVs");
    } finally {
      setLoading(false);
    }
  };

  const handleCVSelection = (cvId: string) => {
    const cv = cvs.find(c => c.id === cvId);
    if (cv) {
      setSelectedCVId(cvId);
      setSelectedCV(cv);
    }
  };

  const handleNext = () => {
    if (selectedCVId) {
      navigate(`/app/cv-builder/${selectedCVId}`);
    }
  };

  const handleCreateNew = () => {
    console.log('Creating new CV');
    // Navigate to editor with 'new' to create a blank CV
    // This matches the behavior in CVsList.tsx
    navigate("/app/cv-builder/new");
  };

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando CVs...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gray-50 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Seleccionar CV para Editar</h1>
            <p className="text-gray-600 mt-2">Elige el CV que deseas editar o crea uno nuevo</p>
          </div>

          <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Left Panel - CV List */}
            <div className="w-1/3 flex flex-col">
              <Card className="flex-1 bg-white">
                <CardContent className="p-4">
                  {cvs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No tienes CVs creados</p>
                      <Button onClick={handleCreateNew} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Crear Primer CV
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      <RadioGroup value={selectedCVId} onValueChange={handleCVSelection}>
                        {cvs.map((cv) => (
                          <div key={cv.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value={cv.id} id={cv.id} />
                            <Label htmlFor={cv.id} className="flex-1 cursor-pointer flex items-center gap-2">
                              <span className="flex-1">{cv.title}</span>
                              {cv.is_favorite && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {cvs.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <Button 
                        onClick={handleNext} 
                        className="w-full"
                        disabled={!selectedCVId}
                      >
                        Siguiente
                      </Button>
                      <Button 
                        onClick={handleCreateNew} 
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Crear Nuevo CV
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - CV Preview */}
            <div className="flex-1">
              <Card className="h-full bg-white">
                <CardContent className="p-6 h-full overflow-y-auto">
                  {selectedCV ? (
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-gray-900">
                        Vista previa: {selectedCV.title}
                      </h2>
                      <CVPreview cvData={selectedCV.content} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Selecciona un CV para ver la vista previa</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
      </main>
      
      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </>
  );
};

export default CVSelector;
