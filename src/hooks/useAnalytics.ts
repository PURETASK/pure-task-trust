import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Generate or retrieve session ID
function getSessionId(): string {
  const key = "pt_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// Get anonymous ID for non-logged-in users
function getAnonymousId(): string {
  const key = "pt_anonymous_id";
  let anonId = localStorage.getItem(key);
  if (!anonId) {
    anonId = `anon_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, anonId);
  }
  return anonId;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export interface TrackingContext {
  userId?: string;
  sessionId: string;
  anonymousId: string;
  pagePath: string;
  referrer: string;
  userAgent: string;
}

export function useAnalytics() {
  const { user } = useAuth();
  const location = useLocation();
  const lastTrackedPath = useRef<string>("");

  const getContext = useCallback((): TrackingContext => {
    return {
      userId: user?.id,
      sessionId: getSessionId(),
      anonymousId: getAnonymousId(),
      pagePath: location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };
  }, [user?.id, location.pathname]);

  const trackEvent = useCallback(
    async (name: string, properties?: Record<string, unknown>) => {
      const ctx = getContext();
      
      try {
        await supabase.from("analytics_events").insert({
          user_id: ctx.userId || null,
          session_id: ctx.sessionId,
          event_name: name,
          event_properties: {
            ...properties,
            anonymous_id: ctx.anonymousId,
          },
          page_path: ctx.pagePath,
          referrer: ctx.referrer,
          user_agent: ctx.userAgent,
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug("Analytics tracking failed:", error);
      }
    },
    [getContext]
  );

  const trackPageView = useCallback(() => {
    const path = location.pathname;
    if (path !== lastTrackedPath.current) {
      lastTrackedPath.current = path;
      trackEvent("page_view", { path });
    }
  }, [location.pathname, trackEvent]);

  const trackConversion = useCallback(
    (type: string, value?: number, metadata?: Record<string, unknown>) => {
      trackEvent("conversion", { type, value, ...metadata });
    },
    [trackEvent]
  );

  const trackButtonClick = useCallback(
    (buttonId: string, buttonText?: string) => {
      trackEvent("button_click", { button_id: buttonId, button_text: buttonText });
    },
    [trackEvent]
  );

  const trackFormSubmit = useCallback(
    (formId: string, success: boolean) => {
      trackEvent("form_submit", { form_id: formId, success });
    },
    [trackEvent]
  );

  const trackSearch = useCallback(
    (query: string, filters?: Record<string, unknown>, resultsCount?: number) => {
      trackEvent("search", { query, filters, results_count: resultsCount });
    },
    [trackEvent]
  );

  // Auto-track page views
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackButtonClick,
    trackFormSubmit,
    trackSearch,
    getAnonymousId,
    getSessionId: getSessionId,
  };
}

export { getAnonymousId, getSessionId };
