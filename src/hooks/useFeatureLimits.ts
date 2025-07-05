
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FeatureLimits {
  cv_creation: number;
  pdf_export: number;
  ai_improvements: number;
}

interface FeatureUsage {
  cv_creation: number;
  pdf_export: number;
  ai_improvements: number;
}

interface UseFeatureLimitsReturn {
  limits: FeatureLimits | null;
  usage: FeatureUsage;
  canUseFeature: (feature: keyof FeatureLimits) => Promise<boolean>;
  incrementUsage: (feature: keyof FeatureLimits) => Promise<boolean>;
  isLoading: boolean;
  userPlan: string;
}

export const useFeatureLimits = (): UseFeatureLimitsReturn => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<FeatureLimits | null>(null);
  const [usage, setUsage] = useState<FeatureUsage>({
    cv_creation: 0,
    pdf_export: 0,
    ai_improvements: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      const plan = profile?.subscription_tier || 'free';
      setUserPlan(plan);

      // Obtener límites usando la función SQL
      const { data: limitsData, error: limitsError } = await supabase
        .rpc('get_user_limits', { user_plan: plan });

      if (limitsError) {
        console.error('Error fetching limits:', limitsError);
        return;
      }

      // Fix type casting issue
      const typedLimits = limitsData as unknown as FeatureLimits;
      setLimits(typedLimits);

      // Obtener uso actual del mes
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('feature_type, usage_count')
        .eq('user_id', user.id)
        .eq('period_start', currentMonth);

      if (usageError) {
        console.error('Error fetching usage:', usageError);
        return;
      }

      const usageMap: FeatureUsage = {
        cv_creation: 0,
        pdf_export: 0,
        ai_improvements: 0
      };

      usageData?.forEach(item => {
        if (item.feature_type in usageMap) {
          usageMap[item.feature_type as keyof FeatureUsage] = item.usage_count;
        }
      });

      setUsage(usageMap);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canUseFeature = async (feature: keyof FeatureLimits): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('can_use_feature', {
          p_user_id: user.id,
          p_feature_type: feature
        });

      if (error) {
        console.error('Error checking feature usage:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error checking feature usage:', error);
      return false;
    }
  };

  const incrementUsage = async (feature: keyof FeatureLimits): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .rpc('increment_feature_usage', {
          p_user_id: user.id,
          p_feature_type: feature
        });

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      // Actualizar estado local
      setUsage(prev => ({
        ...prev,
        [feature]: prev[feature] + 1
      }));

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  return {
    limits,
    usage,
    canUseFeature,
    incrementUsage,
    isLoading,
    userPlan
  };
};
