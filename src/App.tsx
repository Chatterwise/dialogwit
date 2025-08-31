import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Layout } from "./components/Layout";
import { RouteBoundary } from "./components/RouteBoundary";
const Auth = lazy(() =>
  import("./components/Auth").then((m) => ({ default: m.Auth }))
);
const Dashboard = lazy(() =>
  import("./components/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const ChatbotList = lazy(() =>
  import("./components/ChatbotList").then((m) => ({ default: m.ChatbotList }))
);
const ChatbotBuilder = lazy(() =>
  import("./components/ChatbotBuilder").then((m) => ({
    default: m.ChatbotBuilder,
  }))
);
const ChatbotDetail = lazy(() =>
  import("./components/ChatbotDetail").then((m) => ({
    default: m.ChatbotDetail,
  }))
);
const KnowledgeBase = lazy(() =>
  import("./components/KnowledgeBase").then((m) => ({
    default: m.KnowledgeBase,
  }))
);
const AdvancedAnalytics = lazy(() =>
  import("./components/AdvancedAnalytics").then((m) => ({
    default: m.AdvancedAnalytics,
  }))
);
const Integrations = lazy(() =>
  import("./components/Integrations/Integrations").then((m) => ({
    default: m.Integrations,
  }))
);
const TemplateGallery = lazy(() =>
  import("./components/TemplateGallery").then((m) => ({
    default: m.TemplateGallery,
  }))
);
const InstallationWizard = lazy(() =>
  import("./components/InstallationWizard").then((m) => ({
    default: m.InstallationWizard,
  }))
);
const Settings = lazy(() =>
  import("./components/Settings").then((m) => ({ default: m.Settings }))
);
const PublicChat = lazy(() =>
  import("./components/PublicChat").then((m) => ({ default: m.PublicChat }))
);
const ApiEndpoints = lazy(() =>
  import("./components/ApiEndpoints").then((m) => ({ default: m.ApiEndpoints }))
);
const SecurityCenter = lazy(() =>
  import("./components/SecurityCenter").then((m) => ({
    default: m.SecurityCenter,
  }))
);
const TestingTools = lazy(() =>
  import("./components/TestingTools").then((m) => ({ default: m.TestingTools }))
);
const BillingDashboard = lazy(() =>
  import("./components/BillingDashboard").then((m) => ({
    default: m.BillingDashboard,
  }))
);
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
const LandingPage = lazy(() => import("./components/LandingPage"));
import { ChatbotSettings } from "./components/ChatbotSettings";
import { ToastRenderer } from "./components/ToastRenderer";
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ApiReferencePage = lazy(() => import("./pages/ApiReferencePage"));
// import BlogPage from "./pages/BlogPage";
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DocumentationPage = lazy(() => import("./pages/DocumentationPage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
import { WebhookManager } from "./components/WebhookManager";

// Documentation Pages
const CustomTemplatesPage = lazy(
  () => import("./pages/docs/advanced-features/CustomTemplatesPage")
);
const WebhooksPage = lazy(
  () => import("./pages/docs/advanced-features/WebhooksPage")
);
const SecurityBestPracticesPage = lazy(
  () => import("./pages/docs/advanced-features/SecurityBestPracticesPage")
);
const CustomerSupportBotPage = lazy(
  () => import("./pages/docs/tutorials/CustomerSupportBotPage")
);

// Documentation Category Pages
const GettingStartedPage = lazy(
  () => import("./pages/docs/getting-started/GettingStartedPage")
);
const AdvancedFeaturesPage = lazy(
  () => import("./pages/docs/advanced-features/AdvancedFeaturesPage")
);
const TutorialsPage = lazy(
  () => import("./pages/docs/tutorials/TutorialsPage")
);
const FirstChatbotPage = lazy(() => import("./pages/docs/FirstChatbotPage"));
const DiscordIntegrationPage = lazy(
  () => import("./pages/docs/integerations/DiscordIntegrationPage")
);
const IntegrationsPage = lazy(
  () => import("./pages/docs/integerations/IntegrationsPage")
);
const SlackIntegrationPage = lazy(
  () => import("./pages/docs/integerations/SlackIntegrationPage")
);
const WebsiteIntegrationPage = lazy(
  () => import("./pages/docs/integerations/WebsiteIntegrationPage")
);
const WordPressIntegrationPage = lazy(
  () => import("./pages/docs/integerations/WordPressIntegrationPage")
);
const IntroductionPage = lazy(() => import("./pages/docs/IntroductionPage"));
const KnowledgeBasePage = lazy(() => import("./pages/docs/KnowledgeBasePage"));
const TrainingChatbotPage = lazy(
  () => import("./pages/docs/TrainingChatbotPage")
);
const BotChatsPage = lazy(() =>
  import("./components/BotChatsPage").then((m) => ({ default: m.BotChatsPage }))
);
import { LanguageProvider } from "./contexts/LanguageContext"; // Import LanguageProvider
import LanguageRedirect from "./components/LanguageRedirect";
import LoadingScreen from "./components/LoadingScreen";

import * as progress from "./lib/progress";
import React from "react";
import { AnimatedSuspense } from "./components/utils/AnimatedSuspense";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onFetch: () => progress.start(),
    onError: () => progress.done(),
    onSuccess: () => progress.done(),
  }),
  mutationCache: new MutationCache({
    onMutate: () => progress.start(),
    onError: () => progress.done(),
    onSuccess: () => progress.done(),
    onSettled: () => progress.done(),
  }),
});

