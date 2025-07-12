import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface KanbanStats {
  applications: number;
  interviews: number;
}

interface KanbanStatsContextType {
  stats: KanbanStats;
  refreshStats: () => Promise<void>;
  calculateResponseRate: () => string;
}

const KanbanStatsContext = createContext<KanbanStatsContextType | undefined>(undefined);

export const useKanbanStats = () => {
  const context = useContext(KanbanStatsContext);
  if (context === undefined) {
    throw new Error('useKanbanStats must be used within a KanbanStatsProvider');
  }
  return context;
};

export const KanbanStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<KanbanStats>({
    applications: 0,
    interviews: 0
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get all job applications
      const { data, error } = await supabase
        .from('job_applications_tracking')
        .select('status')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching job stats:', error);
        return;
      }

      // Count applications and interviews
      const applications = data.filter(item => item.status === 'applied').length;
      const interviews = data.filter(item => item.status === 'interviewing').length;

      setStats({
        applications,
        interviews
      });
    } catch (error) {
      console.error('Error in fetchStats:', error);
    }
  };

  // Calculate response rate as string with proper formatting
  const calculateResponseRate = (): string => {
    if (stats.applications === 0) return '— %';
    const rate = Math.round((stats.interviews / stats.applications) * 100);
    return `${rate}%`;
  };

  // Set up real-time subscription to job_applications_tracking changes
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchStats();

    // Set up subscription for real-time updates
    const subscription = supabase
      .channel('job_applications_tracking_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_applications_tracking',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          // Refresh stats on any change
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const value = {
    stats,
    refreshStats: fetchStats,
    calculateResponseRate
  };

  return (
    <KanbanStatsContext.Provider value={value}>
      {children}
    </KanbanStatsContext.Provider>
  );
};
