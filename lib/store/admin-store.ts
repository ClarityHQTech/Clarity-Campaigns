"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CORE_POD_ROSTER, RETAINER_ROSTER, VENDOR_ROSTER } from "../data/talent-vendor-roster";
import { SkuId } from "../data/campaign-types";

export interface Freelancer {
  id: string;
  name: string;
  role: string; // job / title — matches a ROLE_LIBRARY role name where possible, but editable/freeform
  dept: string;
  rate: number; // $/hr
}

export type VendorMediaType = "video" | "image" | "influencer" | "other";

export interface AdminVendor {
  id: string;
  name: string;
  specialistArea: string;
  mediaType: VendorMediaType;
  price: number | null; // per project; null = TBD
  currency: "USD" | "INR";
  skuScope: SkuId[]; // [] = applies to every campaign type
}

// Seed freelancers — one named person per core role, so the admin panel and pod
// builder start with realistic data. Names are illustrative placeholders.
const SEED_NAMES = [
  "Priya Nair", "Rohan Malhotra", "Ananya Iyer", "Kabir Sethi", "Meera Chawla",
  "Arjun Kapoor", "Divya Menon", "Nikhil Bhatia", "Tara Fernandes", "Vikram Rao",
  "Isha Kulkarni", "Rahul Bose", "Simran Kaur", "Aditya Varma", "Neha Joshi",
  "Karan Thakur", "Pooja Reddy", "Siddharth Chandra", "Ritu Desai",
];

function buildSeedFreelancers(): Freelancer[] {
  return CORE_POD_ROSTER.map((role, i) => ({
    id: `freelancer-${role.id}`,
    name: SEED_NAMES[i % SEED_NAMES.length],
    role: role.name,
    dept: role.dept,
    rate: role.rate ?? 25,
  }));
}

const VENDOR_MEDIA_TYPE: Record<string, VendorMediaType> = {
  "ai-video-studio": "video",
  "film-director": "video",
  photographer: "image",
  "influencer-ugc-creator": "influencer",
};

function buildSeedVendors(): AdminVendor[] {
  const vendorRows: AdminVendor[] = VENDOR_ROSTER.map((v) => ({
    id: v.id,
    name: v.name,
    specialistArea: v.name,
    mediaType: VENDOR_MEDIA_TYPE[v.id] ?? "other",
    price: v.rate,
    currency: "USD",
    skuScope: [],
  }));
  const retainerRows: AdminVendor[] = RETAINER_ROSTER.map((v) => ({
    id: v.id,
    name: v.name,
    specialistArea: v.name,
    mediaType: "other",
    price: v.rate,
    currency: "INR",
    skuScope: [],
  }));
  return [...vendorRows, ...retainerRows];
}

interface AdminStoreState {
  freelancers: Freelancer[];
  vendors: AdminVendor[];
  addFreelancer: () => void;
  updateFreelancer: (id: string, partial: Partial<Omit<Freelancer, "id">>) => void;
  removeFreelancer: (id: string) => void;
  addVendor: () => void;
  updateVendor: (id: string, partial: Partial<Omit<AdminVendor, "id">>) => void;
  removeVendor: (id: string) => void;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set) => ({
      freelancers: buildSeedFreelancers(),
      vendors: buildSeedVendors(),
      addFreelancer: () =>
        set((state) => ({
          freelancers: [
            ...state.freelancers,
            { id: newId("freelancer"), name: "", role: "", dept: "Marketing", rate: 0 },
          ],
        })),
      updateFreelancer: (id, partial) =>
        set((state) => ({
          freelancers: state.freelancers.map((f) => (f.id === id ? { ...f, ...partial } : f)),
        })),
      removeFreelancer: (id) =>
        set((state) => ({ freelancers: state.freelancers.filter((f) => f.id !== id) })),
      addVendor: () =>
        set((state) => ({
          vendors: [
            ...state.vendors,
            { id: newId("vendor"), name: "", specialistArea: "", mediaType: "other", price: null, currency: "USD", skuScope: [] },
          ],
        })),
      updateVendor: (id, partial) =>
        set((state) => ({ vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...partial } : v)) })),
      removeVendor: (id) => set((state) => ({ vendors: state.vendors.filter((v) => v.id !== id) })),
    }),
    { name: "clarity-admin-data" }
  )
);
