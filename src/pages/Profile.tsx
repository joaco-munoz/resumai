import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { AccountStats } from "@/components/profile/AccountStats";
import { FlowSubscription } from "@/components/profile/FlowSubscription";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const Profile = () => {
  const { user } = useAuth();
  const { tier, isPremium, refreshStatus } = useSubscriptionStatus();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    github: '',
    jobTitle: '',
    company: '',
    bio: '',
    avatarUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cvsCreated: 0,
    applications: 0,
    interviews: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        toast.error("Error al cargar el perfil");
        return;
      }

      if (data) {
        setProfileData({
          fullName: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          location: `${data.city || ''}${data.city && data.country ? ', ' : ''}${data.country || ''}`.trim(),
          linkedin: data.linkedin_url || '',
          website: data.website_url || '',
          github: '',
          jobTitle: data.job_title || '',
          company: data.company || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || ''
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { count: cvsCount } = await supabase
        .from('cvs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: applicationsCount } = await supabase
        .from('job_applications_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: interviewsCount } = await supabase
        .from('job_applications_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'interviewing');

      setStats({
        cvsCreated: cvsCount || 0,
        applications: applicationsCount || 0,
        interviews: interviewsCount || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const locationParts = profileData.location.split(',').map(part => part.trim());
      const city = locationParts[0] || '';
      const country = locationParts[1] || '';

      const updateData = {
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        city: city,
        country: country,
        linkedin_url: profileData.linkedin,
        website_url: profileData.website,
        job_title: profileData.jobTitle,
        company: profileData.company,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert([{ id: user.id, ...updateData }]);

      if (error) {
        throw error;
      }

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlanChange = (newPlan: string) => {
    refreshStatus();
  };

  const getInitials = (name: string) => {
    if (!name) return user?.email?.substring(0, 2).toUpperCase() || "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    return profileData.fullName || user?.email?.split('@')[0] || "Usuario";
  };

  const getMemberSince = () => {
    if (!user?.created_at) return "Enero 2024";
    const date = new Date(user.created_at);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              <p className="mt-2 text-gray-600">Cargando perfil...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold gradient-text">Mi Perfil</h1>
                <p className="text-gray-600">Gestiona tu información personal, suscripción y facturación</p>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-6xl mx-auto">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Información Personal</TabsTrigger>
                <TabsTrigger value="billing">Facturación y Suscripción</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <ProfileHeader 
                  displayName={getDisplayName()}
                  email={profileData.email}
                  avatarUrl={profileData.avatarUrl}
                  memberSince={getMemberSince()}
                  getInitials={getInitials}
                />

                <PersonalInfoForm 
                  profileData={profileData}
                  isSaving={isSaving}
                  onInputChange={handleInputChange}
                  onSave={handleSave}
                />

                <AccountStats stats={stats} />
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <FlowSubscription 
                  currentPlan={tier}
                  onPlanChange={handlePlanChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
