
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FeatureLimits {
  cv_creation: number;
  pdf_export: number;
  ai_improvements: number;
  job_matcher_advanced: boolean;
  unlimited_features: boolean;
}

interface UsageStats {
  cv_creation: number;
  pdf_export: number;
  ai_improvements: number;
}

export const useFeatureLimits = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<FeatureLimits>({
    cv_creation: 1,
    pdf_export: 1,
    ai_improvements: 5,
    job_matcher_advanced: false,
    unlimited_features: false
  });
  const [usage, setUsage] = useState<UsageStats>({
    cv_creation: 0,
    pdf_export: 0,
    ai_improvements: 0
  });
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionAndUsage();
    }
  }, [user]);

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

      const isUserPro = profile?.is_premium === true && 
        profile?.subscription_tier === 'pro' && 
        (!profile?.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

      setIsPro(isUserPro);

      // Establecer límites según el plan
      if (isUserPro) {
        setLimits({
          cv_creation: 999,
          pdf_export: 999,
          ai_improvements: 999,
          job_matcher_advanced: true,
          unlimited_features: true
        });
      } else {
        setLimits({
          cv_creation: 1,
          pdf_export: 1,
          ai_improvements: 5,
          job_matcher_advanced: false,
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
        }, { cv_creation: 0, pdf_export: 0, ai_improvements: 0 } as UsageStats);

        setUsage(currentUsage);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canUseFeature = (featureType: keyof UsageStats): boolean => {
    if (isPro) return true;
    return usage[featureType] < limits[featureType];
  };

  const incrementUsage = async (featureType: keyof UsageStats): Promise<boolean> => {
    if (!user) return false;

    if (!canUseFeature(featureType)) {
      toast.error(`Has alcanzado el límite de ${featureType}. Actualiza a Pro para uso ilimitado.`);
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
