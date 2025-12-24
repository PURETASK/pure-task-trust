import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { RequireAuth, RequireClient, RequireCleaner } from "@/components/auth/RequireAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
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
import NotificationSettings from "./pages/NotificationSettings";
import Properties from "./pages/Properties";
import RescheduleRequests from "./pages/RescheduleRequests";
import FavoriteCleaners from "./pages/FavoriteCleaners";
import NotFound from "./pages/NotFound";

// Cleaner pages
import CleanerDashboard from "./pages/cleaner/CleanerDashboard";
import CleanerSchedule from "./pages/cleaner/CleanerSchedule";
import CleanerEarnings from "./pages/cleaner/CleanerEarnings";
import CleanerReferral from "./pages/cleaner/CleanerReferral";
import CleanerMessages from "./pages/cleaner/CleanerMessages";
import CancellationPolicy from "./pages/cleaner/CancellationPolicy";
import CleanerProfileSettings from "./pages/cleaner/CleanerProfile";
import CleanerMarketplace from "./pages/cleaner/CleanerMarketplace";
import CleanerJobs from "./pages/cleaner/CleanerJobs";
import CleanerJobDetail from "./pages/cleaner/CleanerJobDetail";
import CleanerAnalytics from "./pages/cleaner/CleanerAnalytics";
import CleanerResources from "./pages/cleaner/CleanerResources";
import CleanerAvailability from "./pages/cleaner/CleanerAvailability";
import CleanerTeam from "./pages/cleaner/CleanerTeam";
import CleanerServiceAreas from "./pages/cleaner/CleanerServiceAreas";
import CleanerCalendarSync from "./pages/cleaner/CleanerCalendarSync";
import CleanerVerification from "./pages/cleaner/CleanerVerification";
import CleanerReliability from "./pages/cleaner/CleanerReliability";
import Legal from "./pages/Legal";
import ReliabilityScoreExplained from "./pages/ReliabilityScoreExplained";
import ForAirbnbHosts from "./pages/ForAirbnbHosts";
import ForFamilies from "./pages/ForFamilies";
import ForRetirees from "./pages/ForRetirees";
import ForProfessionals from "./pages/ForProfessionals";
import CleaningScope from "./pages/CleaningScope";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="puretask-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/reliability-score" element={<ReliabilityScoreExplained />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/for-airbnb-hosts" element={<ForAirbnbHosts />} />
              <Route path="/for-families" element={<ForFamilies />} />
              <Route path="/for-retirees" element={<ForRetirees />} />
              <Route path="/for-professionals" element={<ForProfessionals />} />
              <Route path="/cleaning-scope" element={<CleaningScope />} />
              
              {/* Role selection (requires auth but no role check) */}
              <Route path="/role-selection" element={
                <RequireAuth requireRole={false}>
                  <RoleSelection />
                </RequireAuth>
              } />
              
              {/* Client routes */}
              <Route path="/dashboard" element={
                <RequireClient>
                  <Dashboard />
                </RequireClient>
              } />
              <Route path="/discover" element={
                <RequireClient>
                  <Discover />
                </RequireClient>
              } />
              <Route path="/cleaner/:id" element={
                <RequireClient>
                  <CleanerProfile />
                </RequireClient>
              } />
              <Route path="/book" element={
                <RequireClient>
                  <Book />
                </RequireClient>
              } />
              <Route path="/booking/:id" element={
                <RequireClient>
                  <BookingStatus />
                </RequireClient>
              } />
              <Route path="/job/:id" element={
                <RequireClient>
                  <JobInProgress />
                </RequireClient>
              } />
              <Route path="/job/:id/approve" element={
                <RequireClient>
                  <JobApproval />
                </RequireClient>
              } />
              <Route path="/wallet" element={
                <RequireClient>
                  <Wallet />
                </RequireClient>
              } />
              <Route path="/messages" element={
                <RequireClient>
                  <Messages />
                </RequireClient>
              } />
              <Route path="/help" element={
                <RequireAuth>
                  <Help />
                </RequireAuth>
              } />
              <Route path="/settings/notifications" element={
                <RequireAuth>
                  <NotificationSettings />
                </RequireAuth>
              } />
              <Route path="/properties" element={
                <RequireClient>
                  <Properties />
                </RequireClient>
              } />
              <Route path="/reschedule-requests" element={
                <RequireClient>
                  <RescheduleRequests />
                </RequireClient>
              } />
              <Route path="/favorites" element={
                <RequireClient>
                  <FavoriteCleaners />
                </RequireClient>
              } />
              
              {/* Cleaner routes */}
              <Route path="/cleaner/dashboard" element={
                <RequireCleaner>
                  <CleanerDashboard />
                </RequireCleaner>
              } />
              <Route path="/cleaner/schedule" element={
                <RequireCleaner>
                  <CleanerSchedule />
                </RequireCleaner>
              } />
              <Route path="/cleaner/earnings" element={
                <RequireCleaner>
                  <CleanerEarnings />
                </RequireCleaner>
              } />
              <Route path="/cleaner/referral" element={
                <RequireCleaner>
                  <CleanerReferral />
                </RequireCleaner>
              } />
              <Route path="/cleaner/messages" element={
                <RequireCleaner>
                  <CleanerMessages />
                </RequireCleaner>
              } />
              <Route path="/cleaner/cancellation-policy" element={
                <RequireCleaner>
                  <CancellationPolicy />
                </RequireCleaner>
              } />
              <Route path="/cleaner/profile" element={
                <RequireCleaner>
                  <CleanerProfileSettings />
                </RequireCleaner>
              } />
              <Route path="/cleaner/marketplace" element={
                <RequireCleaner>
                  <CleanerMarketplace />
                </RequireCleaner>
              } />
              <Route path="/cleaner/jobs" element={
                <RequireCleaner>
                  <CleanerJobs />
                </RequireCleaner>
              } />
              <Route path="/cleaner/jobs/:jobId" element={
                <RequireCleaner>
                  <CleanerJobDetail />
                </RequireCleaner>
              } />
              <Route path="/cleaner/analytics" element={
                <RequireCleaner>
                  <CleanerAnalytics />
                </RequireCleaner>
              } />
              <Route path="/cleaner/resources" element={
                <RequireCleaner>
                  <CleanerResources />
                </RequireCleaner>
              } />
              <Route path="/cleaner/availability" element={
                <RequireCleaner>
                  <CleanerAvailability />
                </RequireCleaner>
              } />
              <Route path="/cleaner/team" element={
                <RequireCleaner>
                  <CleanerTeam />
                </RequireCleaner>
              } />
              <Route path="/cleaner/service-areas" element={
                <RequireCleaner>
                  <CleanerServiceAreas />
                </RequireCleaner>
              } />
              <Route path="/cleaner/calendar-sync" element={
                <RequireCleaner>
                  <CleanerCalendarSync />
                </RequireCleaner>
              } />
              <Route path="/cleaner/verification" element={
                <RequireCleaner>
                  <CleanerVerification />
                </RequireCleaner>
              } />
              <Route path="/cleaner/reliability" element={
                <RequireCleaner>
                  <CleanerReliability />
                </RequireCleaner>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
