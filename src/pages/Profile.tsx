
import { useState, useEffect } from "react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { AccountStats } from "@/components/profile/AccountStats";
import { FlowSubscription } from "@/components/profile/FlowSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Dock from "@/components/ui/Dock";
import HeaderBrand from "@/components/HeaderBrand";

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    github: "",
    jobTitle: "",
    company: "",
    bio: "",
    avatarUrl: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    cvsCreated: 0,
    applications: 0,
    interviews: 0
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadStats();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error loading profile:", error);
        return;
      }

      if (data) {
        setProfileData({
          fullName: data.full_name || "",
          email: user.email || "",
          phone: data.phone || "",
          location: data.location || "",
          linkedin: data.linkedin || "",
          website: data.website || "",
          github: data.github || "",
          jobTitle: data.job_title || "",
          company: data.company || "",
          bio: data.bio || "",
          avatarUrl: data.avatar_url || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // Load CVs count
      const { count: cvsCount } = await supabase
        .from('cvs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Load applications count
      const { count: applicationsCount } = await supabase
        .from('job_applications_tracking')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Load interviews count
      const { count: interviewsCount } = await supabase
        .from('job_applications_tracking')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'interviewing');

      setStats({
        cvsCreated: cvsCount || 0,
        applications: applicationsCount || 0,
        interviews: interviewsCount || 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
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
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          phone: profileData.phone,
          location: profileData.location,
          linkedin: profileData.linkedin,
          website: profileData.website,
          github: profileData.github,
          job_title: profileData.jobTitle,
          company: profileData.company,
          bio: profileData.bio,
          avatar_url: profileData.avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving profile:", error);
        toast.error("Error al guardar el perfil");
        return;
      }

      toast.success("Perfil guardado exitosamente");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error al guardar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatMemberSince = () => {
    if (!user?.created_at) return "";
    return new Date(user.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <HeaderBrand />
      
      <div className="container mx-auto px-4 py-6">
        <ProfileHeader 
          displayName={profileData.fullName || user?.email || "Usuario"}
          email={user?.email || ""}
          avatarUrl={profileData.avatarUrl}
          memberSince={formatMemberSince()}
          getInitials={getInitials}
        />
        
        <Tabs defaultValue="personal" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Suscripción
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-6">
            <PersonalInfoForm 
              profileData={profileData}
              isSaving={isSaving}
              onInputChange={handleInputChange}
              onSave={handleSave}
            />
          </TabsContent>
          
          <TabsContent value="subscription" className="mt-6">
            <FlowSubscription 
              currentPlan="free"
              onPlanChange={() => {}}
            />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <AccountStats stats={stats} />
          </TabsContent>
        </Tabs>
      </div>

      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}
