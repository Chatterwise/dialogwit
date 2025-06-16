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
import { Integrations } from "./components/Integrations";
import { TemplateGallery } from "./components/TemplateGallery";
import { InstallationWizard } from "./components/InstallationWizard";
import { Settings } from "./components/Settings";
import { PublicChat } from "./components/PublicChat";
import { useAuth } from "./hooks/useAuth";

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
    <Routes>
      {/* Public routes */}
      <Route path="/chat/:botId" element={<PublicChat />} />
      
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
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/templates" element={<TemplateGallery />} />
          <Route path="/wizard" element={<InstallationWizard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      )}
    </Routes>
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