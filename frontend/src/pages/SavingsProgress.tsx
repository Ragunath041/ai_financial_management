import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { savingsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar 
} from "recharts";
import { TrendingUp, TrendingDown, Target, Info } from "lucide-react";

export default function SavingsProgress() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const result = await savingsAPI.getProgress();
      setData(result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Graphs...</div>;
  if (!data) return <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed">No savings goal set. Please set a goal first.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display">Savings Goal Tracker</h1>
        <p className="text-muted-foreground">
          Track your journey to your Goal: {data.goal_name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">Goal Amount</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{data.target_amount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">Total Saved</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">₹{data.total_saved.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">Progress</CardDescription>
            <CardTitle className="text-2xl font-bold text-orange-600">{data.progress_percentage}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="overflow-hidden border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Dynamic Monthly Savings
            </CardTitle>
            <CardDescription>
              Shows how much you saved each month. Fluctuations reflect actual monthly savings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Overall Savings Progress
            </CardTitle>
            <CardDescription>
              Cumulative growth of your savings against the set goal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.cumulative_trend}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                  {/* Goal Line Ref */}
                  <Line type="monotone" dataKey={() => data.target_amount} stroke="#000" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <Info className="h-4 w-4 shrink-0" />
        Note: The graphs above reflect real-time actual data from your monthly entries. If you haven't entered data for a month, it will show as 0.
      </div>
    </div>
  );
}
