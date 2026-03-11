import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import MonthlyEntry from "./pages/MonthlyEntry";
import SavingsProgress from "./pages/SavingsProgress";
import ExpenseTracker from "./pages/ExpenseTracker";
import ExpenseVisuals from "./pages/ExpenseVisuals";
import TripEstimator from "./pages/TripEstimator";
import FinancialGoal from "./pages/FinancialGoal";
import ExpenseAdvisor from "./pages/ExpenseAdvisor";
import HealthScore from "./pages/HealthScore";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<FinancialGoal />} />
            <Route path="/monthly-entry" element={<MonthlyEntry />} />
            <Route path="/savings-progress" element={<SavingsProgress />} />
            <Route path="/expense-tracker" element={<ExpenseTracker />} />
            <Route path="/expense-visualization" element={<ExpenseVisuals />} />
            <Route path="/trip-estimator" element={<TripEstimator />} />
            <Route path="/advisor" element={<ExpenseAdvisor />} />
            <Route path="/health" element={<HealthScore />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
