import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { UtensilsCrossed, Bus, Home, Tv, Smartphone, Salad, ArrowDown, Loader2 } from "lucide-react";
import { analysisAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  UtensilsCrossed,
  Bus,
  Home,
  Tv,
  Smartphone,
  Salad,
};

const categoryColors: Record<string, string> = {
  Food: "bg-chart-food/10 text-chart-food",
  Travel: "bg-chart-travel/10 text-chart-travel",
  Rent: "bg-chart-rent/10 text-chart-rent",
  Others: "bg-chart-others/10 text-chart-others",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ExpenseAdvisor() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<any[]>([]);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        setLoading(true);
        const expenseTips = await analysisAPI.getExpenseTips();
        setTips(expenseTips);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load expense tips",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tips.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expense Reduction Advisor" description="AI-curated tips to optimize your monthly spending" />
        <Card className="card-shadow border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No financial data available. Please add your financial information first.
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPotentialSavings = tips.reduce((s, t) => s + t.savings, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Expense Reduction Advisor" description="AI-curated tips to optimize your monthly spending" />

      <Card className="card-shadow border-0 bg-accent/5">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <ArrowDown className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Potential Monthly Savings</p>
            <p className="font-display text-2xl font-bold text-accent">
              {formatCurrency(totalPotentialSavings)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip, i) => {
          const Icon = iconMap[tip.icon] || Smartphone;
          return (
            <Card
              key={i}
              className="card-shadow border-0 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className={categoryColors[tip.category] || ""}>
                    {tip.category}
                  </Badge>
                </div>
                <p className="font-medium">{tip.tip}</p>
                <p className="text-success font-display font-bold text-lg">
                  Save {formatCurrency(tip.savings)}/mo
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
