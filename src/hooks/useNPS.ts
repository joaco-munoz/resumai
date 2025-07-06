
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNPS = () => {
  const { user } = useAuth();
  const [shouldShowNPS, setShouldShowNPS] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkNPSEligibility();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkNPSEligibility = async () => {
    if (!user) return;

    try {
      // Verificar si el usuario ya respondió el NPS en los últimos 3 meses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: existingResponse, error } = await supabase
        .from('nps_responses')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', threeMonthsAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking NPS eligibility:', error);
        return;
      }

      // Verificar si el usuario ha usado la app por al menos 1 semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const userCreatedAt = new Date(user.created_at || '');
      const hasUsedEnoughTime = userCreatedAt <= oneWeekAgo;

      // Mostrar NPS si no ha respondido recientemente y ha usado la app suficiente tiempo
      const shouldShow = !existingResponse?.length && hasUsedEnoughTime;
      
      // Agregar un elemento de aleatoriedad (30% de probabilidad) para no ser intrusivo
      const randomShow = Math.random() < 0.3;
      
      setShouldShowNPS(shouldShow && randomShow);
    } catch (error) {
      console.error('Error checking NPS eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissNPS = () => {
    setShouldShowNPS(false);
  };

  return {
    shouldShowNPS,
    isLoading,
    dismissNPS
  };
};
