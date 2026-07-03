import { SkuId } from "../data/campaign-types";
import { PROCS } from "../data/procs";
import { findRole, UNMATCHED_ROLE_FALLBACK_RATE } from "../data/role-library";

export interface PodRow {
  stepNumber: number;
  stepTitle: string;
  role: string;
  hours: number;
  rate: number;
  out: string; // the specific deliverable text for this role's step, from PROCS
}

// Ported from applyAutoStaffing() in the source HTML: scale = audienceSize / 1000,
// clamped to [0.4, 3]. The source only applies this scale for sales-mode campaigns;
// this build applies it uniformly across SKUs using each brief's audience size input.
export function scaleForAudience(audienceSize: number): number {
  if (!audienceSize || audienceSize <= 0) return 1;
  const scale = audienceSize / 1000;
  return Math.max(0.4, Math.min(scale, 3));
}

export function rateForRole(roleName: string): number {
  const role = findRole(roleName);
  return role ? role.rate : UNMATCHED_ROLE_FALLBACK_RATE;
}

// Auto-generates the pod from PROCS[sku], scaled by audience. One row per process
// step (so each card shows its own specific deliverable, per "out") — the source
// tool's applyAutoStaffing() merges same-role steps for the cost table, but total
// cost is identical either way since it's a sum of hours * rate per step.
export function buildAutoPod(sku: SkuId, audienceSize: number): PodRow[] {
  const steps = PROCS[sku] ?? [];
  const scale = scaleForAudience(audienceSize);
  return steps.map((step) => ({
    stepNumber: step.n,
    stepTitle: step.t,
    role: step.role,
    hours: Math.round(step.baseHrs * scale),
    rate: rateForRole(step.role),
    out: step.out,
  }));
}

export function podCost(pod: PodRow[]): number {
  return pod.reduce((sum, r) => sum + r.hours * r.rate, 0);
}
