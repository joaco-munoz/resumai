import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Crown, Download, FileText, Zap, CheckCircle, Calendar, TrendingUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Billing = () => {
  const [currentPlan] = useState('free'); // 'free' or 'pro'
  const [isUpgrading, setIsUpgrading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    
    // TODO: Connect to Mercado Pago when Supabase integration is set up
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Redirigiendo a Mercado Pago...");
    } catch (error) {
      toast.error("Error al procesar el pago");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate("/");
  };

  const usageStats = {
    cvs: { used: 1, limit: 1 },
    exports: { used: 1, limit: 1 },
    aiImprovements: { used: 3, limit: 5 }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-brand-500";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Facturación</h1>
                  <p className="text-gray-600">Gestiona tu suscripción y uso</p>
                </div>
              </div>
              
              <Button 
                onClick={handleBackToLanding}
                variant="outline" 
                size="sm" 
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Landing (Test)
              </Button>
            </div>
          </header>

          <div className="p-6 max-w-6xl mx-auto">
            <div className="space-y-6">
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
                        {usageStats.cvs.used}/{usageStats.cvs.limit}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={getUsagePercentage(usageStats.cvs.used, usageStats.cvs.limit)}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-gray-600">
                      {usageStats.cvs.limit - usageStats.cvs.used} restantes este mes
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
                        {usageStats.exports.used}/{usageStats.exports.limit}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={getUsagePercentage(usageStats.exports.used, usageStats.exports.limit)}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-gray-600">
                      {usageStats.exports.limit - usageStats.exports.used} restantes este mes
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
                        {usageStats.aiImprovements.used}/{usageStats.aiImprovements.limit}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={getUsagePercentage(usageStats.aiImprovements.used, usageStats.aiImprovements.limit)}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-gray-600">
                      {usageStats.aiImprovements.limit - usageStats.aiImprovements.used} restantes este mes
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

              {/* Success Metrics */}
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
                      <span className="font-bold text-brand-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Respuestas recibidas</span>
                      <span className="font-bold text-success-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Entrevistas conseguidas</span>
                      <span className="font-bold text-yellow-600">4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tasa de respuesta</span>
                      <span className="font-bold text-brand-600">67%</span>
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
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Billing;
