
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CVData } from '@/types/cv';
import { useFeatureLimits } from '@/hooks/useFeatureLimits';
import { useAIUsage } from '@/contexts/AIUsageContext';

export const useAIImprovement = (cvData: CVData, setCvData: (data: CVData | ((prev: CVData) => CVData)) => void) => {
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const { canUseFeature, incrementUsage, isPro } = useFeatureLimits();
  const { refreshUsage } = useAIUsage();

  const improveWithAI = async (section: string) => {
    // Verificar si puede usar la feature
    if (!canUseFeature('ai_improvements')) {
      toast.error("Has alcanzado el límite de mejoras IA. Actualiza a Pro para uso ilimitado.");
      return;
    }

    setIsImproving(section);
    
    try {
      if (section === 'summary') {
        await improveSummary();
      } else if (section.startsWith('experience-')) {
        await improveBulletPoint(section);
      }
      
      // Incrementar el uso después de una mejora exitosa
      const success = await incrementUsage('ai_improvements');
      
      // Si se incrementó el uso correctamente, actualizar inmediatamente
      if (success) {
        await refreshUsage();
      }
    } catch (error) {
      console.error('Error improving with AI:', error);
      toast.error("Error al mejorar con IA. Verifica tu conexión.");
    } finally {
      setIsImproving(null);
    }
  };

  const improveSummary = async () => {
    const content = cvData.summary;
    const context = `Profesional: ${cvData.personalInfo.fullName}, Experiencia: ${cvData.experience.map(exp => `${exp.position} en ${exp.company}`).join(', ')}`;
    
    console.log('Calling improve-cv-content function for summary...');
    
    const { data, error } = await supabase.functions.invoke('improve-cv-content', {
      body: {
        content,
        context
      }
    });

    if (error) {
      throw error;
    }

    if (data?.improvedContent) {
      setCvData(prev => ({
        ...prev,
        summary: data.improvedContent
      }));
      toast.success('Resumen mejorado con IA');
    }
  };

  const improveBulletPoint = async (section: string) => {
    // Extract experience ID and bullet point index from section
    const parts = section.split('-');
    const expId = parts[1];
    const bulletIndex = parseInt(parts[2]);
    
    const experience = cvData.experience.find(exp => exp.id === expId);
    if (!experience) return;
    
    const bulletPoints = experience.description.split('\n');
    const bulletPoint = bulletPoints[bulletIndex];
    
    if (!bulletPoint || !bulletPoint.trim()) return;
    
    const context = `Posición: ${experience.position} en ${experience.company}`;
    
    console.log('Calling improve-bullet-point function...');
    
    const { data, error } = await supabase.functions.invoke('improve-bullet-point', {
      body: {
        bulletPoint,
        context
      }
    });

    if (error) {
      throw error;
    }

    if (data?.improvedBulletPoint) {
      const newBulletPoints = [...bulletPoints];
      newBulletPoints[bulletIndex] = data.improvedBulletPoint;
      
      setCvData(prev => ({
        ...prev,
        experience: prev.experience.map(exp => 
          exp.id === expId 
            ? { ...exp, description: newBulletPoints.join('\n') }
            : exp
        )
      }));
      
      toast.success('Bullet point mejorado con IA');
    }
  };

  return {
    isImproving,
    improveWithAI,
    isPro
  };
};
