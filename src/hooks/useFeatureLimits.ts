
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';

interface FeatureLimits {
  cv_creation: number;
  pdf_export: number;
  ai_improvements: number;
  job_matcher_advanced: number;
  unlimited_features: boolean;
}

interface UsageStats {
  cv_creation: number;
  pdf_export: number;
  ai_improvements: number;
  job_matcher_advanced: number;
}

export const useFeatureLimits = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [limits, setLimits] = useState<FeatureLimits>({
    cv_creation: 1,
    pdf_export: 1,
    ai_improvements: 5,
    job_matcher_advanced: 3,
    unlimited_features: false
  });
  const [usage, setUsage] = useState<UsageStats>({
    cv_creation: 0,
    pdf_export: 0,
    ai_improvements: 0,
    job_matcher_advanced: 0
  });
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionAndUsage();
    }
  }, [user, isAdmin]);

  const checkSubscriptionAndUsage = async () => {
    if (!user) return;

    try {
      // Verificar estado de suscripción
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, is_premium, premium_expires_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      const isUserPro = isAdmin || (profile?.is_premium === true && 
        profile?.subscription_tier === 'pro' && 
        (!profile?.premium_expires_at || new Date(profile.premium_expires_at) > new Date()));

      setIsPro(isUserPro);

      // Establecer límites según el plan
      if (isUserPro) {
        setLimits({
          cv_creation: 999,
          pdf_export: 999,
          ai_improvements: 999,
          job_matcher_advanced: 999,
          unlimited_features: true
        });
      } else {
        setLimits({
          cv_creation: 1,
          pdf_export: 1,
          ai_improvements: 5,
          job_matcher_advanced: 3,
          unlimited_features: false
        });
      }

      // Obtener uso actual del mes
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('feature_type, usage_count')
        .eq('user_id', user.id)
        .gte('period_start', currentMonth);

      if (!usageError && usageData) {
        const currentUsage = usageData.reduce((acc, item) => {
          acc[item.feature_type as keyof UsageStats] = item.usage_count;
          return acc;
        }, { 
          cv_creation: 0, 
          pdf_export: 0, 
          ai_improvements: 0, 
          job_matcher_advanced: 0 
        } as UsageStats);

        setUsage(currentUsage);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canUseFeature = (featureType: keyof UsageStats): boolean => {
    if (isPro || isAdmin) return true;
    return usage[featureType] < limits[featureType];
  };

  const incrementUsage = async (featureType: keyof UsageStats): Promise<boolean> => {
    if (!user) return false;

    if (!canUseFeature(featureType)) {
      const featureNames = {
        cv_creation: 'creación de CVs',
        pdf_export: 'exportaciones PDF',
        ai_improvements: 'mejoras con IA',
        job_matcher_advanced: 'análisis de ofertas'
      };
      
      toast.error(`Has alcanzado el límite de ${featureNames[featureType]}. Actualiza a Pro para uso ilimitado.`);
      return false;
    }

    try {
      const { error } = await supabase.rpc('increment_feature_usage', {
        p_user_id: user.id,
        p_feature_type: featureType
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      // Actualizar el estado local
      setUsage(prev => ({
        ...prev,
        [featureType]: prev[featureType] + 1
      }));

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  return {
    limits,
    usage,
    isPro,
    isLoading,
    canUseFeature,
    incrementUsage,
    refreshLimits: checkSubscriptionAndUsage
  };
};
