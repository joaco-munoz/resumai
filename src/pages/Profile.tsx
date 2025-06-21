import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Linkedin, Globe, Save, CreditCard, Crown, Download, FileText, Zap, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();
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
  const [currentPlan, setCurrentPlan] = useState('free');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cvsCreated: 0,
    applications: 0,
    interviews: 0
  });
  const navigate = useNavigate();

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
          github: '', // No hay campo github en la tabla actual
          jobTitle: data.job_title || '',
          company: data.company || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || ''
        });
        setCurrentPlan(data.subscription_tier || 'free');
      } else {
        // Si no existe perfil, usar datos del usuario de auth
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
      // Fetch CVs count
      const { count: cvsCount } = await supabase
        .from('cvs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch applications count
      const { count: applicationsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch interviews count (applications with status 'interview')
      const { count: interviewsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'interview');

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
      // Separar city y country del location
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

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Redirigiendo a Mercado Pago...");
    } catch (error) {
      toast.error("Error al procesar el pago");
    } finally {
      setIsUpgrading(false);
    }
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

  const usageStats = {
    cvs: { used: stats.cvsCreated, limit: currentPlan === 'pro' ? 999 : 1 },
    exports: { used: Math.min(stats.cvsCreated, currentPlan === 'pro' ? 999 : 1), limit: currentPlan === 'pro' ? 999 : 1 },
    aiImprovements: { used: Math.floor(stats.cvsCreated * 1.5), limit: currentPlan === 'pro' ? 999 : 5 }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 999) return 25; // Para plan pro, mostrar uso bajo
    return Math.min((used / limit) * 100, 100);
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
                {/* Profile Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profileData.avatarUrl} alt={getDisplayName()} />
                        <AvatarFallback className="text-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                          {getInitials(profileData.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{getDisplayName()}</h2>
                        <p className="text-gray-600">{profileData.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Miembro desde {getMemberSince()}
                        </p>
                      </div>
                      <Button variant="outline">
                        Cambiar Foto
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información Personal
                    </CardTitle>
                    <CardDescription>
                      Esta información se utilizará para rellenar automáticamente tus CVs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Nombre completo
                        </Label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Teléfono
                        </Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+34 600 123 456"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Ubicación
                        </Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Ciudad, País"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jobTitle" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Puesto de trabajo
                        </Label>
                        <Input
                          id="jobTitle"
                          value={profileData.jobTitle}
                          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                          placeholder="Tu puesto actual"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Empresa
                        </Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Tu empresa actual"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Enlaces Profesionales</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin"
                            value={profileData.linkedin}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            placeholder="linkedin.com/in/tuperfil"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Sitio web
                          </Label>
                          <Input
                            id="website"
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="tusitio.com"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="github" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            GitHub
                          </Label>
                          <Input
                            id="github"
                            value={profileData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            placeholder="github.com/tuperfil"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-brand-500 to-brand-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">CVs Creados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-brand-600">{stats.cvsCreated}</div>
                      <p className="text-sm text-gray-500">Total</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Aplicaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success-600">{stats.applications}</div>
                      <p className="text-sm text-gray-500">Total enviadas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Entrevistas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats.interviews}</div>
                      <p className="text-sm text-gray-500">Conseguidas</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                {/* Current Plan */}
                <Card className={currentPlan === 'pro' ? 'border-2 border-brand-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${currentPlan === 'pro' ? 'bg-brand-100' : 'bg-gray-100'}`}>
                          {currentPlan === 'pro' ? (
                            <Crown className="h-6 w-6 text-brand-600" />
                          ) : (
                            <CreditCard className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Plan {currentPlan === 'pro' ? 'Pro' : 'Gratuito'}
                            {currentPlan === 'pro' && (
                              <Badge className="bg-brand-100 text-brand-700">Activo</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {currentPlan === 'pro' 
                              ? 'Acceso completo a todas las funciones'
                              : 'Perfecto para empezar con CVMaster AI'
                            }
                          </CardDescription>
                        </div>
                      </div>
                      
                      {currentPlan === 'free' && (
                        <Button 
                          onClick={handleUpgrade}
                          disabled={isUpgrading}
                          className="bg-gradient-to-r from-brand-500 to-brand-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {isUpgrading ? 'Procesando...' : 'Actualizar a Pro'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {currentPlan === 'pro' && (
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Próxima facturación: 15 de Febrero, 2024</span>
                        <span>$29.00 USD/mes</span>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CVs Creados
                        </CardTitle>
                        <span className="text-xs text-gray-500">
                          {usageStats.cvs.used}/{usageStats.cvs.limit === 999 ? '∞' : usageStats.cvs.limit}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress 
                        value={getUsagePercentage(usageStats.cvs.used, usageStats.cvs.limit)}
                        className="h-2 mb-2"
                      />
                      <p className="text-xs text-gray-600">
                        {usageStats.cvs.limit === 999 
                          ? 'Ilimitados' 
                          : `${Math.max(0, usageStats.cvs.limit - usageStats.cvs.used)} restantes este mes`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Exportaciones
                        </CardTitle>
                        <span className="text-xs text-gray-500">
                          {usageStats.exports.used}/{usageStats.exports.limit === 999 ? '∞' : usageStats.exports.limit}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress 
                        value={getUsagePercentage(usageStats.exports.used, usageStats.exports.limit)}
                        className="h-2 mb-2"
                      />
                      <p className="text-xs text-gray-600">
                        {usageStats.exports.limit === 999 
                          ? 'Ilimitadas' 
                          : `${Math.max(0, usageStats.exports.limit - usageStats.exports.used)} restantes este mes`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Mejoras con IA
                        </CardTitle>
                        <span className="text-xs text-gray-500">
                          {usageStats.aiImprovements.used}/{usageStats.aiImprovements.limit === 999 ? '∞' : usageStats.aiImprovements.limit}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress 
                        value={getUsagePercentage(usageStats.aiImprovements.used, usageStats.aiImprovements.limit)}
                        className="h-2 mb-2"
                      />
                      <p className="text-xs text-gray-600">
                        {usageStats.aiImprovements.limit === 999 
                          ? 'Ilimitadas' 
                          : `${Math.max(0, usageStats.aiImprovements.limit - usageStats.aiImprovements.used)} restantes este mes`}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Plan Comparison */}
                {currentPlan === 'free' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Desbloquea Todo el Potencial</CardTitle>
                      <CardDescription>
                        Compara los beneficios del plan Pro vs Gratuito
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Plan Gratuito</h3>
                            <Badge variant="secondary">Actual</Badge>
                          </div>
                          <div className="text-2xl font-bold">$0<span className="text-sm font-normal text-gray-500">/mes</span></div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              1 CV con IA
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              1 exportación PDF gratis
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              5 mejoras con IA/mes
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              Análisis básico ATS
                            </li>
                          </ul>
                        </div>

                        {/* Pro Plan */}
                        <div className="space-y-4 p-4 bg-gradient-to-br from-brand-50 to-purple-50 rounded-lg border border-brand-200">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Plan Pro</h3>
                            <Badge className="bg-brand-100 text-brand-700">Recomendado</Badge>
                          </div>
                          <div className="text-2xl font-bold">$29<span className="text-sm font-normal text-gray-500">/mes</span></div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              CVs ilimitados con IA
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              Exportaciones ilimitadas
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              DOCX y JSON export
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              Job Matcher avanzado
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              Mejoras IA ilimitadas
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              Plantillas premium
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success-500" />
                              Soporte prioritario
                            </li>
                          </ul>
                          <Button 
                            onClick={handleUpgrade}
                            disabled={isUpgrading}
                            className="w-full bg-gradient-to-r from-brand-500 to-brand-700"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            {isUpgrading ? 'Procesando...' : 'Actualizar a Pro'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Billing History */}
                {currentPlan === 'pro' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Historial de Facturación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b">
                          <div>
                            <p className="font-medium">Plan Pro - Enero 2024</p>
                            <p className="text-sm text-gray-500">Facturado el 15 de Enero, 2024</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$29.00</p>
                            <Badge variant="secondary">Pagado</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 border-b">
                          <div>
                            <p className="font-medium">Plan Pro - Diciembre 2023</p>
                            <p className="text-sm text-gray-500">Facturado el 15 de Diciembre, 2023</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$29.00</p>
                            <Badge variant="secondary">Pagado</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Success Metrics & Help */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-success-500" />
                        Tu Progreso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">CVs enviados</span>
                        <span className="font-bold text-brand-600">{stats.applications}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Respuestas recibidas</span>
                        <span className="font-bold text-success-600">{Math.floor(stats.applications * 0.67)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Entrevistas conseguidas</span>
                        <span className="font-bold text-yellow-600">{stats.interviews}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tasa de respuesta</span>
                        <span className="font-bold text-brand-600">
                          {stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>¿Necesitas Ayuda?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Nuestro equipo está aquí para ayudarte a maximizar tus resultados.
                      </p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Centro de Ayuda
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Zap className="h-4 w-4 mr-2" />
                          Contactar Soporte
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
