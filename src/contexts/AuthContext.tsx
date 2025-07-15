
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔐 Initializing auth...");
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }
      
      console.log("📋 Initial session check:", session?.user?.email || "No session");
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.email || "No user");
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've processed the auth state change
        if (loading) {
          setLoading(false);
        }

        // Handle navigation based on auth events
        if (event === 'SIGNED_IN' && session?.user) {
          // Only redirect if we're on the landing page
          if (window.location.pathname === '/') {
            console.log("🔀 Redirecting to app after sign in");
            navigate('/app');
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log("🔀 Redirecting to home after sign out");
          navigate('/');
        }
      }
    );

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]); // Remove loading from dependencies to avoid infinite loops

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("📝 Attempting sign up for:", email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error("❌ SignUp error:", error);
        return { error };
      }

      console.log("✅ Sign up successful");
      return { error: null };
    } catch (error) {
      console.error("❌ SignUp exception:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔑 Attempting sign in for:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ SignIn error:", error);
        return { error };
      }

      console.log("✅ Sign in successful");
      return { error: null };
    } catch (error) {
      console.error("❌ SignIn exception:", error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("🔗 Attempting Google sign in");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });

      if (error) {
        console.error("❌ Google signIn error:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("❌ Google signIn exception:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Attempting sign out");
      
      // Clear local state immediately
      setSession(null);
      setUser(null);
      
      const { error } = await supabase.auth.signOut();
      
      // Handle the case where the session might already be invalid
      if (error && error.message !== "Auth session missing!") {
        console.error("❌ SignOut error:", error);
        toast.error("Error al cerrar sesión");
      } else {
        console.log("✅ Sign out successful");
        toast.success("Sesión cerrada exitosamente");
      }
      
      // Always navigate to home regardless of error
      navigate('/');
    } catch (error) {
      console.error("❌ SignOut exception:", error);
      // Clear state and navigate even if there's an exception
      setSession(null);
      setUser(null);
      navigate('/');
      toast.success("Sesión cerrada");
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
