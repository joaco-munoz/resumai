
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  processed_at: string;
  currency: string;
  description: string;
  flow_payment_date: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface PaymentsTableProps {
  payments: Payment[];
}

export const PaymentsTable = ({ payments }: PaymentsTableProps) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'CLP' ? 'CLP' : 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pagos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Procesado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.profiles?.full_name || 'Usuario sin nombre'}
                  </TableCell>
                  <TableCell>{payment.profiles?.email}</TableCell>
                  <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="capitalize">{payment.payment_method}</TableCell>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    {payment.processed_at 
                      ? new Date(payment.processed_at).toLocaleDateString('es-ES')
                      : 'No procesado'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
