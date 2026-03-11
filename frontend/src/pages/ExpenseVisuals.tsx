import { useState, useEffect } from "react";
import { savingsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieIcon, BarChart3 as BarIcon, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Note: Might need to check if Select exists in UI components

export default function ExpenseVisuals() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await savingsAPI.getMonthlyEntries();
      setEntries(data);
      if (data.length > 0) {
        setSelectedMonth(data[data.length - 1].entry_month);
      }
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

  const currentEntry = entries.find(e => e.entry_month === selectedMonth);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  const getPieData = () => {
    if (!currentEntry) return [];
    const ex = currentEntry.expenses;
    return [
      { name: "Rent", value: ex.rent },
      { name: "Food", value: ex.food },
      { name: "Transportation", value: ex.transportation },
      { name: "Entertainment", value: ex.entertainment },
      { name: "Others", value: ex.others },
    ].filter(i => i.value > 0);
  };

  const getBarData = () => {
    return entries.map(e => ({
      month: e.entry_month,
      rent: e.expenses.rent,
      food: e.expenses.food,
      transport: e.expenses.transportation,
      entertainment: e.expenses.entertainment,
      others: e.expenses.others
    }));
  };

  if (loading) return <div className="p-8 text-center">Loading Visualizations...</div>;
  if (entries.length === 0) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">Add monthly data to see visualizations.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Expense Visualization</h1>
          <p className="text-muted-foreground">Deep dive into your spending habits.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Month:</span>
          <select 
            className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {entries.map(e => (
              <option key={e.entry_month} value={e.entry_month}>{e.entry_month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-blue-500" />
              Category Breakdown
            </CardTitle>
            <CardDescription>Where your money went in {selectedMonth}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarIcon className="h-5 w-5 text-purple-500" />
              Monthly Comparison
            </CardTitle>
            <CardDescription>Expense trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getBarData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rent" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="food" stackId="a" fill="#10b981" />
                  <Bar dataKey="transport" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="entertainment" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="others" stackId="a" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-primary">Insight Placeholder</p>
              <p className="text-sm text-muted-foreground">
                Your highest expense category in {selectedMonth} was <span className="font-bold text-foreground">
                  {getPieData().length > 0 ? getPieData().sort((a,b) => b.value - a.value)[0].name : "N/A"}
                </span>. 
                Keep track of your spending patterns to optimize your savings!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
