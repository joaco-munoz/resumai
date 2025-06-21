import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
interface StatsData {
  cvsCreated: number;
  applications: number;
  interviews: number;
}
interface AccountStatsProps {
  stats: StatsData;
}
export const AccountStats = ({
  stats
}: AccountStatsProps) => {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      

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
        
        
      </Card>
    </div>;
};