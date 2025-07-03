
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FlowSubscription } from "@/components/profile/FlowSubscription";
import { useIsMobile } from "@/hooks/use-mobile";

const Billing = () => {
  const [currentPlan, setCurrentPlan] = useState('free'); // 'free' or 'pro'
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <SidebarTrigger />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold gradient-text truncate">Facturación</h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hidden sm:block">Gestiona tu suscripción y uso</p>
                </div>
              </div>
              
              <Button 
                onClick={handleBackToLanding}
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10 shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Volver a Landing (Test)</span>
              </Button>
            </div>
          </header>

          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {/* Flow Subscription Component */}
              <FlowSubscription 
                currentPlan={currentPlan}
                onPlanChange={setCurrentPlan}
              />

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">CVs Creados</span>
                      </CardTitle>
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {usageStats.cvs.used}/{usageStats.cvs.limit}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={getUsagePercentage(usageStats.cvs.used, usageStats.cvs.limit)}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {usageStats.cvs.limit - usageStats.cvs.used} restantes este mes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span className="truncate">Exportaciones</span>
                      </CardTitle>
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {usageStats.exports.used}/{usageStats.exports.limit}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={getUsagePercentage(usageStats.exports.used, usageStats.exports.limit)}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {usageStats.exports.limit - usageStats.exports.used} restantes este mes
                    </p>
                  </CardContent>
                </Card>

                <Card className="sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="truncate">Mejoras con IA</span>
                      </CardTitle>
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {usageStats.aiImprovements.used}/{usageStats.aiImprovements.limit}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={getUsagePercentage(usageStats.aiImprovements.used, usageStats.aiImprovements.limit)}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {usageStats.aiImprovements.limit - usageStats.aiImprovements.used} restantes este mes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Help Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">¿Necesitas Ayuda?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
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
