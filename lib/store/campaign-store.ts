"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SkuId, CAMPAIGN_TYPES } from "../data/campaign-types";
import type { OutcomeMetric, PriceMode } from "../calc/pricing";
import { industryFunnelBenchmark } from "../calc/reach";

export interface BrandContext {
  brandBookName: string;
  salesDataName: string;
  socialHandles: string;
  websiteUrl: string;
  processed: boolean;
  icpSnippet: string;
  brandBookSnippet: string;
}

export interface VendorToggleState {
  on: boolean;
  cost: number | null; // null = TBD/blank
}

export interface CampaignConfig {
  // Overview
  client: string;
  name: string;
  objective: string;
  goal: string;
  sell: string;
  // Audience & Targeting
  icp: string;
  audienceSize: number;
  source: string;
  industry: string; // for marketing-mode SKUs
  // Channels & Assets
  channels: string[];
  assets: { type: string; qty: number; rate: number }[];
  emailSteps: number;
  liSteps: number;
  waSteps: number;
  // Funnel & Commercial
  qualifiedPct: number;
  opportunityPct: number;
  closePct: number;
  asp: number;
  adSpend: number;
  adSpendCadence: "monthly" | "onetime";
  adBudgetForReach: number;
  // Delivery
  owner: string;
  weeks: number;
  sprints: number;
  notes: string;
  risks: string;
  // Vendor toggles, keyed by roster id
  vendorToggles: Record<string, VendorToggleState>;
  // Pod hours/rate overrides, keyed by PROCS step number. Suggested standards
  // pre-fill the pod; these overrides are set only when a user edits a value.
  podOverrides: Record<number, { hours: number; rate: number }>;
  // Timeline
  timelineApproved: boolean;
  // Pricing
  priceMode: PriceMode;
  outcomeMetric: OutcomeMetric;
  outcomeCustomLabel: string;
  outcomeRate: number;
  outcomeDeltaRate: number;
  outcomeDeltaThreshold: number;
}

// Cached per sku so repeated reads before any edit return the same object
// reference — required for useSyncExternalStore snapshot stability.
const defaultConfigCache = new Map<SkuId, CampaignConfig>();

function defaultConfig(sku: SkuId): CampaignConfig {
  const cached = defaultConfigCache.get(sku);
  if (cached) return cached;
  const built = buildDefaultConfig(sku);
  defaultConfigCache.set(sku, built);
  return built;
}

function buildDefaultConfig(sku: SkuId): CampaignConfig {
  const ct = CAMPAIGN_TYPES[sku];
  const benchmark = industryFunnelBenchmark("d2c", ct.channels);
  return {
    client: "",
    name: "",
    objective: "Lead Generation",
    goal: "",
    sell: "",
    icp: "",
    audienceSize: 1000,
    source: "Account book",
    industry: "d2c",
    channels: [...ct.channels],
    assets: [],
    emailSteps: 4,
    liSteps: 2,
    waSteps: 2,
    qualifiedPct: benchmark.qualifiedPct,
    opportunityPct: benchmark.opportunityPct,
    closePct: benchmark.closePct,
    asp: 2000,
    adSpend: 0,
    adSpendCadence: "monthly",
    adBudgetForReach: 2000,
    owner: "",
    weeks: 8,
    sprints: 2,
    notes: "",
    risks: "",
    vendorToggles: {},
    podOverrides: {},
    timelineApproved: false,
    priceMode: "fixed",
    outcomeMetric: "opportunity",
    outcomeCustomLabel: "",
    outcomeRate: 0,
    outcomeDeltaRate: 0,
    outcomeDeltaThreshold: 10,
  };
}

export interface OrderRecord {
  referenceNumber: string;
  sku: SkuId;
  paidAt: string;
  grandTotal: number;
  fixedDueNow: number;
  variableNote: string | null;
}

interface CampaignStoreState {
  brand: BrandContext | null;
  configs: Partial<Record<SkuId, CampaignConfig>>;
  lastOrder: OrderRecord | null;
  setBrand: (brand: BrandContext) => void;
  getConfig: (sku: SkuId) => CampaignConfig;
  updateConfig: (sku: SkuId, partial: Partial<CampaignConfig>) => void;
  setVendorToggle: (sku: SkuId, vendorId: string, state: VendorToggleState) => void;
  setPodOverride: (sku: SkuId, stepNumber: number, override: { hours: number; rate: number }) => void;
  resetPodOverride: (sku: SkuId, stepNumber: number) => void;
  approveTimeline: (sku: SkuId) => void;
  setLastOrder: (order: OrderRecord) => void;
}

export const useCampaignStore = create<CampaignStoreState>()(
  persist(
    (set, get) => ({
      brand: null,
      configs: {},
      lastOrder: null,
      setBrand: (brand) => set({ brand }),
      getConfig: (sku) => get().configs[sku] ?? defaultConfig(sku),
      updateConfig: (sku, partial) =>
        set((state) => ({
          configs: {
            ...state.configs,
            [sku]: { ...(state.configs[sku] ?? defaultConfig(sku)), ...partial },
          },
        })),
      setVendorToggle: (sku, vendorId, vendorState) =>
        set((state) => {
          const current = state.configs[sku] ?? defaultConfig(sku);
          return {
            configs: {
              ...state.configs,
              [sku]: {
                ...current,
                vendorToggles: { ...current.vendorToggles, [vendorId]: vendorState },
              },
            },
          };
        }),
      setPodOverride: (sku, stepNumber, override) =>
        set((state) => {
          const current = state.configs[sku] ?? defaultConfig(sku);
          return {
            configs: {
              ...state.configs,
              [sku]: { ...current, podOverrides: { ...current.podOverrides, [stepNumber]: override } },
            },
          };
        }),
      resetPodOverride: (sku, stepNumber) =>
        set((state) => {
          const current = state.configs[sku] ?? defaultConfig(sku);
          const nextOverrides = { ...current.podOverrides };
          delete nextOverrides[stepNumber];
          return { configs: { ...state.configs, [sku]: { ...current, podOverrides: nextOverrides } } };
        }),
      approveTimeline: (sku) =>
        set((state) => {
          const current = state.configs[sku] ?? defaultConfig(sku);
          return { configs: { ...state.configs, [sku]: { ...current, timelineApproved: true } } };
        }),
      setLastOrder: (order) => set({ lastOrder: order }),
    }),
    { name: "clarity-campaign-marketplace" }
  )
);
