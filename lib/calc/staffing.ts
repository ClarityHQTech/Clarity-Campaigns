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

// Minimal shape required from admin template steps — avoids importing "use client" admin-store.
type TemplateStep = {
  stepNumber: number;
  title: string;
  role: string;
  hours: number;
  rate: number;
  deliverable: string;
  active: boolean;
};

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

// When templateSteps are provided (admin-configured), they are used as-is with no
// audience scaling — the admin sets exact hours per step. Falls back to PROCS-based
// audience-scaled auto-staffing when no template exists.
export function buildAutoPod(sku: SkuId, audienceSize: number, templateSteps?: TemplateStep[]): PodRow[] {
  if (templateSteps && templateSteps.length > 0) {
    return templateSteps
      .filter((s) => s.active)
      .map((s) => ({
        stepNumber: s.stepNumber,
        stepTitle: s.title,
        role: s.role,
        hours: s.hours,
        rate: s.rate,
        out: s.deliverable,
      }));
  }
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

export interface PodOverride {
  role: string;
  hours: number;
  rate: number;
}

// Pod role/hours/rate are togglable — each row suggests the standard (PROCS
// role + baseHrs scaled by audience, ROLE_LIBRARY rate) but a user override
// takes precedence, including swapping which role is staffed on a step.
export function applyPodOverrides(
  suggestedPod: PodRow[],
  overrides: Record<number, PodOverride>
): PodRow[] {
  return suggestedPod.map((row) => {
    const override = overrides[row.stepNumber];
    return override ? { ...row, role: override.role, hours: override.hours, rate: override.rate } : row;
  });
}
