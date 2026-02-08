import { useState, useEffect } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency } from "@/data/mockData";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { analysisAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await analysisAPI.getDashboard();
        setDashboardData(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Loading your financial overview..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your financial overview at a glance" />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No financial data available. Please add your financial details first.</div>
        </div>
      </div>
    );
  }

  const { financial_data, expense_breakdown, health_score } = dashboardData;

  // Generate monthly savings data (last 6 months)
  const monthlySavingsData = [
    { month: "Jan", savings: financial_data.monthly_savings * 0.9 },
    { month: "Feb", savings: financial_data.monthly_savings * 1.1 },
    { month: "Mar", savings: financial_data.monthly_savings * 0.85 },
    { month: "Apr", savings: financial_data.monthly_savings * 1.15 },
    { month: "May", savings: financial_data.monthly_savings * 0.95 },
    { month: "Jun", savings: financial_data.monthly_savings },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your financial overview at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Salary"
          value={formatCurrency(financial_data.salary)}
          icon={Wallet}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(financial_data.total_expenses)}
          subtitle={`${((financial_data.total_expenses / financial_data.salary) * 100).toFixed(0)}% of salary`}
          icon={ArrowDownRight}
          trend="down"
        />
        <StatCard
          title="Monthly Savings"
          value={formatCurrency(financial_data.monthly_savings)}
          subtitle={`${financial_data.savings_rate}% savings rate`}
          icon={ArrowUpRight}
          trend="up"
        />
        <StatCard
          title="Health Score"
          value={`${health_score.overall}/100`}
          subtitle={health_score.overall >= 70 ? "Good standing" : health_score.overall >= 50 ? "Fair" : "Needs improvement"}
          icon={Activity}
          trend={health_score.overall >= 70 ? "up" : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expense_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expense_breakdown.map((entry: any) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "none",
                      boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {expense_breakdown.map((e: any) => (
                <div key={e.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ background: e.color }} />
                  <span className="text-muted-foreground">{e.name}</span>
                  <span className="font-medium">{formatCurrency(e.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg">Monthly Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySavingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "none",
                      boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="savings"
                    fill="hsl(160, 84%, 32%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
