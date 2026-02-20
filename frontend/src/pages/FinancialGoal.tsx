import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowRight, TrendingUp, Loader2, Calendar, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { financialAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function FinancialGoal() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>(null);
  const [projection, setProjection] = useState<any[]>([]);
  const [viewType, setViewType] = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await financialAPI.get();
        if (data) {
          setFinancialData(data);
          generatePlan(data);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load financial data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generatePlan = (data: any) => {
    if (!data) return;

    const monthlySavings = data.monthly_savings;
    const targetBudget = data.savings_goal || 0;
    const targetYears = data.target_years || 1;
    const totalMonths = targetYears * 12;

    const newProjection = [];
    
    // Yearly breakdown
    if (viewType === "yearly") {
      for (let i = 1; i <= targetYears; i++) {
        const yearMonths = i * 12;
        newProjection.push({
          label: `Year ${i}`,
          savings: monthlySavings * yearMonths,
          target: (targetBudget / targetYears) * i,
        });
      }
    } else {
      // Monthly breakdown
      for (let i = 1; i <= totalMonths; i++) {
        newProjection.push({
          label: `Month ${i}`,
          savings: monthlySavings * i,
          target: (targetBudget / totalMonths) * i,
        });
      }
    }
    setProjection(newProjection);
  };

  useEffect(() => {
    if (financialData) {
      generatePlan(financialData);
    }
  }, [viewType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!financialData || !financialData.goal_name) {
    return (
      <div className="space-y-6">
        <PageHeader title="Financial Goal" description="Plan your path to achieve your dreams" />
        <Card className="card-shadow border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="mb-4">No financial goal set. Please add your goal in the financial details page.</p>
            <Button asChild>
              <Link to="/input">Set a Goal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const targetBudget = financialData.savings_goal;
  const targetYears = financialData.target_years;
  const currentMonthlySavings = financialData.monthly_savings;
  const neededMonthlySavings = targetBudget / (targetYears * 12);
  const isOnTrack = currentMonthlySavings >= neededMonthlySavings;
  const savingsGap = Math.max(0, neededMonthlySavings - currentMonthlySavings);

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Goal: ${financialData.goal_name}`} 
        description={`Planning to achieve ${formatCurrency(targetBudget)} in ${targetYears} years`} 
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Progress Overview Card */}
        <Card className="card-shadow border-0 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="yearly" className="w-full" onValueChange={(v) => setViewType(v as any)}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="yearly">Yearly View</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly View</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1)" }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="savings" 
                      name="Your Projection" 
                      stroke="hsl(160,84%,32%)" 
                      strokeWidth={3} 
                      dot={{ r: 4 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      name="Required Path" 
                      stroke="hsl(220,70%,45%)" 
                      strokeWidth={2} 
                      strokeDasharray="8 4" 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className={`card-shadow border-0 ${isOnTrack ? "bg-success/5" : "bg-warning/5"}`}>
          <CardHeader>
            <CardTitle className="text-lg font-display">Status Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center p-4">
              {isOnTrack ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-success mb-3" />
                  <h3 className="text-xl font-bold text-success">On Track!</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your current savings of {formatCurrency(currentMonthlySavings)}/month is enough to reach your goal.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-warning mb-3" />
                  <h3 className="text-xl font-bold text-warning">Action Needed</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    You need to save {formatCurrency(savingsGap)} more per month to reach your goal on time.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required Savings:</span>
                <span className="font-semibold">{formatCurrency(neededMonthlySavings)}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Savings:</span>
                <span className="font-semibold">{formatCurrency(currentMonthlySavings)}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Period:</span>
                <span className="font-semibold">{targetYears} Years</span>
              </div>
            </div>

            {!isOnTrack && (
              <Button asChild className="w-full mt-4" variant="outline">
                <Link to="/advisor">
                  How to save ₹{Math.round(savingsGap)} more?
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Plan Table */}
      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="text-lg font-display">Achievement Plan ({viewType === 'yearly' ? 'Yearly' : 'Monthly'})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 font-semibold">{viewType === 'yearly' ? 'Year' : 'Month'}</th>
                  <th className="pb-3 font-semibold">Projected Savings</th>
                  <th className="pb-3 font-semibold">Target Milestones</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {projection.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-4">{item.label}</td>
                    <td className="py-4 font-medium text-success">{formatCurrency(item.savings)}</td>
                    <td className="py-4 text-muted-foreground">{formatCurrency(item.target)}</td>
                    <td className="py-4">
                      {item.savings >= item.target ? (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">Ahead</span>
                      ) : (
                        <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full font-medium">Behind</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
