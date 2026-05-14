import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Check, X, Sparkles } from "lucide-react";
import { SEO } from "@/components/seo";
import { Pill, PhotoBox, SectionLabel, StatusBanner, WfButton } from "@/components/wf";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * WF 49 — Photo etiquette training. Lightweight 5-question quiz that
 * teaches the visual rules cleaners must follow on every job.
 */
const RULES = [
  { title: "Wide shot, then detail", desc: "Always one wide shot per room before close-ups. Wide shots prove scope, details prove quality." },
  { title: "Same angle, before & after", desc: "Stand in the same spot for matching pairs. It's the #1 thing customers look at." },
  { title: "No people, no faces", desc: "Never photograph occupants, kids, or yourself. Privacy is non-negotiable." },
  { title: "Good light, no flash", desc: "Open blinds. Flash creates harsh shadows that look like dirt." },
  { title: "Skip personal items", desc: "Avoid mail, prescriptions, family photos. Customers must trust you in private spaces." },
];

const QUIZ = [
  { q: "Should you take a selfie with the customer's pet?", a: false, explain: "Never photograph people, pets, or faces. Privacy first." },
  { q: "Is it OK to use flash in a dim bathroom?", a: false, explain: "Flash creates harsh shadows that look like dirt. Open the blinds or turn on overhead lights." },
  { q: "Should before/after pairs be taken from the same angle?", a: true, explain: "Yes — matching angles are the single most important rule for proving great work." },
  { q: "Can you photograph an open prescription bottle on the counter?", a: false, explain: "Skip personal items entirely. Move them out of frame, don't capture them." },
  { q: "Wide shot before close-up details — yes or no?", a: true, explain: "Yes. Wide first to show scope, then detail shots to show quality." },
] as const;

export default function PhotoEtiquette() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  const answer = (val: boolean) => {
    const correct = QUIZ[qIdx].a === val;
    setAnswers((prev) => [...prev, correct]);
    setFeedback({ correct, text: QUIZ[qIdx].explain });
  };

  const next = () => {
    setFeedback(null);
    if (qIdx < QUIZ.length - 1) setQIdx(qIdx + 1);
    else setPhase("done");
  };

  const score = answers.filter(Boolean).length;
  const passed = score >= 4;

  return (
    <main className="min-h-screen bg-app-canvas">
      <SEO title="Photo Etiquette Training" description="The 5 rules every PureTask cleaner follows when documenting a job." url="/cleaner/photo-etiquette" />
      <header className="sticky top-0 z-10 bg-app-surface border-b border-hairline">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/cleaner/resources" className="p-1 -ml-1 text-ink-muted hover:text-ink"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-[15px] font-semibold text-ink flex-1">Photo etiquette</h1>
          <Pill variant="info">{phase === "learn" ? "Lesson" : phase === "quiz" ? `Q ${qIdx + 1}/${QUIZ.length}` : "Done"}</Pill>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {phase === "learn" && (
          <>
            <section className="bg-app-surface border border-hairline rounded-[14px] p-4 shadow-wf">
              <Camera className="h-6 w-6 text-primary mb-2" />
              <h2 className="text-[16px] font-bold text-ink mb-1">Photos are how you get paid.</h2>
              <p className="text-[13px] text-ink-muted leading-relaxed">Every customer reviews your photos before approving. Five rules — burn them into memory.</p>
            </section>

            <section>
              <SectionLabel>The 5 rules</SectionLabel>
              <div className="space-y-2">
                {RULES.map((r, i) => (
                  <div key={i} className="bg-app-surface border border-hairline rounded-[10px] p-3 flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-state-info-bg/40 border border-hairline-soft text-[12px] font-bold text-primary flex items-center justify-center shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-ink">{r.title}</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>Example: matching angles</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <PhotoBox state="dashed" label="Before" />
                <PhotoBox state="done" label="After" />
              </div>
              <p className="text-[11px] text-ink-faint mt-1.5">Same camera position, same height, same framing.</p>
            </section>

            <WfButton onClick={() => setPhase("quiz")}>Start the quiz</WfButton>
          </>
        )}

        {phase === "quiz" && (
          <>
            <section className="bg-app-surface border border-hairline rounded-[14px] p-5 shadow-wf">
              <SectionLabel>Question {qIdx + 1} of {QUIZ.length}</SectionLabel>
              <p className="text-[15px] font-semibold text-ink mb-4">{QUIZ[qIdx].q}</p>
              {!feedback ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => answer(true)} className="rounded-[10px] border border-hairline bg-app-surface py-3 text-[13px] font-semibold text-ink hover:bg-app-canvas">Yes</button>
                  <button onClick={() => answer(false)} className="rounded-[10px] border border-hairline bg-app-surface py-3 text-[13px] font-semibold text-ink hover:bg-app-canvas">No</button>
                </div>
              ) : (
                <>
                  <StatusBanner variant={feedback.correct ? "success" : "danger"} icon={feedback.correct ? <Check /> : <X />}>
                    {feedback.correct ? "Correct." : "Not quite."} {feedback.text}
                  </StatusBanner>
                  <WfButton onClick={next} className="mt-3">{qIdx === QUIZ.length - 1 ? "See results" : "Next question"}</WfButton>
                </>
              )}
            </section>
          </>
        )}

        {phase === "done" && (
          <section className="bg-app-surface border border-hairline rounded-[14px] p-6 shadow-wf text-center">
            <div className={cn("h-16 w-16 rounded-2xl mx-auto mb-3 flex items-center justify-center",
              passed ? "bg-state-success-bg" : "bg-state-warning-bg")}>
              <Sparkles className={cn("h-8 w-8", passed ? "text-state-success-fg" : "text-state-warning-fg")} />
            </div>
            <h2 className="text-[18px] font-bold text-ink mb-1">{passed ? "Certified ✓" : "Almost — review and retry"}</h2>
            <p className="text-[13px] text-ink-muted mb-4">You scored {score}/{QUIZ.length}.</p>
            <div className="space-y-2">
              <WfButton onClick={() => { toast.success(passed ? "Etiquette badge added to your profile" : "Saved your progress"); navigate("/cleaner/resources"); }}>
                Back to resources
              </WfButton>
              {!passed && (
                <WfButton variant="ghost" onClick={() => { setAnswers([]); setQIdx(0); setPhase("learn"); }}>Review the rules again</WfButton>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}