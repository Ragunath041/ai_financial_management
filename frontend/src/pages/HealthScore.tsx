import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Activity, PiggyBank, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { analysisAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 71 ? "hsl(160, 84%, 32%)" : score >= 41 ? "hsl(38, 92%, 50%)" : "hsl(0, 72%, 51%)";
  const label = score >= 71 ? "Good" : score >= 41 ? "Average" : "Poor";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 100 100" className="animate-scale-in">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(220,13%,91%)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
        <text x="50" y="46" textAnchor="middle" className="fill-foreground font-display" fontSize="20" fontWeight="700">
          {score}
        </text>
        <text x="50" y="60" textAnchor="middle" className="fill-muted-foreground" fontSize="8">
          out of 100
        </text>
      </svg>
      <span
        className="px-3 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </span>
    </div>
  );
}

export default function HealthScore() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState<any>(null);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        setLoading(true);
        const data = await analysisAPI.getDashboard();
        setHealthScore(data.health_score);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load health score",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHealthScore();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!healthScore) {
    return (
      <div className="space-y-6">
        <PageHeader title="Financial Health Score" description="A comprehensive assessment of your financial well-being" />
        <Card className="card-shadow border-0">
          <CardContent className="p-8 text-center text-muted-foreground">
            No financial data available. Please add your financial information first.
          </CardContent>
        </Card>
      </div>
    );
  }

  const breakdownItems = [
    { label: "Savings Ratio", score: healthScore.savings_ratio, icon: PiggyBank, description: "Proportion of income saved monthly" },
    { label: "Expense Control", score: healthScore.expense_control, icon: ShieldCheck, description: "How well expenses are managed" },
    { label: "Debt Impact", score: healthScore.debt_impact, icon: CreditCard, description: "Effect of existing debts on finances" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Health Score" description="A comprehensive assessment of your financial well-being" />

      <Card className="card-shadow border-0">
        <CardContent className="p-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 text-muted-foreground">
            <Activity className="h-5 w-5" />
            <span className="font-display font-semibold">Your Financial Health Score</span>
          </div>
          <ScoreRing score={healthScore.overall} size={200} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {breakdownItems.map((item) => {
          const color =
            item.score >= 71
              ? "text-success"
              : item.score >= 41
              ? "text-warning"
              : "text-destructive";

          return (
            <Card key={item.label} className="card-shadow border-0">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className={`font-display text-3xl font-bold ${color}`}>{item.score}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.score}%`,
                      backgroundColor:
                        item.score >= 71
                          ? "hsl(160,84%,32%)"
                          : item.score >= 41
                          ? "hsl(38,92%,50%)"
                          : "hsl(0,72%,51%)",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Color Legend */}
      <Card className="card-shadow border-0">
        <CardContent className="p-5">
          <p className="text-sm font-medium mb-3">Score Legend</p>
          <div className="flex flex-wrap gap-6">
            {[
              { range: "71–100", label: "Good", color: "hsl(160,84%,32%)" },
              { range: "41–70", label: "Average", color: "hsl(38,92%,50%)" },
              { range: "0–40", label: "Poor", color: "hsl(0,72%,51%)" },
            ].map((item) => (
              <div key={item.range} className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                <span className="text-muted-foreground">{item.range}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
