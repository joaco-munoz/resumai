
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText } from "lucide-react";

export const CounterSection = () => {
  const [stats, setStats] = useState({
    totalCVs: 0,
    totalUsers: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalCVs: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      
      // Get total CVs count using SELECT COUNT(*)
      const { data: cvsData, error: cvsError } = await supabase
        .from('cvs')
        .select('id');

      if (cvsError) {
        console.error('Error fetching CVs:', cvsError);
      }

      // Get total users count using SELECT COUNT(*)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) {
        console.error('Error fetching profiles:', usersError);
      }

      const newStats = {
        totalCVs: cvsData?.length || 0,
        totalUsers: usersData?.length || 0
      };

      console.log('Fetched stats:', newStats);
      setStats(newStats);
      return newStats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return stats;
    }
  };

  useEffect(() => {
    const initializeStats = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };

    initializeStats();

    // Set up real-time subscriptions for CVs
    const cvsChannel = supabase
      .channel('cvs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cvs'
        },
        (payload) => {
          console.log('CVs table changed:', payload);
          fetchStats();
        }
      )
      .subscribe();

    // Set up real-time subscriptions for profiles
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles table changed:', payload);
          fetchStats();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(cvsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Animate counters when stats change
  useEffect(() => {
    if (!loading && (stats.totalCVs > 0 || stats.totalUsers > 0)) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const interval = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedStats({
          totalCVs: Math.floor(stats.totalCVs * progress),
          totalUsers: Math.floor(stats.totalUsers * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats(stats);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [loading, stats]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-800/50 to-cyan-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
              <div className="h-12 bg-blue-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-6 bg-blue-200 rounded w-32 mx-auto"></div>
            </div>
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 bg-cyan-200 rounded-full mx-auto mb-4"></div>
              <div className="h-12 bg-cyan-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-6 bg-cyan-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-800/50 to-cyan-800/50 backdrop-blur-sm border-y border-blue-500/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Únete a miles de profesionales
          </h2>
          <p className="text-blue-100 text-lg">
            Descubre el poder de nuestra plataforma
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* CVs Counter */}
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-300">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <div className="relative">
              <h3 className="text-5xl md:text-6xl font-bold text-white mb-2 font-mono">
                {animatedStats.totalCVs.toLocaleString()}
              </h3>
              <p className="text-blue-200 text-lg font-medium">
                CVs Creados
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mt-3 rounded-full"></div>
            </div>
          </div>

          {/* Users Counter */}
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-cyan-500/50 transition-all duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="relative">
              <h3 className="text-5xl md:text-6xl font-bold text-white mb-2 font-mono">
                {animatedStats.totalUsers.toLocaleString()}
              </h3>
              <p className="text-cyan-200 text-lg font-medium">
                Usuarios Registrados
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mt-3 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
