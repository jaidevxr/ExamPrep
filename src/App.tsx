import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { ChatPopupProvider } from "@/contexts/ChatPopupContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GlobalMusicPlayer } from "@/components/GlobalMusicPlayer";
import { GlobalChatPopup } from "@/components/GlobalChatPopup";
import { GlobalUsernameSetup } from "@/components/GlobalUsernameSetup";
import { CloudProgressProvider } from "@/hooks/useCloudProgress";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import Planner from "./pages/Planner";
import EnhancedChat from "./pages/EnhancedChat";
import Analytics from "./pages/Analytics";
import Friends from "./pages/Friends";
import Messages from "./pages/Messages";
import ProfileSettings from "./pages/ProfileSettings";
import Admin from "./pages/Admin";
import Resources from "./pages/Resources";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MusicPlayerProvider>
            <CloudProgressProvider>
              <ChatPopupProvider>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
                  <Route path="/subject/:id" element={<ProtectedRoute><SubjectDetail /></ProtectedRoute>} />
                  <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/messages/:friendId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><EnhancedChat /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <GlobalChatPopup />
                <GlobalUsernameSetup />
                <GlobalMusicPlayer />
              </ChatPopupProvider>
            </CloudProgressProvider>
          </MusicPlayerProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
