import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { lazy, useEffect } from "react";
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
import CookieBanner from "./components/CookieBanner";
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ApiReferencePage = lazy(() => import("./pages/ApiReferencePage"));
// import BlogPage from "./pages/BlogPage";
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DocumentationPage = lazy(() => import("./pages/DocumentationPage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
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
import { LanguageProvider } from "./contexts/LanguageContext";
import LanguageRedirect from "./components/LanguageRedirect";
import LoadingScreen from "./components/LoadingScreen";

import * as progress from "./lib/progress";
import { AnimatedSuspense } from "./components/utils/AnimatedSuspense";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
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

// --- Legacy redirect helper (adds /{lang} and preserves ?query) ---
function LangPrefixedRedirect({ toBase }: { toBase: string }) {
  const location = useLocation();
  const stored = localStorage.getItem("lang");
  const browser = navigator.language?.split("-")[0];
  const lang = stored || browser || "en";
  return <Navigate to={`/${lang}${toBase}${location.search}`} replace />;
}

function AppContent() {
  const { user, loading, emailConfirmed } = useAuth();
  const location = window.location;

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
      {/* Root language redirect */}
      <Route path="/" element={<LanguageRedirect />} />

      {/* Legacy, non-lang-prefixed routes → redirect to /{lang}/... */}
      <Route
        path="/auth/confirm"
        element={<LangPrefixedRedirect toBase="/auth/confirm" />}
      />
      <Route
        path="/auth/callback"
        element={<LangPrefixedRedirect toBase="/auth/callback" />}
      />
      <Route
        path="/reset-password"
        element={<LangPrefixedRedirect toBase="/reset-password" />}
      />

      {/* All other routes are nested under /:lang */}
      <Route
        path="/:lang/*"
        element={
          <AnimatedSuspense fallback={<LoadingScreen />}>
            <LanguageProvider>
              <Routes>
                {/* Public */}
                <Route
                  path="/"
                  element={
                    !user ? <LandingPage /> : <Navigate to="dashboard" />
                  }
                />
                <Route
                  path="auth"
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

                {/* Docs (public) */}
                <Route path="documentation" element={<DocumentationPage />} />
                <Route path="api-reference" element={<ApiReferencePage />} />
                <Route path="features" element={<FeaturesPage />} />
                <Route path="enterprise" element={<EnterprisePage />} />
                <Route path="community" element={<CommunityPage />} />
                {/* <Route path="blog" element={<BlogPage />} /> */}
                <Route path="about" element={<AboutUsPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="legal" element={<LegalPage />} />
                <Route path="privacy" element={<PrivacyPolicyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="cookies" element={<CookiePolicyPage />} />

                {/* Docs sub-pages */}
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
                <Route
                  path="docs/tutorials/customer-support-bot"
                  element={<CustomerSupportBotPage />}
                />

                {/* Protected */}
                <Route
                  path="*"
                  element={
                    user ? (
                      emailConfirmed ? (
                        <Layout>
                          <Routes>
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
                      <Navigate to="../auth" replace />
                    )
                  }
                />
              </Routes>
              <CookieBanner />
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
