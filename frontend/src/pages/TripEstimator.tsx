import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, IndianRupee, PieChart as PieChartIcon } from "lucide-react";
import { tripAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Simple Card component as fallback if ui/card not found or specialized
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

export default function TripEstimator() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !days) {
      toast({
        title: "Missing fields",
        description: "Please enter destination and number of days.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await tripAPI.estimate({ destination, days: parseInt(days) });
      setEstimate(result);
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

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];
  
  const chartData = estimate ? [
    { name: "Stay & Food", value: estimate.breakdown.stay_and_food },
    { name: "Travel", value: estimate.breakdown.travel },
    { name: "Activities", value: estimate.breakdown.activities },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display">Trip Cost Estimator</h1>
        <p className="text-muted-foreground">
          Plan your next adventure with our smart budget estimator.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Trip Details</CustomCardTitle>
            <CustomCardDescription>Enter where you're going and for how long.</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <form onSubmit={handleEstimate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder="e.g. Ooty, Goa, Manali"
                    className="pl-9"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">Number of Days</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="days"
                    type="number"
                    placeholder="e.g. 5"
                    className="pl-9"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Calculating..." : "Estimate Cost"}
              </Button>
            </form>
          </CustomCardContent>
        </CustomCard>

        {estimate && (
          <CustomCard className="bg-primary/5 border-primary/20">
            <CustomCardHeader>
              <CustomCardTitle className="text-primary flex items-center gap-2">
                <IndianRupee className="h-6 w-6" />
                Total Estimate: ₹{estimate.estimated_cost.toLocaleString()}
              </CustomCardTitle>
              <CustomCardDescription>
                Based on travel patterns for {estimate.destination} for {estimate.days} days.
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      {item.name}
                    </span>
                    <span className="font-semibold">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CustomCardContent>
          </CustomCard>
        )}
      </div>
    </div>
  );
}
