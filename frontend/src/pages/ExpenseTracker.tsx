import { useState, useEffect } from "react";
import { savingsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Receipt, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ExpenseTracker() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await savingsAPI.getMonthlyEntries();
      setEntries(data);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">Expense Tracker</h1>
          <p className="text-muted-foreground">Monitor your spending across different months.</p>
        </div>
        <Link to="/monthly-entry">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Monthly Entry
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Monthly Expense Summary
            </CardTitle>
            <CardDescription>A consolidated view of your expenses per month.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center">Loading entries...</div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No monthly data found. Start by adding your first month's financials.
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead>Total Expenses</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.entry_month}</TableCell>
                        <TableCell>₹{entry.income.toLocaleString()}</TableCell>
                        <TableCell>₹{entry.savings_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          ₹{entry.total_expenses.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to="/monthly-entry">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
           <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-700">
                <ArrowRightLeft className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Average Monthly Expense</p>
                <p className="text-2xl font-bold text-blue-900">
                  ₹{entries.length > 0 
                    ? Math.round(entries.reduce((acc, curr) => acc + curr.total_expenses, 0) / entries.length).toLocaleString()
                    : 0}
                </p>
              </div>
            </CardContent>
           </Card>

           <Card className="bg-purple-50/50 border-purple-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-700">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Latest Month Expense</p>
                <p className="text-2xl font-bold text-purple-900">
                  ₹{entries.length > 0 
                    ? entries[entries.length - 1].total_expenses.toLocaleString()
                    : 0}
                </p>
              </div>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