function AppContent() {
  const { user, loading, emailConfirmed } = useAuth();
  // Show progress on route changes
  const location = window.location;
  // naive: start on render, finish after paint
  useEffect(() => {
    progress.start();
    const id = window.setTimeout(() => progress.done(), 300);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

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
      {/* Redirect root to best language based on storage/browser */}
      <Route path="/" element={<LanguageRedirect />} />

      {/* All other routes are now nested within a /:lang route */}
      <Route
        path="/:lang/*"
        element={
          <AnimatedSuspense fallback={<LoadingScreen />}>
            <LanguageProvider>
              {/* LanguageProvider is now inside the /:lang route */}
              <Routes>
                {/* Public routes */}
                <Route
                  path="/" // This will match /:lang/
                  element={
                    !user ? <LandingPage /> : <Navigate to="dashboard" />
                  }
                />
                <Route
                  path="auth" // /:lang/auth
                  element={
                    !user ? <Auth /> : <Navigate to="../dashboard" replace />
                  }
                />
                <Route
                  path="auth/callback"
                  element={
                    user ? (
                      emailConfirmed ? (
                        <Navigate to="../dashboard" replace />
                      ) : (
                        <EmailConfirmationRequired />
                      )
                    ) : (
                      <Navigate to="../auth" replace />
                    )
                  }
                />
                <Route path="auth/confirm" element={<ConfirmEmail />} />
                <Route path="chat/:chatbotId" element={<PublicChat />} />
                <Route path="pricing" element={<PricingPlans />} />
                <Route path="success" element={<SuccessPage />} />
                <Route path="cancel" element={<CancelPage />} />
                <Route path="reset-password" element={<ResetPasswordForm />} />

                {/* Documentation pages - publicly accessible */}
                <Route path="documentation" element={<DocumentationPage />} />
                <Route path="api-reference" element={<ApiReferencePage />} />
                <Route path="features" element={<FeaturesPage />} />
                <Route path="enterprise" element={<EnterprisePage />} />
                <Route path="community" element={<CommunityPage />} />
                {/* <Route path="blog" element={<BlogPage />} /> */}
                <Route path="about" element={<AboutUsPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="legal" element={<LegalPage />} />

                {/* Documentation sub-pages */}
                {/* Category pages */}
                <Route
                  path="docs/getting-started"
                  element={<GettingStartedPage />}
                />
                <Route
                  path="docs/integrations"
                  element={<IntegrationsPage />}
                />
                <Route
                  path="docs/advanced-features"
                  element={<AdvancedFeaturesPage />}
                />
                <Route path="docs/tutorials" element={<TutorialsPage />} />

                {/* Getting Started section */}
                <Route
                  path="docs/getting-started/introduction"
                  element={<IntroductionPage />}
                />
                <Route
                  path="docs/getting-started/first-chatbot"
                  element={<FirstChatbotPage />}
                />
                <Route
                  path="docs/getting-started/knowledge-base"
                  element={<KnowledgeBasePage />}
                />
                <Route
                  path="docs/getting-started/training-chatbot"
                  element={<TrainingChatbotPage />}
                />

                {/* Integrations section */}
                <Route
                  path="docs/integrations/website-integration"
                  element={<WebsiteIntegrationPage />}
                />
                <Route
                  path="docs/integrations/slack-integration"
                  element={<SlackIntegrationPage />}
                />
                <Route
                  path="docs/integrations/discord-integration"
                  element={<DiscordIntegrationPage />}
                />
                <Route
                  path="docs/integrations/wordpress-integration"
                  element={<WordPressIntegrationPage />}
                />

                {/* Advanced Features section */}
                <Route
                  path="docs/advanced-features/custom-templates"
                  element={<CustomTemplatesPage />}
                />
                <Route
                  path="docs/advanced-features/webhooks"
                  element={<WebhooksPage />}
                />
                <Route
                  path="docs/advanced-features/security-best-practices"
                  element={<SecurityBestPracticesPage />}
                />

                {/* Tutorials section */}
                <Route
                  path="docs/tutorials/customer-support-bot"
                  element={<CustomerSupportBotPage />}
                />

                {/* Protected routes */}
                <Route
                  path="*"
                  element={
                    user ? (
                      emailConfirmed ? (
                        <Layout>
                          <Routes>
                            {/* Chatbot routes */}
                            <Route
                              path="chatbots/new"
                              element={
                                <RouteBoundary>
                                  <ChatbotBuilder />
                                </RouteBoundary>
                              }
                            />
                            <Route
                              path="chatbots/:id"
                              element={
                                <RouteBoundary>
                                  <ChatbotDetail />
                                </RouteBoundary>
                              }
                            />
                            <Route
                              path="chatbots/:id/chat"
                              element={<BotChatsPage />}
                            />
                            <Route
                              path="chatbots/:id/knowledge"
                              element={
                                <RouteBoundary>
                                  <KnowledgeBase />
                                </RouteBoundary>
                              }
                            />

                            {/* Other protected routes */}
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="chatbots" element={<ChatbotList />} />
                            <Route
                              path="chatbots/:id/settings"
                              element={<ChatbotSettings />}
                            />
                            <Route
                              path="bot-knowledge"
                              element={<KnowledgeBase />}
                            />
                            <Route
                              path="webhook"
                              element={<WebhookManager />}
                            />
                            <Route
                              path="usage"
                              element={<TokenUsageDashboard />}
                            />
                            <Route
                              path="analytics"
                              element={<AdvancedAnalytics />}
                            />
                            <Route
                              path="integrations"
                              element={
                                <RouteBoundary>
                                  <Integrations />
                                </RouteBoundary>
                              }
                            />
                            <Route
                              path="templates"
                              element={<TemplateGallery />}
                            />
                            <Route
                              path="wizard"
                              element={<InstallationWizard />}
                            />
                            <Route path="api" element={<ApiEndpoints />} />
                            <Route
                              path="security"
                              element={<SecurityCenter />}
                            />
                            <Route path="testing" element={<TestingTools />} />
                            <Route
                              path="settings"
                              element={
                                <RouteBoundary>
                                  <Settings />
                                </RouteBoundary>
                              }
                            />
                            <Route
                              path="billing"
                              element={<BillingDashboard />}
                            />
                            <Route
                              path="/"
                              element={<Navigate to="dashboard" />}
                            />
                          </Routes>
                        </Layout>
                      ) : (
                        <EmailConfirmationRequired />
                      )
                    ) : (
                      // IMPORTANT: keep the lang prefix by using a relative redirect
                      <Navigate to="../auth" replace />
                    )
                  }
                />
              </Routes>
            </LanguageProvider>
          </AnimatedSuspense>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
          <ToastRenderer />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
