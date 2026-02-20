import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { IndianRupee, Briefcase, MapPin } from "lucide-react";
import { financialAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function FinancialInput() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    salary: "",
    rent: "",
    food: "",
    travel: "",
    others: "",
    savingsGoal: "",
    goalName: "",
    targetYears: "1",
    jobType: "",
    city: "",
    area: "",
    rentBudget: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await financialAPI.get();
        if (response) {
          setForm({
            salary: response.salary?.toString() || "",
            rent: response.rent?.toString() || "",
            food: response.food?.toString() || "",
            travel: response.travel?.toString() || "",
            others: response.others?.toString() || "",
            savingsGoal: response.savings_goal?.toString() || "",
            goalName: response.goal_name || "",
            targetYears: response.target_years?.toString() || "1",
            jobType: response.jobType || "",
            city: response.city || "",
            area: response.area || "",
            rentBudget: response.rentBudget?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Error fetching financial data:", error);
      }
    };
    fetchData();
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    // Check if all numeric fields are positive numbers
    const numericFields = ['salary', 'rent', 'food', 'travel', 'others', 'savingsGoal', 'targetYears', 'rentBudget'];
    
    for (const field of numericFields) {
      const value = parseFloat(form[field as keyof typeof form]);
      if (isNaN(value) || value < 0) {
        toast({
          title: "Validation Error",
          description: `Please enter a valid positive number for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Check if salary is greater than 0
    if (parseFloat(form.salary) === 0) {
      toast({
        title: "Validation Error",
        description: "Monthly salary must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    // Check if text fields are not empty
    if (!form.city.trim() || !form.area.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all location details",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await financialAPI.createOrUpdate(form);
      
      toast({
        title: "Success!",
        description: "Financial data saved successfully.",
      });

      navigate("/analysis");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save financial data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Financial Details"
        description="Enter your income and expense details for personalized AI analysis"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-accent" />
              Income & Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Monthly Salary", field: "salary" },
              { label: "Rent Expense", field: "rent" },
              { label: "Food Expense", field: "food" },
              { label: "Travel Expense", field: "travel" },
              { label: "Other Expenses", field: "others" },
              { label: "Goal Budget", field: "savingsGoal" },
            ].map(({ label, field }) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{label} (₹)</Label>
                <Input
                  id={field}
                  type="number"
                  value={form[field as keyof typeof form]}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name (e.g. Dream Home)</Label>
              <Input
                id="goalName"
                type="text"
                value={form.goalName}
                onChange={(e) => update("goalName", e.target.value)}
                placeholder="Buy a car"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetYears">Target Years</Label>
              <Input
                id="targetYears"
                type="number"
                value={form.targetYears}
                onChange={(e) => update("targetYears", e.target.value)}
                placeholder="5"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-accent" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Input 
                id="jobType"
                type="text" 
                value={form.jobType} 
                onChange={(e) => update("jobType", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Location & Rent Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input id="area" value={form.area} onChange={(e) => update("area", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="rentBudget">Rent Budget (₹)</Label>
              <Input
                id="rentBudget"
                type="number"
                value={form.rentBudget}
                onChange={(e) => update("rentBudget", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Analyze My Finances"}
        </Button>
      </form>
    </div>
  );
}
