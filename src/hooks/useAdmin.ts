
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Checking admin status for user:', user.email);
        
        // First check if user exists in admin_users table
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (adminError) {
          console.error('Error checking admin status in table:', adminError);
        }

        console.log('Admin user from table:', adminUser);

        // Then use the RPC function
        const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
        
        if (rpcError) {
          console.error('Error checking admin status with RPC:', rpcError);
        }

        console.log('Admin status from RPC:', isAdminRpc);

        // Set admin status based on either check
        const adminStatus = adminUser !== null || isAdminRpc === true;
        console.log('Final admin status:', adminStatus);
        
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, isLoading };
};
