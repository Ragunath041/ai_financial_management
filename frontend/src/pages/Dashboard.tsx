import { useState, useEffect } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, Target, MapPin, Receipt, PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency } from "@/lib/utils";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { analysisAPI, savingsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dash, progress] = await Promise.all([
          analysisAPI.getDashboard().catch(() => null),
          savingsAPI.getProgress().catch(() => null)
        ]);
        setDashboardData(dash);
        setProgressData(progress);
      } catch (error: any) {
        toast({
          title: "Notice",
          description: "Set your goals and entries to see full dashboard data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Loading your financial overview..." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  const hasGoal = !!progressData;
  const hasHistory = progressData?.monthly_trend?.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <PageHeader title="Financial Dashboard" description="Smart management of your savings and expenses." />
        <div className="hidden md:block">
           <Link to="/monthly-entry">
            <Button className="gap-2">
              <Receipt className="h-4 w-4" />
              Quick Entry
            </Button>
           </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Saved"
          value={progressData ? formatCurrency(progressData.total_saved) : "₹0"}
          subtitle={hasGoal ? `${progressData.progress_percentage}% of goal` : "No goal set"}
          icon={Wallet}
        />
        <StatCard
          title="Monthly Income"
          value={hasHistory ? formatCurrency(progressData.monthly_trend[progressData.monthly_trend.length-1].income || 0) : "₹0"}
          icon={ArrowUpRight}
          trend="up"
        />
        <StatCard
          title="Current Goal"
          value={hasGoal ? progressData.goal_name : "Not Set"}
          subtitle={hasGoal ? `Target: ${formatCurrency(progressData.target_amount)}` : "Click to setup"}
          icon={Target}
        />
        <StatCard
          title="Expenses"
          value={hasHistory ? formatCurrency(progressData.monthly_trend[progressData.monthly_trend.length-1].total_expenses || 0) : "₹0"}
          icon={ArrowDownRight}
          trend="down"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Savings Progress Preview */}
        <Card className="border-2 border-primary/10 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Savings Progress</CardTitle>
              <CardDescription>Actual vs Target Path</CardDescription>
            </div>
            <Link to="/savings-progress">
              <Button variant="ghost" size="sm">View Details</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {hasHistory ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData.monthly_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
                No monthly history found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Quick View */}
        <Card className="border-2 border-accent/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Trip Planner</CardTitle>
              <CardDescription>Estimate your next budget</CardDescription>
            </div>
            <Link to="/trip-estimator">
              <Button variant="ghost" size="sm">Go Plan</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Planning a trip to Ooty?</p>
                    <p className="text-xs text-muted-foreground">Estimate cost for 5 days</p>
                  </div>
                </div>
                <Link to="/trip-estimator" className="block">
                  <Button variant="outline" className="w-full text-xs h-8">Try Estimator</Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link to="/expense-tracker" className="block">
                  <div className="p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center">
                    <Receipt className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs font-medium">Track Expenses</p>
                  </div>
                </Link>
                <Link to="/expense-visualization" className="block">
                  <div className="p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center">
                    <PieIcon className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs font-medium">Visualize Spending</p>
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
