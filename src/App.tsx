
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CityProvider } from "@/contexts/CityContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CountryProvider } from "@/contexts/CountryContext";
import { JourneyCardsProvider } from "@/contexts/JourneyCardsContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import AuthGuard from "@/components/auth/AuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load pages for better performance  
const LandingPage = React.lazy(() => import("./pages/OptimizedLandingPage"));
const CitySelectionPage = React.lazy(() => import("./pages/CitySelectionPage"));
const DestinationPage = React.lazy(() => import("./pages/DestinationPage"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const JourneyDetailPage = React.lazy(() => import("./pages/JourneyDetailPage"));
const RewardsPage = React.lazy(() => import("./pages/RewardsPage"));
const MyRewardsPage = React.lazy(() => import("./pages/MyRewardsPage"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const PartnerDashboard = React.lazy(() => import("./pages/PartnerDashboardPage"));
const PartnerRewardsPage = React.lazy(() => import("./pages/PartnerRewardsPage"));
const PartnerAnalyticsPage = React.lazy(() => import("./pages/PartnerAnalyticsPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const MyJourneysPage = React.lazy(() => import("./pages/MyJourneysPage"));
const FAQPage = React.lazy(() => import("./pages/FAQPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const PrivacyPage = React.lazy(() => import("./pages/PrivacyPage"));
const TermsPage = React.lazy(() => import("./pages/TermsPage"));
const CookiesPage = React.lazy(() => import("./pages/CookiesPage"));
const LegalPage = React.lazy(() => import("./pages/LegalPage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const ArticleDetailPage = React.lazy(() => import("./pages/ArticleDetailPage"));
const PricingPage = React.lazy(() => import("./pages/PricingPage"));
const AIFeaturesPage = React.lazy(() => import("./pages/AIFeaturesPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const HelpPage = React.lazy(() => import("./pages/HelpPage"));
const EmailTestPage = React.lazy(() => import("./pages/EmailTestPage"));
const EmailDiagnosticPage = React.lazy(() => import("./pages/EmailDiagnosticPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Optimized QueryClient configuration to prevent excessive retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry network errors more than once
        if (error?.message?.includes('Failed to fetch')) {
          return failureCount < 1;
        }
        // Normal retry logic for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function App() {
  
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <CountryProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/cities" element={<CitySelectionPage />} />
                  <Route path="/auth" element={
                    <AuthGuard requireAuth={false}>
                      <AuthPage />
                    </AuthGuard>
                  } />
                  <Route path="/reset-password" element={
                    <AuthGuard requireAuth={false}>
                      <ResetPasswordPage />
                    </AuthGuard>
                  } />
                
                {/* Routes that need CityProvider */}
                <Route path="/destinations/:slug" element={
                  <CityProvider>
                    <JourneyCardsProvider>
                      <DestinationPage />
                    </JourneyCardsProvider>
                  </CityProvider>
                } />
                <Route path="/destinations/:slug/journey/:journeyId" element={
                  <AuthGuard>
                    <CityProvider>
                      <JourneyDetailPage />
                    </CityProvider>
                  </AuthGuard>
                } />
                <Route path="/rewards" element={
                  <AuthGuard>
                    <RewardsPage />
                  </AuthGuard>
                } />
                <Route path="/my-rewards" element={
                  <AuthGuard>
                    <MyRewardsPage />
                  </AuthGuard>
                } />
                <Route path="/profile" element={
                  <AuthGuard>
                    <ProfilePage />
                  </AuthGuard>
                } />
                <Route path="/my-journeys" element={
                  <AuthGuard>
                    <JourneyCardsProvider>
                      <MyJourneysPage />
                    </JourneyCardsProvider>
                  </AuthGuard>
                } />
                <Route path="/admin" element={
                  <AuthGuard requiredRole={['super_admin', 'tenant_admin']}>
                    <AdminDashboard />
                  </AuthGuard>
                } />
                <Route path="/partner-dashboard" element={
                  <AuthGuard requiredRole={['partner']}>
                    <PartnerDashboard />
                  </AuthGuard>
                } />
                <Route path="/partner-rewards" element={
                  <AuthGuard requiredRole={['partner']}>
                    <PartnerRewardsPage />
                  </AuthGuard>
                } />
                <Route path="/partner-analytics" element={
                  <AuthGuard requiredRole={['partner']}>
                    <PartnerAnalyticsPage />
                  </AuthGuard>
                } />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<ArticleDetailPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                <Route path="/ai-features" element={<AIFeaturesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/help" element={<HelpPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                <Route path="/email-test" element={<EmailTestPage />} />
                <Route path="/email-diagnostic" element={
                  <AuthGuard requiredRole={['super_admin', 'tenant_admin']}>
                    <EmailDiagnosticPage />
                  </AuthGuard>
                } />
                
                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
          </CountryProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
