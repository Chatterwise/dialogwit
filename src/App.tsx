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
import { Integrations } from "./components/Integrations/Integrations";
import { TemplateGallery } from "./components/TemplateGallery";
import { InstallationWizard } from "./components/InstallationWizard";
import { Settings } from "./components/Settings";
import { PublicChat } from "./components/PublicChat";
import { ApiEndpoints } from "./components/ApiEndpoints";
import { SecurityCenter } from "./components/SecurityCenter";
import { TestingTools } from "./components/TestingTools";
import { BillingDashboard } from "./components/BillingDashboard";
import { useAuth } from "./hooks/useAuth";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { EmailConfirmationRequired } from "./components/EmailConfirmationRequired";
import { Loader2 } from "lucide-react";
import ConfirmEmail from "./components/ConfirmEmail";
import { TokenUsageDashboard } from "./components/TokenUsageDashboard";
// import { ChatbotLimitGuard } from "./components/ChatbotLimitGuard";
import CancelPage from "./components/CancelPage";
import PricingPlans from "./components/PricingPlans";
import SuccessPage from "./components/SuccessPage";
import LandingPage from "./components/LandingPage";
import { ChatbotSettings } from "./components/ChatbotSettings";
import { ToastRenderer } from "./components/ToastRenderer";
import AboutUsPage from "./pages/AboutUsPage";
import ApiReferencePage from "./pages/ApiReferencePage";
import BlogPage from "./pages/BlogPage";
import CommunityPage from "./pages/CommunityPage";
import ContactPage from "./pages/ContactPage";
import DocumentationPage from "./pages/DocumentationPage";
import EnterprisePage from "./pages/EnterprisePage";
import FeaturesPage from "./pages/FeaturesPage";
import LegalPage from "./pages/LegalPage";
import { WebhookManager } from "./components/WebhookManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, loading, emailConfirmed } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={!user ? <LandingPage /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/auth"
        element={!user ? <Auth /> : <Navigate to="/dashboard" />}
      />
      <Route path="/auth/confirm" element={<ConfirmEmail />} />
      <Route path="/chat/:chatbotId" element={<PublicChat />} />
      <Route path="/pricing" element={<PricingPlans />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/cancel" element={<CancelPage />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />

      {/* Documentation pages - publicly accessible */}
      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/api-reference" element={<ApiReferencePage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/enterprise" element={<EnterprisePage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/legal" element={<LegalPage />} />
      {/* Protected routes */}
      <Route
        path="/*"
        element={
          user ? (
            emailConfirmed ? (
              <Layout>
                <Routes>
                  {/* Wrap chatbot-related routes with ChatbotLimitGuard */}
                  <Route path="/chatbots/new" element={<ChatbotBuilder />} />
                  <Route path="/chatbots/:id" element={<ChatbotDetail />} />
                  <Route
                    path="/chatbots/:id/knowledge"
                    element={<KnowledgeBase />}
                  />

                  {/* Other protected routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chatbots" element={<ChatbotList />} />
                  <Route
                    path="/chatbots/:id/settings"
                    element={<ChatbotSettings />}
                  />
                  <Route path="/bot-knowledge" element={<KnowledgeBase />} />
                  <Route path="/webhook" element={<WebhookManager />} />
                  <Route path="/usage" element={<TokenUsageDashboard />} />
                  <Route path="/analytics" element={<AdvancedAnalytics />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/templates" element={<TemplateGallery />} />
                  <Route path="/wizard" element={<InstallationWizard />} />
                  <Route path="/api" element={<ApiEndpoints />} />
                  <Route path="/security" element={<SecurityCenter />} />
                  <Route path="/testing" element={<TestingTools />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/billing" element={<BillingDashboard />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <EmailConfirmationRequired />
            )
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
        <ToastRenderer />
      </Router>
    </QueryClientProvider>
  );
}
