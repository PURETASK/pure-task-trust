import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, PieChart as PieChartIcon, Calendar, DollarSign } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--pt-aqua))', 'hsl(var(--pt-purple))'];

export default function SpendingAnalytics() {
  const { user } = useAuth();

  const { data: spending, isLoading } = useQuery({
    queryKey: ['spending-analytics', user?.id],
    queryFn: async () => {
      // Fetch last 12 months of ledger transactions
      const twelveMonthsAgo = subMonths(new Date(), 12).toISOString();
      const { data: ledger, error } = await supabase
        .from('credit_ledger')
        .select('amount, description, created_at')
        .eq('user_id', user!.id)
        .lt('amount', 0) // spending only
        .gte('created_at', twelveMonthsAgo)
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Group by month
      const byMonth: Record<string, number> = {};
      const byType: Record<string, number> = {};
      
      (ledger || []).forEach(entry => {
        const month = format(new Date(entry.created_at), 'MMM yyyy');
        byMonth[month] = (byMonth[month] || 0) + Math.abs(entry.amount);
        
        const type = entry.description?.includes('deep') ? 'Deep Clean' :
                     entry.description?.includes('move') ? 'Move Out' :
                     entry.description?.includes('recurring') ? 'Recurring' : 'Standard';
        byType[type] = (byType[type] || 0) + Math.abs(entry.amount);
      });

      const monthlyData = Object.entries(byMonth).map(([month, total]) => ({ month, total }));
      const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }));
      const totalSpent = (ledger || []).reduce((sum, e) => sum + Math.abs(e.amount), 0);

      return { monthlyData, typeData, totalSpent, transactionCount: ledger?.length || 0 };
    },
    enabled: !!user?.id,
  });

  return (
    <>
      <Helmet><title>Spending Analytics | PureTask</title></Helmet>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" /> Spending Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track your cleaning spend over time</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <DollarSign className="h-5 w-5 text-primary mb-2" />
                  <p className="text-2xl font-bold">${spending?.totalSpent || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Spent (12mo)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <Calendar className="h-5 w-5 text-success mb-2" />
                  <p className="text-2xl font-bold">{spending?.transactionCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Monthly Spend</CardTitle></CardHeader>
              <CardContent>
                {spending?.monthlyData && spending.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={spending.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No spending data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChartIcon className="h-4 w-4" /> By Cleaning Type</CardTitle></CardHeader>
              <CardContent>
                {spending?.typeData && spending.typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={spending.typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {spending.typeData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No data yet</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
