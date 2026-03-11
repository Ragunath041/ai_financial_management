import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { savingsAPI } from "@/services/api";
import { 
  DollarSign, 
  PiggyBank, 
  Home, 
  Utensils, 
  Bus, 
  Music, 
  Layers, 
  Calendar as CalendarIcon 
} from "lucide-react";

const CustomCard = ({ children, className }: any) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CustomCardHeader = ({ children }: any) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CustomCardTitle = ({ children }: any) => (
  <h3 className="text-2xl font-semibold leading-none tracking-tight font-display">{children}</h3>
);

const CustomCardDescription = ({ children }: any) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

const CustomCardContent = ({ children }: any) => (
  <div className="p-6 pt-0">{children}</div>
);

export default function MonthlyEntry() {
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    income: "",
    savings: "",
    rent: "",
    food: "",
    transportation: "",
    entertainment: "",
    others: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.month || !formData.income || !formData.savings) {
      toast({
        title: "Missing fields",
        description: "Please enter month, income and amount saved.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await savingsAPI.addMonthlyEntry({
        ...formData,
        income: parseFloat(formData.income),
        savings: parseFloat(formData.savings),
        rent: parseFloat(formData.rent || "0"),
        food: parseFloat(formData.food || "0"),
        transportation: parseFloat(formData.transportation || "0"),
        entertainment: parseFloat(formData.entertainment || "0"),
        others: parseFloat(formData.others || "0"),
      });
      toast({
        title: "Success",
        description: `Financial data for ${formData.month} saved successfully!`,
      });
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display">Monthly Savings Entry</h1>
        <p className="text-muted-foreground">
          Record your income, actual savings, and expenses for a specific month.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Time Period</CustomCardTitle>
            <CustomCardDescription>Select the month you wish to record data for.</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="month"
                    type="month"
                    className="pl-9"
                    value={formData.month}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CustomCardContent>
        </CustomCard>

        <div className="grid gap-8 md:grid-cols-2">
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Income & Savings</CustomCardTitle>
              <CustomCardDescription>Cash flow for the month.</CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="income"
                    type="number"
                    className="pl-9"
                    placeholder="e.g. 50000"
                    value={formData.income}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings">Amount Saved (₹)</Label>
                <div className="relative">
                  <PiggyBank className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="savings"
                    type="number"
                    className="pl-9"
                    placeholder="e.g. 15000"
                    value={formData.savings}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Expense Tracking</CustomCardTitle>
              <CustomCardDescription>Track where your money went.</CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rent">Rent (₹)</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="rent" type="number" className="pl-9" value={formData.rent} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food">Food (₹)</Label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="food" type="number" className="pl-9" value={formData.food} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportation">Transport (₹)</Label>
                  <div className="relative">
                    <Bus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="transportation" type="number" className="pl-9" value={formData.transportation} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entertainment">Entertainment (₹)</Label>
                  <div className="relative">
                    <Music className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="entertainment" type="number" className="pl-9" value={formData.entertainment} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="others">Other Expenses (₹)</Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="others" type="number" className="pl-9" value={formData.others} onChange={handleInputChange} />
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto min-w-[200px]">
            {loading ? "Saving..." : "Save Monthly Data"}
          </Button>
        </div>
      </form>
    </div>
  );
}
