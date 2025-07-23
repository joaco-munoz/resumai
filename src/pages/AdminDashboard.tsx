
import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import Dock from "@/components/ui/Dock";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { usePaymentsData } from "@/hooks/usePaymentsData";
import { Button } from "@/components/ui/button";
import { AdminMetricsCard } from "@/components/admin/AdminMetricsCard";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { MetricsChart } from "@/components/admin/MetricsChart";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  UserPlus, 
  CreditCard,
  FileText,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { metrics, todayMetrics, isLoading: metricsLoading, updateMetrics } = useBusinessMetrics();
  const { payments, isLoading: paymentsLoading } = usePaymentsData();

  const handleUpdateMetrics = async () => {
    toast.info("Actualizando métricas...");
    await updateMetrics();
    toast.success("Métricas actualizadas correctamente");
  };

  if (adminLoading || metricsLoading) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando panel de administración...</p>
          </div>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
            <p className="text-gray-600 mt-2">No tienes permisos de administrador</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gray-50">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Panel de Administración</h1>
                <p className="text-gray-600 mt-2">
                  Métricas y datos de la aplicación
                </p>
              </div>
              <Button onClick={handleUpdateMetrics} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar Métricas
              </Button>
            </div>
          </header>
          
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminMetricsCard
                  title="Total Usuarios"
                  value={todayMetrics?.total_users || 0}
                  icon={Users}
                  trend="up"
                />
                <AdminMetricsCard
                  title="Usuarios Pro"
                  value={todayMetrics?.pro_users || 0}
                  icon={TrendingUp}
                  trend="up"
                />
                <AdminMetricsCard
                  title="MRR"
                  value={`$${todayMetrics?.mrr || 0}`}
                  icon={DollarSign}
                  trend="up"
                />
                <AdminMetricsCard
                  title="Nuevos Hoy"
                  value={todayMetrics?.daily_signups || 0}
                  icon={UserPlus}
                  trend="neutral"
                />
              </div>

              {/* Segunda fila de métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminMetricsCard
                  title="Usuarios Activos"
                  value={todayMetrics?.active_users || 0}
                  icon={Activity}
                  trend="up"
                />
                <AdminMetricsCard
                  title="CVs Creados"
                  value={todayMetrics?.total_cvs_created || 0}
                  icon={FileText}
                  trend="up"
                />
                <AdminMetricsCard
                  title="Pagos Hoy"
                  value={`$${todayMetrics?.total_payments_today || 0}`}
                  icon={CreditCard}
                  trend="neutral"
                />
                <AdminMetricsCard
                  title="ARR"
                  value={`$${todayMetrics?.arr || 0}`}
                  icon={TrendingUp}
                  trend="up"
                />
              </div>

              {/* Gráfico de métricas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MetricsChart data={metrics} />
                
                {/* Métricas adicionales */}
                <div className="space-y-4">
                  <AdminMetricsCard
                    title="Tasa de Conversión"
                    value={`${todayMetrics?.churn_rate || 0}%`}
                    icon={TrendingUp}
                    trend="neutral"
                  />
                  <AdminMetricsCard
                    title="Ingresos Promedio"
                    value={`$${Math.round(todayMetrics?.avg_revenue_per_user || 0)}`}
                    icon={DollarSign}
                    trend="up"
                  />
                  <AdminMetricsCard
                    title="Usuarios Gratuitos"
                    value={todayMetrics?.free_users || 0}
                    icon={Users}
                    trend="neutral"
                  />
                </div>
              </div>

              {/* Tabla de pagos */}
              {!paymentsLoading && (
                <PaymentsTable payments={payments} />
              )}
            </div>
          </div>
      </main>
      
      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </>
  );
};

export default AdminDashboard;
