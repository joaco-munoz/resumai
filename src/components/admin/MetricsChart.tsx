
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricsData {
  date: string;
  total_users: number;
  new_signups: number;
  mrr: number;
  total_revenue: number;
}

interface MetricsChartProps {
  data: MetricsData[];
}

export const MetricsChart = ({ data }: MetricsChartProps) => {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })
  })).reverse();

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Evolución de Métricas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total_users" 
                stroke="#8884d8" 
                name="Total Usuarios"
              />
              <Line 
                type="monotone" 
                dataKey="new_signups" 
                stroke="#82ca9d" 
                name="Nuevos Registros"
              />
              <Line 
                type="monotone" 
                dataKey="mrr" 
                stroke="#ffc658" 
                name="MRR"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
