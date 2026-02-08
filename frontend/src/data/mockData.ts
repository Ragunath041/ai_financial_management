export const userFinancials = {
  salary: 50000,
  rent: 12000,
  food: 8000,
  travel: 4000,
  others: 6000,
  savingsGoal: 15000,
  jobType: "IT" as const,
  city: "Bangalore",
  area: "Koramangala",
  rentBudget: 12000,
};

export const totalExpenses = userFinancials.rent + userFinancials.food + userFinancials.travel + userFinancials.others;
export const monthlySavings = userFinancials.salary - totalExpenses;

export const expenseBreakdown = [
  { name: "Rent", value: userFinancials.rent, color: "hsl(220, 70%, 45%)" },
  { name: "Food", value: userFinancials.food, color: "hsl(160, 84%, 40%)" },
  { name: "Travel", value: userFinancials.travel, color: "hsl(38, 92%, 50%)" },
  { name: "Others", value: userFinancials.others, color: "hsl(280, 60%, 50%)" },
];

export const savingsProjection = Array.from({ length: 12 }, (_, i) => ({
  month: `Month ${i + 1}`,
  savings: monthlySavings * (i + 1),
  goal: userFinancials.savingsGoal * (i + 1),
}));

export const monthlySavingsData = [
  { month: "Jan", savings: 18000 },
  { month: "Feb", savings: 20000 },
  { month: "Mar", savings: 17000 },
  { month: "Apr", savings: 22000 },
  { month: "May", savings: 19500 },
  { month: "Jun", savings: 21000 },
];

export const locationRecommendations = [
  { area: "Electronic City", avgRent: 8500, distance: "18 km", travelCost: 2500, tag: "Cheapest" },
  { area: "Whitefield", avgRent: 10000, distance: "12 km", travelCost: 2000, tag: "Best Balance" },
  { area: "HSR Layout", avgRent: 11500, distance: "6 km", travelCost: 1200, tag: "" },
  { area: "BTM Layout", avgRent: 9500, distance: "8 km", travelCost: 1500, tag: "" },
  { area: "Marathahalli", avgRent: 9000, distance: "10 km", travelCost: 1800, tag: "" },
];

export const expenseTips = [
  { tip: "Cook at home 3 days a week", savings: 2000, category: "Food", icon: "UtensilsCrossed" as const },
  { tip: "Use monthly bus/metro pass", savings: 1500, category: "Travel", icon: "Bus" as const },
  { tip: "Shift to shared accommodation", savings: 4000, category: "Rent", icon: "Home" as const },
  { tip: "Cancel unused subscriptions", savings: 800, category: "Others", icon: "Tv" as const },
  { tip: "Use UPI cashback offers", savings: 500, category: "Others", icon: "Smartphone" as const },
  { tip: "Meal prep on weekends", savings: 1200, category: "Food", icon: "Salad" as const },
];

export const healthScore = {
  overall: 68,
  savingsRatio: 72,
  expenseControl: 58,
  debtImpact: 85,
};

export const budgetInsights = [
  { text: "Rent consumes 24% of your salary", type: "warning" as const },
  { text: "Food expenses are 16% — slightly above average", type: "warning" as const },
  { text: "You can save ₹3,000/month by reducing food expenses", type: "success" as const },
  { text: "Travel costs are well managed at 8%", type: "success" as const },
  { text: "Current savings rate: 40% — excellent!", type: "success" as const },
];

export const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;
