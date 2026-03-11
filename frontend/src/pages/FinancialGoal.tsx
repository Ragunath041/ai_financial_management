import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Calendar, IndianRupee, CheckCircle2, Loader2 } from "lucide-react";
import { savingsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function FinancialGoal() {
  const [formData, setFormData] = useState({
    goalName: "",
    targetAmount: "",
    durationMonths: "",
  });
  const [currentGoal, setCurrentGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const goal = await savingsAPI.getGoal();
      if (goal) {
        setCurrentGoal(goal);
        setFormData({
          goalName: goal.goal_name,
          targetAmount: goal.target_amount.toString(),
          durationMonths: goal.duration_months.toString(),
        });
      }
    } catch (error: any) {
      // 404 is fine, means no goal set yet
      if (error.status !== 404) {
        console.error("Failed to fetch goal", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goalName || !formData.targetAmount || !formData.durationMonths) {
      toast({
        title: "Missing fields",
        description: "Please fill in all goal details.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await savingsAPI.setGoal({
        goalName: formData.goalName,
        targetAmount: parseFloat(formData.targetAmount),
        durationMonths: parseInt(formData.durationMonths),
      });
      setCurrentGoal(result.goal);
      toast({
        title: "Success",
        description: "Savings goal set successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display">Savings Goal Setup</h1>
        <p className="text-muted-foreground">
          Define what you're saving for and set your target timeline.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle>Set Your Goal</CardTitle>
            <CardDescription>Enter the details for your financial objective.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="goalName"
                    placeholder="e.g. Buy a Car, Emergency Fund"
                    className="pl-9"
                    value={formData.goalName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Goal Amount (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="e.g. 100000"
                    className="pl-9"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMonths">Duration (Months)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="durationMonths"
                    type="number"
                    placeholder="e.g. 12"
                    className="pl-9"
                    value={formData.durationMonths}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : currentGoal ? "Update Goal" : "Set Goal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {currentGoal ? (
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  Current Active Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Goal Name</p>
                  <p className="text-xl font-bold">{currentGoal.goal_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="text-lg font-semibold">₹{currentGoal.target_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">{currentGoal.duration_months} Months</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    Required average monthly savings: 
                    <span className="font-bold ml-1 text-primary">
                      ₹{Math.round(currentGoal.target_amount / currentGoal.duration_months).toLocaleString()}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
               <CardContent className="p-6">
                  <p className="text-sm text-center text-muted-foreground italic">
                    "Setting a clear goal is the first step toward financial freedom."
                  </p>
               </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center p-8 bg-muted/20 border-dashed border-2">
            <div className="text-center space-y-4">
              <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">No goal set yet. Use the form to get started!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
