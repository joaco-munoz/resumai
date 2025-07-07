
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface CVBuilderHeaderProps {
  currentCvId: string | null;
  exportPDF: () => void;
  exportWord: () => void;
}

export const CVBuilderHeader = ({ currentCvId, exportPDF, exportWord }: CVBuilderHeaderProps) => {
  const { user } = useAuth();
  const [downloadCount, setDownloadCount] = useState(0);

  // Fetch download count
  const fetchDownloadCount = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature_type', 'pdf_export')
        .eq('period_start', new Date().toISOString().split('T')[0])
        .single();

      if (data && !error) {
        setDownloadCount(data.usage_count || 0);
      }
    } catch (error) {
      console.error('Error fetching download count:', error);
    }
  };

  useEffect(() => {
    fetchDownloadCount();
  }, [user?.id]);

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {currentCvId ? "Editar CV" : "Editor de CV"}
            </h1>
            <p className="text-gray-600 mt-2">
              {currentCvId ? "Modifica tu CV principal" : "Crea tu CV profesional optimizado para ATS"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF {downloadCount >= 1 && "(con marca de agua)"}
          </Button>
          <Button onClick={exportWord} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Word {downloadCount >= 1 && "(con marca de agua)"}
          </Button>
        </div>
      </div>
    </header>
  );
};
