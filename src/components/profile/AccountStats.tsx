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
        
        
      </Card>

      
    </div>;
};