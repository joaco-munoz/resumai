
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = useCallback(async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }, [user]);

  return { logActivity };
};
