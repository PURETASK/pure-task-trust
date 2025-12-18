import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import CleanerProfile from "./pages/CleanerProfile";
import Book from "./pages/Book";
import BookingStatus from "./pages/BookingStatus";
import JobInProgress from "./pages/JobInProgress";
import JobApproval from "./pages/JobApproval";
import Wallet from "./pages/Wallet";
import Messages from "./pages/Messages";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

// Cleaner pages
import CleanerDashboard from "./pages/cleaner/CleanerDashboard";
import CleanerSchedule from "./pages/cleaner/CleanerSchedule";
import CleanerEarnings from "./pages/cleaner/CleanerEarnings";
import CleanerReferral from "./pages/cleaner/CleanerReferral";
import CleanerMessages from "./pages/cleaner/CleanerMessages";
import CancellationPolicy from "./pages/cleaner/CancellationPolicy";
import CleanerProfileSettings from "./pages/cleaner/CleanerProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/cleaner/:id" element={<CleanerProfile />} />
            <Route path="/book" element={<Book />} />
            <Route path="/booking/:id" element={<BookingStatus />} />
            <Route path="/job/:id" element={<JobInProgress />} />
            <Route path="/job/:id/approve" element={<JobApproval />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/help" element={<Help />} />
            
            {/* Cleaner routes */}
            <Route path="/cleaner/dashboard" element={<CleanerDashboard />} />
            <Route path="/cleaner/schedule" element={<CleanerSchedule />} />
            <Route path="/cleaner/earnings" element={<CleanerEarnings />} />
            <Route path="/cleaner/referral" element={<CleanerReferral />} />
            <Route path="/cleaner/messages" element={<CleanerMessages />} />
            <Route path="/cleaner/cancellation-policy" element={<CancellationPolicy />} />
            <Route path="/cleaner/profile" element={<CleanerProfileSettings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
