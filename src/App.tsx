import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { RequireAuth, RequireClient, RequireCleaner, RequireAdmin } from "@/components/auth/RequireAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import { ExitIntentPopup } from "@/components/conversion";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostSignup } from "@/hooks/usePostSignup";
import { useCleaningRequestSync } from "@/hooks/useCleaningRequest";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";

// Eagerly load the most critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Eagerly load Install page for mobile users landing there
import Install from "./pages/Install";

// Lazy load everything else for code splitting
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyCleanings = lazy(() => import("./pages/MyCleanings"));
const AccountPage = lazy(() => import("./pages/Account"));
const Discover = lazy(() => import("./pages/Discover"));
const CleanerProfile = lazy(() => import("./pages/CleanerProfile"));
const Book = lazy(() => import("./pages/Book"));
const BookingStatus = lazy(() => import("./pages/BookingStatus"));
const JobInProgress = lazy(() => import("./pages/JobInProgress"));
const JobApproval = lazy(() => import("./pages/JobApproval"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Messages = lazy(() => import("./pages/Messages"));
const Help = lazy(() => import("./pages/Help"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const Properties = lazy(() => import("./pages/Properties"));
const RescheduleRequests = lazy(() => import("./pages/RescheduleRequests"));
const FavoriteCleaners = lazy(() => import("./pages/FavoriteCleaners"));
const ClientProfilePage = lazy(() => import("./pages/ClientProfile"));
const ClientProfileEdit = lazy(() => import("./pages/ClientProfileEdit"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Legal = lazy(() => import("./pages/Legal"));
const CancellationPolicyPage = lazy(() => import("./pages/CancellationPolicy"));
const ReliabilityScoreExplained = lazy(() => import("./pages/ReliabilityScoreExplained"));
const ForAirbnbHosts = lazy(() => import("./pages/ForAirbnbHosts"));
const ForFamilies = lazy(() => import("./pages/ForFamilies"));
const ForRetirees = lazy(() => import("./pages/ForRetirees"));
const ForProfessionals = lazy(() => import("./pages/ForProfessionals"));
const CleaningScope = lazy(() => import("./pages/CleaningScope"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Referral = lazy(() => import("./pages/Referral"));
const RecurringPlans = lazy(() => import("./pages/RecurringPlans"));
const Reviews = lazy(() => import("./pages/Reviews"));
const EarningsCalculator = lazy(() => import("./pages/EarningsCalculator"));
const CostEstimator = lazy(() => import("./pages/CostEstimator"));
const CleaningIndustryStats = lazy(() => import("./pages/CleaningIndustryStats"));
const CleaningChecklists = lazy(() => import("./pages/CleaningChecklists"));
const AISummary = lazy(() => import("./pages/AISummary"));
const ResidentialCleaning = lazy(() => import("./pages/ResidentialCleaning"));
const DeepCleaning = lazy(() => import("./pages/DeepCleaning"));
const MoveOutCleaning = lazy(() => import("./pages/MoveOutCleaning"));
const RecurringCleaning = lazy(() => import("./pages/RecurringCleaning"));
const Notifications = lazy(() => import("./pages/Notifications"));

// Cleaner pages
const CleanerDashboard = lazy(() => import("./pages/cleaner/CleanerDashboard"));
const CleanerSchedule = lazy(() => import("./pages/cleaner/CleanerSchedule"));
const CleanerEarnings = lazy(() => import("./pages/cleaner/CleanerEarnings"));
const CleanerReferral = lazy(() => import("./pages/cleaner/CleanerReferral"));
const CleanerMessages = lazy(() => import("./pages/cleaner/CleanerMessages"));
const CancellationPolicy = lazy(() => import("./pages/cleaner/CancellationPolicy"));
const CleanerProfileSettings = lazy(() => import("./pages/cleaner/CleanerProfile"));
const CleanerJobs = lazy(() => import("./pages/cleaner/CleanerJobs"));
const CleanerJobDetail = lazy(() => import("./pages/cleaner/CleanerJobDetail"));
const CleanerAnalytics = lazy(() => import("./pages/cleaner/CleanerAnalytics"));
const CleanerResources = lazy(() => import("./pages/cleaner/CleanerResources"));
const CleanerAvailability = lazy(() => import("./pages/cleaner/CleanerAvailability"));
const CleanerTeam = lazy(() => import("./pages/cleaner/CleanerTeam"));
const CleanerServiceAreas = lazy(() => import("./pages/cleaner/CleanerServiceAreas"));
const CleanerCalendarSync = lazy(() => import("./pages/cleaner/CleanerCalendarSync"));
const CleanerVerification = lazy(() => import("./pages/cleaner/CleanerVerification"));
const CleanerReliability = lazy(() => import("./pages/cleaner/CleanerReliability"));
const CleanerProfileView = lazy(() => import("./pages/cleaner/CleanerProfileView"));
const CleanerAIAssistant = lazy(() => import("./pages/cleaner/CleanerAIAssistant"));
const CleanerOnboarding = lazy(() => import("./pages/cleaner/CleanerOnboarding"));
const CleanerSettings = lazy(() => import("./pages/cleaner/CleanerSettings"));
const CleanerCertifications = lazy(() => import("./pages/cleaner/CleanerCertifications"));
const CleanerClientNotesPage = lazy(() => import("./pages/cleaner/CleanerClientNotes"));
const CleanerEarningsForecast = lazy(() => import("./pages/cleaner/CleanerEarningsForecast"));

// Admin pages
const TrustSafetyDashboard = lazy(() => import("./pages/admin/TrustSafetyDashboard"));
const AdminAnalyticsDashboard = lazy(() => import("./pages/admin/AdminAnalyticsDashboard"));
const AdminBookingsConsole = lazy(() => import("./pages/admin/AdminBookingsConsole"));
const AdminClientJobs = lazy(() => import("./pages/admin/AdminClientJobs"));
const AdminPricingRules = lazy(() => import("./pages/admin/AdminPricingRules"));
const AdminPricingManagement = lazy(() => import("./pages/admin/AdminPricingManagement"));
const AdminCEODashboard = lazy(() => import("./pages/admin/AdminCEODashboard"));
const AdminOperationsDashboard = lazy(() => import("./pages/admin/AdminOperationsDashboard"));
const AdminFinanceDashboard = lazy(() => import("./pages/admin/AdminFinanceDashboard"));
const AdminGrowthDashboard = lazy(() => import("./pages/admin/AdminGrowthDashboard"));
const AdminPerformanceMetrics = lazy(() => import("./pages/admin/AdminPerformanceMetrics"));
const AdminFraudAlerts = lazy(() => import("./pages/admin/AdminFraudAlerts"));
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"));
const AdminClientRisk = lazy(() => import("./pages/admin/AdminClientRisk"));
const AdminTrustSafetyReports = lazy(() => import("./pages/admin/AdminTrustSafetyReports"));
const AdminIDVerifications = lazy(() => import("./pages/admin/AdminIDVerifications"));
const AdminConversionDashboard = lazy(() => import("./pages/admin/AdminConversionDashboard"));
const AdminGeoInsights = lazy(() => import("./pages/admin/AdminGeoInsights"));
const AdminCohortAnalysis = lazy(() => import("./pages/admin/AdminCohortAnalysis"));
const AdminBulkComms = lazy(() => import("./pages/admin/AdminBulkComms"));
const AdminPlatformConfig = lazy(() => import("./pages/admin/AdminPlatformConfig"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminHub = lazy(() => import("./pages/admin/AdminHub"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminRefundQueue = lazy(() => import("./pages/admin/AdminRefundQueue"));
const AdminWebhookLog = lazy(() => import("./pages/admin/AdminWebhookLog"));
const AdminHealthDashboard = lazy(() => import("./pages/admin/AdminHealthDashboard"));

// New feature pages
const SessionManagement = lazy(() => import("./pages/SessionManagement"));
const SpendingAnalytics = lazy(() => import("./pages/SpendingAnalytics"));
const PropertyProfilesPage = lazy(() => import("./pages/PropertyProfiles"));
const CleanerComparisonPage = lazy(() => import("./pages/CleanerComparison"));
const DataExportPage = lazy(() => import("./pages/DataExport"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col gap-4 p-6 container max-w-4xl">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

// Thin component so usePostSignup and useCleaningRequestSync run inside AuthProvider
function PostSignupRunner() {
  usePostSignup();
  useCleaningRequestSync();
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="puretask-theme">
        <AuthProvider>
          <TooltipProvider>
            {/* Single Sonner toaster — shadcn <Toaster /> removed */}
            <Sonner />
            <BrowserRouter>
              <PostSignupRunner />
              <ScrollToTop />
              <ExitIntentPopup />
              <PWAInstallBanner />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Auth pages — no layout */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* PWA Install page — no layout */}
                  <Route path="/install" element={<Install />} />

                  {/* Role selection — no layout */}
                  <Route path="/role-selection" element={
                    <RequireAuth requireRole={false}>
                      <RoleSelection />
                    </RequireAuth>
                  } />

                  {/* Cleaner onboarding — no layout */}
                  <Route path="/cleaner/onboarding" element={
                    <RequireAuth requireRole={false}>
                      <CleanerOnboarding />
                    </RequireAuth>
                  } />

                  {/* All other routes with MainLayout via layout route */}
                  <Route element={<MainLayout />}>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                    <Route path="/cancellationpolicy" element={<Navigate to="/cancellation-policy" replace />} />
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
                    <Route path="/residential-cleaning" element={<ResidentialCleaning />} />
                    <Route path="/deep-cleaning" element={<DeepCleaning />} />
                    <Route path="/move-out-cleaning" element={<MoveOutCleaning />} />
                    <Route path="/recurring-cleaning" element={<RecurringCleaning />} />

                    {/* Admin routes */}
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
                    <Route path="/admin/audit-log" element={<RequireAdmin><AdminAuditLog /></RequireAdmin>} />
                    <Route path="/admin/refund-queue" element={<RequireAdmin><AdminRefundQueue /></RequireAdmin>} />
                    <Route path="/admin/webhook-log" element={<RequireAdmin><AdminWebhookLog /></RequireAdmin>} />
                    <Route path="/admin/health" element={<RequireAdmin><AdminHealthDashboard /></RequireAdmin>} />

                    {/* Client routes */}
                    <Route path="/dashboard" element={<RequireClient><Dashboard /></RequireClient>} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/cleaner/:id" element={<RequireAuth><CleanerProfile /></RequireAuth>} />
                    <Route path="/book" element={<RequireClient><Book /></RequireClient>} />
                    <Route path="/booking/:id" element={<RequireClient><BookingStatus /></RequireClient>} />
                    <Route path="/job/:id" element={<RequireClient><JobInProgress /></RequireClient>} />
                    <Route path="/job/:id/approve" element={<RequireClient><JobApproval /></RequireClient>} />
                    {/* Legacy alias → canonical path */}
                    <Route path="/job-approval/:id" element={<Navigate to="/job/:id/approve" replace />} />
                    <Route path="/wallet" element={<RequireClient><Wallet /></RequireClient>} />
                    <Route path="/messages" element={<RequireClient><Messages /></RequireClient>} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/settings/notifications" element={<RequireAuth><NotificationSettings /></RequireAuth>} />
                    <Route path="/notifications" element={<RequireAuth requireRole={false}><Notifications /></RequireAuth>} />
                    <Route path="/properties" element={<RequireClient><Properties /></RequireClient>} />
                    <Route path="/reschedule-requests" element={<RequireClient><RescheduleRequests /></RequireClient>} />
                    <Route path="/referral" element={<RequireClient><Referral /></RequireClient>} />
                    <Route path="/recurring-plans" element={<RequireClient><RecurringPlans /></RequireClient>} />
                    <Route path="/favorites" element={<RequireClient><FavoriteCleaners /></RequireClient>} />
                    <Route path="/profile" element={<RequireClient><ClientProfilePage /></RequireClient>} />
                    <Route path="/profile/edit" element={<RequireClient><ClientProfileEdit /></RequireClient>} />
                    <Route path="/spending" element={<RequireClient><SpendingAnalytics /></RequireClient>} />
                    <Route path="/property-profiles" element={<RequireClient><PropertyProfilesPage /></RequireClient>} />
                    <Route path="/compare-cleaners" element={<RequireClient><CleanerComparisonPage /></RequireClient>} />
                    <Route path="/sessions" element={<RequireAuth><SessionManagement /></RequireAuth>} />
                    <Route path="/data-export" element={<RequireAuth><DataExportPage /></RequireAuth>} />

                    {/* Cleaner routes */}
                    <Route path="/cleaner/dashboard" element={<RequireCleaner><CleanerDashboard /></RequireCleaner>} />
                    <Route path="/cleaner/schedule" element={<RequireCleaner><CleanerSchedule /></RequireCleaner>} />
                    <Route path="/cleaner/earnings" element={<RequireCleaner><CleanerEarnings /></RequireCleaner>} />
                    <Route path="/cleaner/referral" element={<RequireCleaner><CleanerReferral /></RequireCleaner>} />
                    <Route path="/cleaner/messages" element={<RequireCleaner><CleanerMessages /></RequireCleaner>} />
                    <Route path="/cleaner/cancellation-policy" element={<RequireCleaner><CancellationPolicy /></RequireCleaner>} />
                    <Route path="/cleaner/profile" element={<RequireCleaner><CleanerProfileSettings /></RequireCleaner>} />
                    <Route path="/cleaner/profile/view" element={<RequireCleaner><CleanerProfileView /></RequireCleaner>} />
                    <Route path="/cleaner/marketplace" element={<Navigate to="/discover" replace />} />
                    <Route path="/cleaner/jobs" element={<RequireCleaner><CleanerJobs /></RequireCleaner>} />
                    <Route path="/cleaner/jobs/:jobId" element={<RequireCleaner><CleanerJobDetail /></RequireCleaner>} />
                    <Route path="/cleaner/analytics" element={<RequireCleaner><CleanerAnalytics /></RequireCleaner>} />
                    <Route path="/cleaner/resources" element={<RequireCleaner><CleanerResources /></RequireCleaner>} />
                    <Route path="/cleaner/availability" element={<RequireCleaner><CleanerAvailability /></RequireCleaner>} />
                    <Route path="/cleaner/team" element={<RequireCleaner><CleanerTeam /></RequireCleaner>} />
                    <Route path="/cleaner/service-areas" element={<RequireCleaner><CleanerServiceAreas /></RequireCleaner>} />
                    <Route path="/cleaner/calendar-sync" element={<RequireCleaner><CleanerCalendarSync /></RequireCleaner>} />
                    <Route path="/cleaner/verification" element={<RequireCleaner><CleanerVerification /></RequireCleaner>} />
                    <Route path="/cleaner/reliability" element={<RequireCleaner><CleanerReliability /></RequireCleaner>} />
                    <Route path="/cleaner/ai-assistant" element={<RequireCleaner><CleanerAIAssistant /></RequireCleaner>} />
                    <Route path="/cleaner/settings" element={<RequireCleaner><CleanerSettings /></RequireCleaner>} />
                    <Route path="/cleaner/certifications" element={<RequireCleaner><CleanerCertifications /></RequireCleaner>} />
                    <Route path="/cleaner/client-notes" element={<RequireCleaner><CleanerClientNotesPage /></RequireCleaner>} />
                    <Route path="/cleaner/earnings-forecast" element={<RequireCleaner><CleanerEarningsForecast /></RequireCleaner>} />

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
