import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getAnonymousId } from "./useAnalytics";

interface ABTest {
  id: string;
  name: string;
  variants: string[];
  traffic_split: Record<string, number>;
  is_active: boolean;
}

interface ABTestAssignment {
  test_id: string;
  variant: string;
}

// Deterministic variant selection based on ID and traffic split
function selectVariant(
  variants: string[],
  trafficSplit: Record<string, number>,
  identifier: string
): string {
  // Create a hash from the identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const normalizedHash = Math.abs(hash) % 100;

  // Select variant based on traffic split
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += trafficSplit[variant] || 0;
    if (normalizedHash < cumulative) {
      return variant;
    }
  }

  return variants[0] || "control";
}

export function useABTest(testName: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [variant, setVariant] = useState<string | null>(null);
  const anonymousId = getAnonymousId();
  const identifier = user?.id || anonymousId;

  // Fetch test configuration
  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: ["ab-test", testName],
    queryFn: async (): Promise<ABTest | null> => {
      const { data, error } = await supabase
        .from("ab_tests")
        .select("id, name, variants, traffic_split, is_active")
        .eq("name", testName)
        .eq("is_active", true)
        .single();

      if (error || !data) return null;
      
      return {
        ...data,
        variants: data.variants as string[],
        traffic_split: data.traffic_split as Record<string, number>,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch existing assignment
  const { data: existingAssignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ["ab-test-assignment", testName, identifier],
    queryFn: async (): Promise<ABTestAssignment | null> => {
      if (!test) return null;

      const query = supabase
        .from("ab_test_assignments")
        .select("test_id, variant")
        .eq("test_id", test.id);

      if (user?.id) {
        query.eq("user_id", user.id);
      } else {
        query.eq("anonymous_id", anonymousId);
      }

      const { data, error } = await query.single();
      if (error || !data) return null;
      return data;
    },
    enabled: !!test,
    staleTime: Infinity,
  });

  // Create assignment mutation
  const createAssignment = useMutation({
    mutationFn: async (selectedVariant: string) => {
      if (!test) throw new Error("No test found");

      const { error } = await supabase.from("ab_test_assignments").insert({
        user_id: user?.id || null,
        anonymous_id: user?.id ? null : anonymousId,
        test_id: test.id,
        variant: selectedVariant,
      });

      if (error) throw error;
      return selectedVariant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-assignment", testName] });
    },
  });

  // Assign variant on mount
  useEffect(() => {
    if (!test || testLoading || assignmentLoading) return;

    if (existingAssignment) {
      setVariant(existingAssignment.variant);
    } else {
      const selectedVariant = selectVariant(
        test.variants,
        test.traffic_split,
        `${test.id}-${identifier}`
      );
      setVariant(selectedVariant);
      createAssignment.mutate(selectedVariant);
    }
  }, [test, testLoading, assignmentLoading, existingAssignment, identifier]);

  const isControl = variant === "control";
  const isLoading = testLoading || assignmentLoading || variant === null;

  return {
    variant,
    isControl,
    isLoading,
    testId: test?.id,
  };
}

// Hook to get all active tests for admin dashboard
export function useABTests() {
  return useQuery({
    queryKey: ["ab-tests-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook to get test results for admin dashboard
export function useABTestResults(testId: string) {
  return useQuery({
    queryKey: ["ab-test-results", testId],
    queryFn: async () => {
      // Get all assignments for this test
      const { data: assignments, error: assignmentsError } = await supabase
        .from("ab_test_assignments")
        .select("variant")
        .eq("test_id", testId);

      if (assignmentsError) throw assignmentsError;

      // Count by variant
      const variantCounts: Record<string, number> = {};
      for (const assignment of assignments || []) {
        variantCounts[assignment.variant] = (variantCounts[assignment.variant] || 0) + 1;
      }

      // Get conversion events for this test
      const { data: conversions, error: conversionsError } = await supabase
        .from("analytics_events")
        .select("event_properties")
        .eq("event_name", "conversion")
        .not("event_properties->ab_test_variant", "is", null);

      if (conversionsError) throw conversionsError;

      return {
        totalParticipants: assignments?.length || 0,
        variantCounts,
        conversions: conversions?.length || 0,
      };
    },
    enabled: !!testId,
  });
}
