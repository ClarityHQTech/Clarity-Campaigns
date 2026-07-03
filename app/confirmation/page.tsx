"use client";

import Link from "next/link";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export default function ConfirmationPage() {
  const order = useCampaignStore((s) => s.lastOrder);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">No recent order found.</p>
        <Link href="/"><Button className="mt-4">Back to marketplace</Button></Link>
      </div>
    );
  }

  const ct = CAMPAIGN_TYPES[order.sku];

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-secondary" />
      <h1 className="font-heading text-2xl font-semibold mb-1">Campaign submitted</h1>
      <p className="text-[13px] text-muted-foreground mb-6">
        Thanks — your {ct.label} campaign is confirmed. This is a mock confirmation for demo purposes.
      </p>

      <Card className="text-left">
        <CardContent className="pt-4">
          <table className="w-full text-[12.5px]">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground w-40">Reference number</td>
                <td className="py-1.5 font-mono text-primary">{order.referenceNumber}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">Campaign type</td>
                <td className="py-1.5">{ct.label}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">Paid now</td>
                <td className="py-1.5 font-mono">{fmtMoney(order.fixedDueNow)}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-muted-foreground">Grand total</td>
                <td className="py-1.5 font-mono">{fmtMoney(order.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
          {order.variableNote && (
            <p className="mt-3 rounded-[3px] border border-primary/30 bg-primary/5 px-3 py-2 text-[12px] text-primary">
              {order.variableNote}
            </p>
          )}
        </CardContent>
      </Card>

      <Link href="/"><Button className="mt-6">Back to marketplace</Button></Link>
    </div>
  );
}
