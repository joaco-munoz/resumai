import { useState, useEffect } from "react";
import { Plus, FileText, Calendar, Download, Eye, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CVPreviewModal } from "@/components/CVPreviewModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";
import { useDownloadManager } from "@/hooks/useDownloadManager";
import Dock from "@/components/ui/Dock";
import HeaderBrand from "@/components/HeaderBrand";

export default function CVsList() {
  const [cvs, setCvs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { downloadFile } = useDownloadManager();

  useEffect(() => {
    fetchCVs();
  }, [user]);

  const fetchCVs = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching CVs:", error);
        toast.error("Error al cargar los currículums");
        return;
      }

      setCvs(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/app/cv-builder');
  };

  const handleEdit = (cvId: string) => {
    navigate(`/app/cv-builder/${cvId}`);
  };

  const handlePreview = (cv: any) => {
    setSelectedCv(cv);
    setIsModalOpen(true);
  };

  const handleDelete = (cv: any) => {
    setCvToDelete(cv);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cvToDelete) return;

    try {
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvToDelete.id);

      if (error) {
        console.error("Error deleting CV:", error);
        toast.error("Error al eliminar el currículum");
        return;
      }

      setCvs(cvs.filter(cv => cv.id !== cvToDelete.id));
      toast.success("Currículum eliminado exitosamente");
    } finally {
      setIsDeleteModalOpen(false);
      setCvToDelete(null);
    }
  };

  const downloadCV = async (cv: any) => {
    if (!cv?.cv_json) {
      toast.error("No se puede descargar este currículum");
      return;
    }
    
    try {
      const jsonString = JSON.stringify(cv.cv_json);
      const blob = new Blob([jsonString], { type: "application/json" });
      downloadFile(blob, `${cv.title}.json`);
      toast.success("Descargando currículum...");
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("Error al descargar el currículum");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <HeaderBrand />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="font-bold text-3xl gradient-text mb-2">
            Mis Currículums
          </h1>
          <p className="text-gray-600">
            Gestiona todos tus currículums desde aquí
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Nuevo
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando currículums...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map(cv => (
              <Card key={cv.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4 mr-1" />
                    {cv.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Creado: {new Date(cv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {cv.is_template && (
                    <Badge variant="secondary">
                      <FileText className="h-3 w-3 mr-1" />
                      Plantilla
                    </Badge>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(cv)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Vista Previa
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => downloadCV(cv)}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cv.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cv)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CVPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cvData={selectedCv?.cv_json}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemType="currículum"
          itemName={cvToDelete?.title}
        />
      </div>

      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}
