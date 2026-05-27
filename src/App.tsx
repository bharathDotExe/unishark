import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Signup from "./pages/Signup.tsx";
import VerifyOtp from "./pages/VerifyOtp.tsx";
import Login from "./pages/Login.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PitchForm from "./pages/PitchForm.tsx";
import BrowsePitches from "./pages/BrowsePitches.tsx";
import PitchDetail from "./pages/PitchDetail.tsx";
import Admin from "./pages/Admin.tsx";
import Profile from "./pages/Profile.tsx";
import MyPitches from "./pages/MyPitches.tsx";
import NotFound from "./pages/NotFound.tsx";
import PitchSecurity from "./pages/PitchSecurity.tsx";
import Messages from "./pages/Messages.tsx";
import StudentOnboarding from "./pages/onboarding/StudentOnboarding.tsx";
import InvestorOnboarding from "./pages/onboarding/InvestorOnboarding.tsx";
import { ThemeProvider } from "next-themes";
import CustomCursor from "./components/CustomCursor.tsx";
import StudentLayout from "./components/StudentLayout.tsx";

// Investor pages & layout
import InvestorLayout from "./components/InvestorLayout.tsx";
import InvestorDashboard from "./pages/investor/InvestorDashboard.tsx";
import Bookmarks from "./pages/investor/Bookmarks.tsx";
import Portfolio from "./pages/investor/Portfolio.tsx";
import InvestmentDetail from "./pages/investor/InvestmentDetail.tsx";
import Analytics from "./pages/investor/Analytics.tsx";
import InvestorProfile from "./pages/investor/InvestorProfile.tsx";

const queryClient = new QueryClient();

// Role-based Wrappers
const DashboardWrapper = () => {
  const { roles } = useAuth();
  if (roles.includes("investor")) return <InvestorLayout><InvestorDashboard /></InvestorLayout>;
  return <StudentLayout><Dashboard /></StudentLayout>;
};

const MessagesWrapper = () => {
  const { roles } = useAuth();
  if (roles.includes("investor")) return <InvestorLayout><Messages /></InvestorLayout>;
  return <StudentLayout><Messages /></StudentLayout>;
};

const ProfileWrapper = () => {
  const { roles } = useAuth();
  if (roles.includes("investor")) return <InvestorLayout><InvestorProfile /></InvestorLayout>;
  if (roles.includes("student")) return <StudentLayout><Profile /></StudentLayout>;
  return <Profile />;
};

const PitchesWrapper = () => {
  const { roles } = useAuth();
  if (roles.includes("investor")) return <InvestorLayout><BrowsePitches /></InvestorLayout>;
  if (roles.includes("student")) return <StudentLayout><BrowsePitches /></StudentLayout>;
  return <BrowsePitches />;
};

const PitchDetailWrapper = () => {
  const { roles } = useAuth();
  if (roles.includes("investor")) return <InvestorLayout><PitchDetail /></InvestorLayout>;
  if (roles.includes("student")) return <StudentLayout><PitchDetail /></StudentLayout>;
  return <PitchDetail />;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.03] mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>")`}}></div>
        <CustomCursor />
        <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Onboarding */}
            <Route path="/onboarding/student" element={<ProtectedRoute><StudentOnboarding /></ProtectedRoute>} />
            <Route path="/onboarding/investor" element={<ProtectedRoute><InvestorOnboarding /></ProtectedRoute>} />

            {/* Shared & Role-Switched Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesWrapper /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileWrapper /></ProtectedRoute>} />
            <Route path="/pitches" element={<ProtectedRoute><PitchesWrapper /></ProtectedRoute>} />
            <Route path="/pitches/:id" element={<ProtectedRoute><PitchDetailWrapper /></ProtectedRoute>} />

            {/* Investor-only Routes */}
            <Route path="/bookmarks" element={<ProtectedRoute requireRole="investor"><InvestorLayout><Bookmarks /></InvestorLayout></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute requireRole="investor"><InvestorLayout><Portfolio /></InvestorLayout></ProtectedRoute>} />
            <Route path="/portfolio/:id" element={<ProtectedRoute requireRole="investor"><InvestorLayout><InvestmentDetail /></InvestorLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute requireRole="investor"><InvestorLayout><Analytics /></InvestorLayout></ProtectedRoute>} />

            {/* Student routes wrapped in StudentLayout */}
            <Route element={<StudentLayout />}>
              <Route path="/pitches/view" element={<ProtectedRoute requireRole="student"><MyPitches /></ProtectedRoute>} />
              <Route path="/pitches/create" element={<ProtectedRoute requireRole="student"><PitchForm /></ProtectedRoute>} />
              <Route path="/pitches/:id/edit" element={<ProtectedRoute requireRole="student"><PitchForm /></ProtectedRoute>} />
              <Route path="/pitches/:id/security" element={<ProtectedRoute requireRole="student"><PitchSecurity /></ProtectedRoute>} />
              <Route path="/investors" element={<ProtectedRoute requireRole="student"><div className="p-8">Investors Page (Coming Soon)</div></ProtectedRoute>} />
              <Route path="/deals" element={<ProtectedRoute requireRole="student"><div className="p-8">Deals (Coming Soon)</div></ProtectedRoute>} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute requireRole="admin"><Admin /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
