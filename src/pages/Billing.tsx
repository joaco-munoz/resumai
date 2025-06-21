
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
import { MercadoPagoSubscription } from "@/components/profile/MercadoPagoSubscription";

const Billing = () => {
  const [currentPlan, setCurrentPlan] = useState('free'); // 'free' or 'pro'
  const navigate = useNavigate();

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
              {/* MercadoPago Subscription Component */}
              <MercadoPagoSubscription 
                currentPlan={currentPlan}
                onPlanChange={setCurrentPlan}
              />

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
                        <div className="text-2xl font-bold">$6.990<span className="text-sm font-normal text-gray-500"> CLP/mes</span></div>
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
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Success Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
