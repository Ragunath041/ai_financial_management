import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowRight, TrendingUp, Loader2, Calendar } from "lucide-react";
import { financialAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SavingsPrediction() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>(null);
  const [months, setMonths] = useState(12);
  const [projection, setProjection] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await financialAPI.get();
        setFinancialData(data);
        generateProjection(data, months);
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

  const generateProjection = (data: any, numMonths: number) => {
    if (!data) return;

    const monthlySavings = data.monthly_savings;
    const savingsGoal = data.savings_goal;

    const newProjection = [];
    for (let i = 0; i < numMonths; i++) {
      newProjection.push({
        month: `Month ${i + 1}`,
        savings: monthlySavings * (i + 1),
        goal: savingsGoal * (i + 1),
      });
    }
    setProjection(newProjection);
  };

  const handleMonthsChange = (value: string) => {
    const numMonths = parseInt(value) || 12;
    if (numMonths < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a number greater than 0",
        variant: "destructive",
      });
      return;
    }
    if (numMonths > 60) {
      toast({
        title: "Invalid Input",
        description: "Maximum 60 months allowed",
        variant: "destructive",
      });
      return;
    }
    setMonths(numMonths);
    generateProjection(financialData, numMonths);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Savings Prediction" description="ML-based projection of your savings over time" />
        <Card className="card-shadow border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No financial data available. Please add your financial information first.
          </CardContent>
        </Card>
      </div>
    );
  }

  const halfwayPoint = Math.floor(months / 2);
  const halfwaySavings = projection[halfwayPoint - 1]?.savings || 0;
  const totalProjectedSavings = projection[months - 1]?.savings || 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Savings Prediction" description="Customize your savings forecast timeline" />

      {/* Month Selector */}
      <Card className="card-shadow border-0 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 space-y-2 w-full sm:w-auto">
              <Label htmlFor="months" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Projection Period (Months)
              </Label>
              <Input
                id="months"
                type="number"
                min="1"
                max="60"
                value={months}
                onChange={(e) => handleMonthsChange(e.target.value)}
                className="w-full sm:w-48"
              />
              <p className="text-xs text-muted-foreground">Enter 1-60 months</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Total Projected Savings</p>
              <p className="font-display text-2xl font-bold text-primary">
                {formatCurrency(totalProjectedSavings)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">in {months} months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg">{months}-Month Savings Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projection}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }} 
                  interval={months > 24 ? Math.floor(months / 12) : months > 12 ? 1 : 0}
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1)" }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  name="Projected Savings" 
                  stroke="hsl(160,84%,32%)" 
                  strokeWidth={3} 
                  dot={{ r: months <= 12 ? 4 : 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="goal" 
                  name="Savings Goal" 
                  stroke="hsl(220,70%,45%)" 
                  strokeWidth={2} 
                  strokeDasharray="8 4" 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="card-shadow border-0 bg-success/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Halfway Point</p>
                <p className="font-display font-bold text-xl">
                  {formatCurrency(halfwaySavings)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  After {halfwayPoint} months
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Savings</p>
                <p className="font-display font-bold text-xl">
                  {formatCurrency(financialData.monthly_savings)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {financialData.savings_rate.toFixed(1)}% of salary
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Want to save more?</p>
              <p className="font-display font-semibold text-sm">Get optimization tips</p>
            </div>
            <Button asChild size="sm">
              <Link to="/advisor">
                View Tips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
