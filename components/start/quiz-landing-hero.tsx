"use client";

import { StatsBar } from "@/components/start/stats-bar";
import { FlywheelIntro } from "@/components/start/flywheel-intro";

/** Landing hero shown above quiz step 0 — matches the HTML demo. */
export function QuizLandingHero() {
  return (
    <>
      <section className="section-paper">
        <div className="mx-auto max-w-[1180px] px-4 py-14">
          <div className="mb-8 max-w-2xl">
            <div className="font-mono-label mb-2 text-[10px] text-primary">campaign.clarityhq.ai</div>
            <h1 className="font-heading heading-2tone mb-3 text-[30px] font-semibold leading-[1.15] tracking-tight">
              One campaign. Built right. <span className="dim">Live in under a week.</span>
            </h1>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Every campaign is grounded in your Brand Intelligence Layer — your brand book, ICP, and channel voice.
            </p>
          </div>
          <StatsBar />
        </div>
      </section>

      <section className="section-paper relative -mt-8 rounded-t-[2.5rem]">
        <div className="mx-auto max-w-[1180px] px-4 py-14">
          <div className="mb-6">
            <div className="font-mono-label mb-1 text-[10px] text-primary">How it works</div>
            <h2 className="font-heading heading-2tone text-xl font-semibold">
              Acquisition <span className="dim">→ Conversion → Retention</span>
            </h2>
          </div>
          <FlywheelIntro />
        </div>
      </section>

      <section className="section-paper relative -mt-8 rounded-t-[2.5rem]">
        <div className="mx-auto max-w-[1180px] px-4 pt-2">
          <div className="font-mono-label pt-5 text-center text-[10px] text-primary">Find your campaign ↓</div>
        </div>
      </section>
    </>
  );
}
