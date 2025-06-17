import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { Auth } from "./components/Auth";
import { Dashboard } from "./components/Dashboard";
import { ChatbotList } from "./components/ChatbotList";
import { ChatbotBuilder } from "./components/ChatbotBuilder";
import { ChatbotDetail } from "./components/ChatbotDetail";
import { KnowledgeBase } from "./components/KnowledgeBase";
import { AdvancedAnalytics } from "./components/AdvancedAnalytics";
import { Integrations } from "./components/Integrations";
import { TemplateGallery } from "./components/TemplateGallery";
import { InstallationWizard } from "./components/InstallationWizard";
import { Settings } from "./components/Settings";
import { PublicChat } from "./components/PublicChat";
import { ApiEndpoints } from "./components/ApiEndpoints";
import { SecurityCenter } from "./components/SecurityCenter";
import { TestingTools } from "./components/TestingTools";
import { BillingDashboard } from "./components/BillingDashboard";
import { PricingPlans } from "./components/PricingPlans";
import { SuccessPage } from "./components/SuccessPage";
import { CancelPage } from "./components/CancelPage";
import { useAuth } from "./hooks/useAuth";
import { EmailNotificationScheduler } from "./components/EmailNotificationScheduler";
import { ConfirmEmail } from "./components/ConfirmEmail";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Email notification scheduler - always mounted when user is logged in */}
      {user && <EmailNotificationScheduler />}
      
      <Routes>
        {/* Public routes */}
        <Route path="/chat/:botId" element={<PublicChat />} />
        <Route path="/pricing" element={<PricingPlans />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/auth/confirm" element={<ConfirmEmail />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        
        {/* Auth routes */}
        {!user ? (
          <>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chatbots" element={<ChatbotList />} />
            <Route path="/chatbots/new" element={<ChatbotBuilder />} />
            <Route path="/chatbots/:id" element={<ChatbotDetail />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/analytics" element={<AdvancedAnalytics />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/templates" element={<TemplateGallery />} />
            <Route path="/wizard" element={<InstallationWizard />} />
            <Route path="/api" element={<ApiEndpoints />} />
            <Route path="/security" element={<SecurityCenter />} />
            <Route path="/testing" element={<TestingTools />} />
            <Route path="/billing" element={<BillingDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;