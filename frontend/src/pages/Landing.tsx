import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, PiggyBank, Shield, Sparkles, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";
import { authAPI } from "@/services/api";

const features = [
  {
    icon: BarChart3,
    title: "Smart Budget Analysis",
    description: "AI-powered expense breakdown with actionable insights to optimize your spending.",
  },
  {
    icon: TrendingUp,
    title: "Financial Goal Planning",
    description: "Set your long-term dreams and get a personalized year-by-year achievement roadmap.",
  },
  {
    icon: Shield,
    title: "Financial Health Score",
    description: "Get a comprehensive score reflecting your overall financial well-being.",
  },
  {
    icon: Sparkles,
    title: "Expense Optimization",
    description: "Personalized tips to reduce costs based on your location and lifestyle.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (authAPI.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-display text-xl font-bold text-gradient">
            FinAI Planner
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center pt-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              AI-Powered Financial Planning
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Smart budgeting for a{" "}
              <span className="text-gradient">brighter future</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Smart budgeting, savings prediction, and cost optimization using AI.
              Take control of your finances with data-driven insights.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <img
              src={heroImage}
              alt="Financial planning illustration with charts and savings icons"
              className="w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold">
              Everything you need to manage your money
            </h2>
            <p className="mt-3 text-muted-foreground">
              Powered by AI to give you the smartest financial recommendations.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border bg-background p-6 card-shadow transition-all hover:-translate-y-1 hover:card-shadow-lg animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <f.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © 2026 FinAI Planner — AI-Powered Personal Financial Planning System
        </div>
      </footer>
    </div>
  );
}
