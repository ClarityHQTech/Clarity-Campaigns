"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { useAdminStore } from "@/lib/store/admin-store";
import { buildAutoPod, applyPodOverrides } from "@/lib/calc/staffing";
import { buildSprintBreakdown } from "@/lib/calc/sprint";
import { resolvePrice, outcomeTargetFor, STANDARD_PRICE_USD } from "@/lib/calc/pricing";
import { stripeLinkFor } from "@/lib/stripe-links";
import { vendorLinesFor } from "@/components/pricing-summary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fmtMoney } from "@/lib/utils";

const HUBSPOT_MEETING_LINK = "https://meetings-na2.hubspot.com/virat-mohan";

function outcomeMetricLabel(metric: string, custom: string) {
  if (metric === "qualified") return "qualified leads";
  if (metric === "opportunity") return "opportunities / meetings booked";
  if (metric === "closure") return "closed deals";
  return custom || "the agreed custom metric";
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");

  const campaign = useCampaignStore((s) =>
    campaignId ? s.campaigns.find((c) => c.id === campaignId) : null
  );
  const setLastOrder = useCampaignStore((s) => s.setLastOrder);
  const setStatus = useCampaignStore((s) => s.setStatus);
  const adminVendors = useAdminStore((s) => s.vendors);
  const podTemplates = useAdminStore((s) => s.podTemplates);
  const markupFixed = useAdminStore((s) => s.markupFixed);
  const markupHybrid = useAdminStore((s) => s.markupHybrid);

  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");

  const config = campaign?.config ?? null;
  const sku = campaign?.sku ?? null;
  const ct = sku ? CAMPAIGN_TYPES[sku] : null;
  const templateSteps = sku ? podTemplates[sku] : undefined;

  const pod = useMemo(() => {
    if (!sku || !config) return [];
    const suggested = buildAutoPod(sku, config.audienceSize, templateSteps);
    return applyPodOverrides(suggested, config.podOverrides ?? {});
  }, [sku, config, templateSteps]);

  const sprintBreakdown = useMemo(
    () => (sku && config ? buildSprintBreakdown(sku, config.sprints ?? 1, templateSteps) : null),
    [sku, config, templateSteps]
  );

  if (!ct || !config || !sku || !campaign || !campaignId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">No campaign selected for checkout.</p>
        <Button className="mt-4" onClick={() => router.push("/campaigns")}>
          My Campaigns
        </Button>
      </div>
    );
  }

  const cfg = config;
  const vendorLines = vendorLinesFor(cfg.vendorToggles, cfg.customVendors, adminVendors);
  const outcomeTarget = outcomeTargetFor(cfg.outcomeMetric, {
    audienceSize: cfg.audienceSize,
    qualifiedPct: cfg.qualifiedPct,
    opportunityPct: cfg.opportunityPct,
    closePct: cfg.closePct,
    asp: cfg.asp,
  });
  const preset = cfg.preset ?? "standard";
  const pricing = resolvePrice(preset, {
    sku,
    pod,
    assets: cfg.assets,
    audience: cfg.audienceSize,
    channels: cfg.channels,
    emailSteps: cfg.emailSteps,
    liSteps: cfg.liSteps,
    waSteps: cfg.waSteps,
    adSpend: cfg.adSpend,
    vendorLines,
    priceMode: cfg.priceMode,
    outcomeMetric: cfg.outcomeMetric,
    outcomeTarget,
    outcomeRate: cfg.outcomeRate,
    outcomeDeltaRate: cfg.outcomeDeltaRate,
    outcomeDeltaThreshold: cfg.outcomeDeltaThreshold,
    markupFixed,
    markupHybrid,
  });

  const dueNow = pricing.totalPrice + pricing.adSpend + pricing.vendorCostUsd;
  const metricLabel = outcomeMetricLabel(cfg.outcomeMetric, cfg.outcomeCustomLabel);
  const stripeLink = stripeLinkFor(sku);

  // TODO(brief §7.4): Stripe webhook should flip the campaign to "active" and push
  // campaign_purchased to HubSpot server-side once payment is confirmed. Not wired
  // here — needs server credentials we don't have. This just opens the Payment Link.
  function handlePayStripe() {
    if (!stripeLink) return;
    setPaying(true);
    const referenceNumber = `CHQ-${sku!.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    setLastOrder({
      referenceNumber,
      campaignId: campaignId!,
      sku: sku!,
      paidAt: new Date().toISOString(),
      grandTotal: pricing.grandTotal,
      fixedDueNow: dueNow,
      variableNote: null,
    });
    setStatus(campaignId!, "active");
    window.open(stripeLink, "_blank", "noopener,noreferrer");
    setPaying(false);
    setPaid(true);
    router.push("/confirmation");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Checkout</div>
        <h1 className="font-heading text-2xl font-semibold">{cfg.name || "Untitled campaign"}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{ct.label} · order summary</p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">Brief</div>
          <table className="w-full text-[12.5px]">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground w-32">Client</td>
                <td className="py-1.5">{cfg.client || "—"}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">Objective</td>
                <td className="py-1.5">{cfg.objective}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">Channels</td>
                <td className="py-1.5">{cfg.channels.join(", ")}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-muted-foreground">Owner / Timeline</td>
                <td className="py-1.5">
                  {cfg.owner || "—"} · {cfg.weeks} weeks · {cfg.sprints} sprints
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">
            Pod ({pod.length} steps staffed)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(pod.map((p) => p.role))).map((role) => (
              <span
                key={role}
                className="font-mono text-[10px] px-2 py-1 rounded-[3px] bg-muted text-muted-foreground-2"
              >
                {role}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">Timeline</div>
          <p className="text-[12.5px]">
            {sprintBreakdown?.totalDays} elapsed days · {sprintBreakdown?.approxWeeks} weeks ·{" "}
            {sprintBreakdown?.sprints.length} sprints
            {cfg.timelineApproved ? " — approved" : " — not yet approved"}
          </p>
        </CardContent>
      </Card>

      {preset === "custom" ? (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="font-mono-label text-[9.5px] text-muted-foreground mb-3">Price breakdown</div>
            <table className="w-full text-[12.5px]">
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">Total cost (pod + assets + tech)</td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.totalCost)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">
                    Client price ({cfg.priceMode}) · {pricing.multiple}× cost
                  </td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.totalPrice)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">Ad spend (separate)</td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.adSpend)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">Vendor costs (separate)</td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.vendorCostUsd)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-heading text-[15px] font-semibold">Grand total</td>
                  <td className="py-2 text-right font-heading text-[17px] font-semibold text-primary">
                    {fmtMoney(pricing.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="font-mono-label text-[9.5px] text-muted-foreground mb-3">Price breakdown</div>
            <table className="w-full text-[12.5px]">
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">Campaign fee</td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(STANDARD_PRICE_USD)}</td>
                </tr>
                {pricing.adSpend > 0 && (
                  <tr className="border-b border-border">
                    <td className="py-1.5 text-muted-foreground">Ad spend (separate)</td>
                    <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.adSpend)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 font-heading text-[15px] font-semibold">Grand total</td>
                  <td className="py-2 text-right font-heading text-[17px] font-semibold text-primary">
                    {fmtMoney(pricing.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4 border-secondary/30">
        <CardContent className="pt-4">
          <div className="font-mono-label text-[9.5px] text-secondary mb-2">Payment — due now</div>
          <div className="font-heading text-2xl font-semibold mb-2">
            {preset === "custom" ? fmtMoney(dueNow) : fmtMoney(pricing.grandTotal)}
          </div>
          {preset === "custom" ? (
            <>
              <p className="text-[12px] text-muted-foreground mb-3">
                100% of the fixed / base component, ad spend, and vendor costs is due now.
              </p>
              {cfg.priceMode === "hybrid" && (
                <p className="mb-4 rounded-[3px] border border-primary/30 bg-primary/5 px-3 py-2 text-[12px] text-primary">
                  Variable component invoiced on completion, based on {metricLabel} achieved.
                </p>
              )}
              <div className="flex items-center gap-3">
                <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
                  <Button size="lg">Request your quote →</Button>
                </a>
                <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">Schedule a call first</Button>
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-[12px] text-muted-foreground mb-3">
                {preset === "growth" ? "$499 campaign fee + ad spend, due now." : "$499 campaign fee, due now."}
              </p>
              {!stripeLink && (
                <p className="mb-3 rounded-[3px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
                  Payment link not configured for {ct.label}.
                </p>
              )}
              <div className="flex items-center gap-3">
                <Button size="lg" onClick={handlePayStripe} disabled={!stripeLink || paying || paid}>
                  {paying ? "Opening Stripe…" : paid ? "Paid — check your email" : `Pay ${fmtMoney(STANDARD_PRICE_USD)} — Start campaign →`}
                </Button>
                <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">Schedule a call first</Button>
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="pt-4 pb-3">
          <Label>Change requests / notes for the team</Label>
          <Textarea
            placeholder="Anything you'd like adjusted before we start?"
            value={changeRequest}
            onChange={(e) => setChangeRequest(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground-2 mb-6">
        <span>Secure checkout via Stripe</span>
        <span aria-hidden>·</span>
        <span>Campaign starts within 48h</span>
        <span aria-hidden>·</span>
        <span>Human Pod assigned on payment</span>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-16 text-center text-muted-foreground">Loading…</div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
