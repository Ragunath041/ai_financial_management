import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { analysisAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BudgetAnalysis() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboard, budgetInsights] = await Promise.all([
          analysisAPI.getDashboard(),
          analysisAPI.getInsights(),
        ]);
        setDashboardData(dashboard);
        setInsights(budgetInsights);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load budget analysis",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Smart Budget Analysis" description="AI-powered breakdown of your spending patterns" />
        <Card className="card-shadow border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No financial data available. Please add your financial information first.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { financial_data, expense_breakdown } = dashboardData;
  const totalExpenses = financial_data.total_expenses;
  const monthlySavings = financial_data.monthly_savings;
  const savingsGoal = financial_data.savings_goal;

  return (
    <div className="space-y-6">
      <PageHeader title="Smart Budget Analysis" description="AI-powered breakdown of your spending patterns" />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="card-shadow border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expense_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expense_breakdown.map((entry: any) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg p-3 ${
                    insight.type === "warning"
                      ? "bg-warning/10"
                      : "bg-success/10"
                  }`}
                >
                  {insight.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 shrink-0 text-warning mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success mt-0.5" />
                  )}
                  <span className="text-sm">{insight.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="card-shadow border-0 bg-primary/5">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Monthly Expenses</p>
                <p className="font-display font-bold text-lg">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {((totalExpenses / financial_data.salary) * 100).toFixed(0)}% of salary
                </p>
              </CardContent>
            </Card>
            <Card className="card-shadow border-0 bg-success/5">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Monthly Savings</p>
                <p className="font-display font-bold text-lg text-success">
                  {formatCurrency(monthlySavings)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Target: {formatCurrency(savingsGoal)}/month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
