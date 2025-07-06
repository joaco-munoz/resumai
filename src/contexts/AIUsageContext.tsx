import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFeatureLimits } from '@/hooks/useFeatureLimits';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AIUsageContextType {
  animatedUsage: {
    ai_improvements: number;
    job_matcher_advanced: number;
    cv_creation: number;
    pdf_export: number;
  };
  refreshUsage: () => Promise<void>;
}

const AIUsageContext = createContext<AIUsageContextType | undefined>(undefined);

export const AIUsageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usage, refreshLimits } = useFeatureLimits();
  const { user } = useAuth();
  const [animatedUsage, setAnimatedUsage] = useState(usage);
  
  // Función para actualizar el uso de IA inmediatamente
  const refreshUsage = async () => {
    await refreshLimits();
  };
  
  // Suscribirse a los cambios en la tabla user_usage
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('user_usage_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_usage',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Cuando hay un cambio en la tabla user_usage, actualizar los límites
        refreshUsage();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Efecto para animar los cambios en el uso de IA
  useEffect(() => {
    // Para cada tipo de uso, animar el cambio si es diferente
    Object.keys(usage).forEach((key) => {
      const usageKey = key as keyof typeof usage;
      if (usage[usageKey] !== animatedUsage[usageKey]) {
        // Animación suave para incrementar el valor
        const startValue = animatedUsage[usageKey];
        const endValue = usage[usageKey];
        const duration = 1000; // 1 segundo de duración
        const startTime = Date.now();
        
        const animateValue = () => {
          const now = Date.now();
          const elapsedTime = now - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          
          // Función de easing para hacer la animación más natural
          const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic easing out
          
          const currentValue = startValue + (endValue - startValue) * easedProgress;
          
          setAnimatedUsage(prev => ({
            ...prev,
            [usageKey]: Math.round(currentValue)
          }));
          
          if (progress < 1) {
            requestAnimationFrame(animateValue);
          }
        };
        
        requestAnimationFrame(animateValue);
      }
    });
  }, [usage]);

  return (
    <AIUsageContext.Provider value={{ animatedUsage, refreshUsage }}>
      {children}
    </AIUsageContext.Provider>
  );
};

export const useAIUsage = (): AIUsageContextType => {
  const context = useContext(AIUsageContext);
  if (context === undefined) {
    throw new Error('useAIUsage must be used within an AIUsageProvider');
  }
  return context;
};
