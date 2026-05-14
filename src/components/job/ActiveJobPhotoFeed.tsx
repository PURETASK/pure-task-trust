import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useJobPhotos } from "@/hooks/useJobPhotos";
import { PhotoBox, SectionLabel } from "@/components/wf";

/**
 * WF 9 — live "watch your clean happen" feed.
 * 3 PhotoBoxes (Before / Mid / After) that auto-fill as the cleaner uploads.
 */
export function ActiveJobPhotoFeed({ jobId }: { jobId: string }) {
  const { data: photos } = useJobPhotos(jobId);
  const qc = useQueryClient();

  // Realtime: refresh when a new job_photos row appears for this job
  useEffect(() => {
    if (!jobId) return;
    const ch = supabase
      .channel(`job-photos-${jobId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "job_photos", filter: `job_id=eq.${jobId}` },
        () => qc.invalidateQueries({ queryKey: ["job-photos", jobId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [jobId, qc]);

  const before = photos?.find((p) => p.photo_type === "before");
  const after = photos?.find((p) => p.photo_type === "after");
  const mid = photos?.find((p) => p.photo_type === "other");

  const slot = (p?: { photo_url: string }, label?: string) =>
    p ? <PhotoBox state="done" src={p.photo_url} label={label} />
      : <PhotoBox state="dashed" label={label} />;

  return (
    <section className="bg-app-surface border border-hairline-soft rounded-[14px] p-4 shadow-wf">
      <SectionLabel>Live progress</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {slot(before, "Before")}
        {slot(mid, "Mid")}
        {slot(after, "After")}
      </div>
      <p className="text-[11px] text-ink-faint mt-2">
        Photos appear here as your cleaner takes them.
      </p>
    </section>
  );
}
