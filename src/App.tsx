import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { RequireAuth, RequireClient, RequireCleaner, RequireAdmin } from "@/components/auth/RequireAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import ClientProfilePage from "./pages/ClientProfile";
import ClientProfileEdit from "./pages/ClientProfileEdit";
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
import CleanerProfileView from "./pages/cleaner/CleanerProfileView";
import CleanerAIAssistant from "./pages/cleaner/CleanerAIAssistant";
import CleanerOnboarding from "./pages/cleaner/CleanerOnboarding";
import Legal from "./pages/Legal";
import CancellationPolicyPage from "./pages/CancellationPolicy";
import ReliabilityScoreExplained from "./pages/ReliabilityScoreExplained";
import ForAirbnbHosts from "./pages/ForAirbnbHosts";
import ForFamilies from "./pages/ForFamilies";
import ForRetirees from "./pages/ForRetirees";
import ForProfessionals from "./pages/ForProfessionals";
import CleaningScope from "./pages/CleaningScope";
import Pricing from "./pages/Pricing";
import TrustSafetyDashboard from "./pages/admin/TrustSafetyDashboard";
import AboutUs from "./pages/AboutUs";
import Referral from "./pages/Referral";
import RecurringPlans from "./pages/RecurringPlans";
import Reviews from "./pages/Reviews";
import EarningsCalculator from "./pages/EarningsCalculator";
import CostEstimator from "./pages/CostEstimator";
import CleaningIndustryStats from "./pages/CleaningIndustryStats";
import CleaningChecklists from "./pages/CleaningChecklists";
import AISummary from "./pages/AISummary";
import AdminAnalyticsDashboard from "./pages/admin/AdminAnalyticsDashboard";
import AdminBookingsConsole from "./pages/admin/AdminBookingsConsole";
import AdminClientJobs from "./pages/admin/AdminClientJobs";
import AdminPricingRules from "./pages/admin/AdminPricingRules";
import AdminPricingManagement from "./pages/admin/AdminPricingManagement";
import AdminCEODashboard from "./pages/admin/AdminCEODashboard";
import AdminOperationsDashboard from "./pages/admin/AdminOperationsDashboard";
import AdminFinanceDashboard from "./pages/admin/AdminFinanceDashboard";
import AdminGrowthDashboard from "./pages/admin/AdminGrowthDashboard";
import AdminPerformanceMetrics from "./pages/admin/AdminPerformanceMetrics";
import AdminFraudAlerts from "./pages/admin/AdminFraudAlerts";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminClientRisk from "./pages/admin/AdminClientRisk";
import AdminTrustSafetyReports from "./pages/admin/AdminTrustSafetyReports";
import AdminIDVerifications from "./pages/admin/AdminIDVerifications";
import AdminConversionDashboard from "./pages/admin/AdminConversionDashboard";
import AdminGeoInsights from "./pages/admin/AdminGeoInsights";
import AdminCohortAnalysis from "./pages/admin/AdminCohortAnalysis";
import AdminBulkComms from "./pages/admin/AdminBulkComms";
import AdminPlatformConfig from "./pages/admin/AdminPlatformConfig";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminHub from "./pages/admin/AdminHub";
import CleanerSettings from "./pages/cleaner/CleanerSettings";
import { ExitIntentPopup } from "@/components/conversion";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="puretask-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <ScrollToTop />
            <ExitIntentPopup />
            <Routes>
              {/* Auth pages - no layout */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Role selection - no layout */}
              <Route path="/role-selection" element={
                <RequireAuth requireRole={false}>
                  <RoleSelection />
                </RequireAuth>
              } />
              
              {/* Cleaner onboarding - no layout */}
              <Route path="/cleaner/onboarding" element={
                <RequireAuth requireRole={false}>
                  <CleanerOnboarding />
                </RequireAuth>
              } />
              
              {/* All other routes with MainLayout */}
              <Route path="/*" element={
                <MainLayout>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                    <Route path="/reliability-score" element={<ReliabilityScoreExplained />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/for-airbnb-hosts" element={<ForAirbnbHosts />} />
                    <Route path="/for-families" element={<ForFamilies />} />
                    <Route path="/for-retirees" element={<ForRetirees />} />
                    <Route path="/for-professionals" element={<ForProfessionals />} />
                    <Route path="/cleaning-scope" element={<CleaningScope />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/earnings-calculator" element={<EarningsCalculator />} />
                    <Route path="/cost-estimator" element={<CostEstimator />} />
                    <Route path="/cleaning-industry-stats" element={<CleaningIndustryStats />} />
                    <Route path="/checklists" element={<CleaningChecklists />} />
                    <Route path="/ai-summary" element={<AISummary />} />
                    
                    {/* Admin routes - protected by RequireAdmin (server-side role check) */}
                    <Route path="/admin/analytics" element={<RequireAdmin><AdminAnalyticsDashboard /></RequireAdmin>} />
                    <Route path="/admin/trust-safety" element={<RequireAdmin><TrustSafetyDashboard /></RequireAdmin>} />
                    <Route path="/admin/bookings" element={<RequireAdmin><AdminBookingsConsole /></RequireAdmin>} />
                    <Route path="/admin/client-jobs" element={<RequireAdmin><AdminClientJobs /></RequireAdmin>} />
                    <Route path="/admin/pricing-rules" element={<RequireAdmin><AdminPricingRules /></RequireAdmin>} />
                    <Route path="/admin/pricing" element={<RequireAdmin><AdminPricingManagement /></RequireAdmin>} />
                    <Route path="/admin/ceo" element={<RequireAdmin><AdminCEODashboard /></RequireAdmin>} />
                    <Route path="/admin/operations" element={<RequireAdmin><AdminOperationsDashboard /></RequireAdmin>} />
                    <Route path="/admin/finance" element={<RequireAdmin><AdminFinanceDashboard /></RequireAdmin>} />
                    <Route path="/admin/growth" element={<RequireAdmin><AdminGrowthDashboard /></RequireAdmin>} />
                    <Route path="/admin/performance" element={<RequireAdmin><AdminPerformanceMetrics /></RequireAdmin>} />
                    <Route path="/admin/fraud-alerts" element={<RequireAdmin><AdminFraudAlerts /></RequireAdmin>} />
                    <Route path="/admin/disputes" element={<RequireAdmin><AdminDisputes /></RequireAdmin>} />
                    <Route path="/admin/client-risk" element={<RequireAdmin><AdminClientRisk /></RequireAdmin>} />
                    <Route path="/admin/trust-safety-reports" element={<RequireAdmin><AdminTrustSafetyReports /></RequireAdmin>} />
                    <Route path="/admin/id-verifications" element={<RequireAdmin><AdminIDVerifications /></RequireAdmin>} />
                     <Route path="/admin/conversions" element={<RequireAdmin><AdminConversionDashboard /></RequireAdmin>} />
                     <Route path="/admin/geo-insights" element={<RequireAdmin><AdminGeoInsights /></RequireAdmin>} />
                     <Route path="/admin/cohort-analysis" element={<RequireAdmin><AdminCohortAnalysis /></RequireAdmin>} />
                     <Route path="/admin/bulk-comms" element={<RequireAdmin><AdminBulkComms /></RequireAdmin>} />
                     <Route path="/admin/platform-config" element={<RequireAdmin><AdminPlatformConfig /></RequireAdmin>} />
                     <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
                     <Route path="/admin/hub" element={<RequireAdmin><AdminHub /></RequireAdmin>} />
                    
                    {/* Client routes */}
                    <Route path="/dashboard" element={
                      <RequireClient>
                        <Dashboard />
                      </RequireClient>
                    } />
                    <Route path="/discover" element={<Discover />} />
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
                     <Route path="/job-approval/:id" element={
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
                    <Route path="/help" element={<Help />} />
                     <Route path="/settings/notifications" element={
                       <RequireAuth>
                         <NotificationSettings />
                       </RequireAuth>
                     } />
                     <Route path="/notifications" element={
                       <RequireAuth requireRole={false}>
                         <Notifications />
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
                     <Route path="/referral" element={
                       <RequireClient>
                         <Referral />
                       </RequireClient>
                     } />
                     <Route path="/recurring-plans" element={
                       <RequireClient>
                         <RecurringPlans />
                       </RequireClient>
                     } />
                    <Route path="/favorites" element={
                      <RequireClient>
                        <FavoriteCleaners />
                      </RequireClient>
                    } />
                    <Route path="/profile" element={
                      <RequireClient>
                        <ClientProfilePage />
                      </RequireClient>
                    } />
                    <Route path="/profile/edit" element={
                      <RequireClient>
                        <ClientProfileEdit />
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
                    <Route path="/cleaner/profile/view" element={
                      <RequireCleaner>
                        <CleanerProfileView />
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
                    <Route path="/cleaner/ai-assistant" element={
                      <RequireCleaner>
                        <CleanerAIAssistant />
                      </RequireCleaner>
                    } />
                    <Route path="/cleaner/settings" element={
                      <RequireCleaner>
                        <CleanerSettings />
                      </RequireCleaner>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              } />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;