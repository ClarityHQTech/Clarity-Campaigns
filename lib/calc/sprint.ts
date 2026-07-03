import { SkuId } from "../data/campaign-types";
import { PROCS, ProcStep } from "../data/procs";

export interface SprintDay {
  rangeLabel: string;
  stepTitle: string;
  role: string;
}

export interface Sprint {
  n: number;
  days: number;
  rows: SprintDay[];
}

export interface SprintBreakdown {
  sprints: Sprint[];
  totalDays: number;
  daysPerSprint: number;
  approxWeeks: number;
}

// Ported from buildSprintBreakdown() / sprintHtml() in the source HTML.
export function buildSprintBreakdown(sku: SkuId, sprintCountInput: number): SprintBreakdown {
  const steps: ProcStep[] = PROCS[sku] ?? [];
  const totalDays = steps.reduce((sum, s) => sum + s.days, 0);
  const sprintCount = Math.max(1, sprintCountInput || 1);
  const daysPerSprint = Math.ceil(totalDays / sprintCount);

  const sprints: { n: number; steps: ProcStep[]; days: number }[] = [];
  for (let s = 0; s < sprintCount; s++) sprints.push({ n: s + 1, steps: [], days: 0 });

  let cum = 0;
  let sprintIdx = 0;
  for (const step of steps) {
    sprints[sprintIdx].steps.push(step);
    sprints[sprintIdx].days += step.days;
    cum += step.days;
    if (cum >= daysPerSprint * (sprintIdx + 1) && sprintIdx < sprintCount - 1) sprintIdx++;
  }

  let dayCursor = 0;
  const renderedSprints: Sprint[] = sprints.map((sp) => {
    const rows: SprintDay[] = sp.steps.map((st) => {
      const startDay = dayCursor + 1;
      dayCursor += st.days;
      const rangeLabel = st.days > 1 ? `Day ${startDay}-${dayCursor}` : `Day ${startDay}`;
      return { rangeLabel, stepTitle: st.t, role: st.role };
    });
    return { n: sp.n, days: sp.days, rows };
  });

  return {
    sprints: renderedSprints,
    totalDays,
    daysPerSprint,
    approxWeeks: Math.ceil(totalDays / 7),
  };
}
