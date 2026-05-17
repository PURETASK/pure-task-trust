import { useGpcDetection } from "@/hooks/useGpcDetection";

/** Mounts the GPC detection hook once at app start. Renders nothing. */
export function GpcDetector() {
  useGpcDetection();
  return null;
}