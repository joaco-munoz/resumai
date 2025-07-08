import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAdmin } from '@/hooks/useAdmin';
import { downloadCVAsPDF } from '@/utils/pdfUtils';
import { downloadCVAsWord } from '@/utils/wordUtils';
import { toast } from 'sonner';

interface DownloadParams {
  cvData: any;
  filename: string;
  format: 'pdf' | 'word';
}

export const useDownloadManager = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscriptionStatus();
  const { isAdmin } = useAdmin();
  const [downloadCount, setDownloadCount] = useState(0);

  // Fetch current download count
  const fetchDownloadCount = useCallback(async (): Promise<number> => {
    if (!user?.id) return 0;
    
    try {
      const periodStart = new Date();
      periodStart.setDate(1); // First day of current month
      const periodStartStr = periodStart.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature_type', 'pdf_export')
        .eq('period_start', periodStartStr)
        .single();

      const count = data?.usage_count || 0;
      setDownloadCount(count);
      return count;
    } catch (error) {
      console.error('Error fetching download count:', error);
      return 0;
    }
  }, [user?.id]);

  // Increment download count
  const incrementDownloadCount = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      await supabase.rpc('increment_feature_usage', {
        p_user_id: user.id,
        p_feature_type: 'pdf_export'
      });
      setDownloadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  }, [user?.id]);

  // Main download function with watermark logic
  const downloadCV = useCallback(async ({ cvData, filename, format }: DownloadParams): Promise<void> => {
    if (!cvData) {
      toast.error("No se pudo descargar el CV");
      return;
    }

    try {
      // For premium users or admins, never add watermark
      if (isPremium || isAdmin) {
        if (format === 'pdf') {
          downloadCVAsPDF(cvData, filename, false);
          toast.success("CV descargado exitosamente!");
        } else {
          downloadCVAsWord(cvData, filename, false);
          toast.success("CV descargado exitosamente!");
        }
        return;
      }

      // For free users, check download count
      const currentCount = await fetchDownloadCount();
      const shouldAddWatermark = currentCount >= 1; // First download (count 0) = no watermark, from second (count 1+) = watermark

      // Download with or without watermark based on count
      if (format === 'pdf') {
        downloadCVAsPDF(cvData, filename, shouldAddWatermark);
      } else {
        downloadCVAsWord(cvData, filename, shouldAddWatermark);
      }

      // Increment count after successful download
      await incrementDownloadCount();

      // Show appropriate message
      if (shouldAddWatermark) {
        toast.info("CV descargado con marca de agua. Upgrade a Pro para descargas sin marca de agua.");
      } else {
        toast.success("CV descargado exitosamente!");
      }

    } catch (error) {
      const errorMessage = format === 'pdf' ? "Error al descargar el PDF" : "Error al descargar el documento Word";
      toast.error(errorMessage);
      console.error('Error downloading CV:', error);
    }
  }, [user?.id, isPremium, fetchDownloadCount, incrementDownloadCount]);

  // Helper function to determine if next download will have watermark (for UI display)
  const willNextDownloadHaveWatermark = useCallback(async (): Promise<boolean> => {
    if (isPremium || isAdmin) return false;
    const currentCount = await fetchDownloadCount();
    return currentCount >= 1;
  }, [isPremium, isAdmin, fetchDownloadCount]);

  return {
    downloadCount,
    downloadCV,
    fetchDownloadCount,
    willNextDownloadHaveWatermark
  };
};