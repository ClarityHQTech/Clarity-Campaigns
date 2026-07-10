import { SkuId } from "./data/campaign-types";

// Stripe Payment Links, one per SKU — set via env, never hardcoded.
// Empty/missing means "not configured yet"; callers must disable the pay button
// and show a notice rather than falling back to a placeholder URL.
export const STRIPE_LINKS: Record<SkuId, string | undefined> = {
  abm: process.env.NEXT_PUBLIC_STRIPE_LINK_OUTBOUND_SALES,
  social: process.env.NEXT_PUBLIC_STRIPE_LINK_SOCIAL_ORGANIC,
  content: process.env.NEXT_PUBLIC_STRIPE_LINK_CONTENT_LED,
  performance: process.env.NEXT_PUBLIC_STRIPE_LINK_PERFORMANCE,
  retention: process.env.NEXT_PUBLIC_STRIPE_LINK_RETENTION,
};

export function stripeLinkFor(sku: SkuId): string | null {
  const link = STRIPE_LINKS[sku];
  return link && link.trim().length > 0 ? link : null;
}
