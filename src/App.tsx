import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import DebtsPage from "@/pages/DebtsPage";
import PlanPage from "@/pages/PlanPage";
import TimelinePage from "@/pages/TimelinePage";
import ScenariosPage from "@/pages/ScenariosPage";
import SensitivityPage from "@/pages/SensitivityPage";
import ActivityPage from "@/pages/ActivityPage";
import SettingsPage from "@/pages/SettingsPage";
import ExtraPaymentsPage from "@/pages/ExtraPaymentsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/debts" element={<DebtsPage />} />
            <Route path="/extra-payments" element={<ExtraPaymentsPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/sensitivity" element={<SensitivityPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
