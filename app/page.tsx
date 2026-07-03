import Link from "next/link";
import { CAMPAIGN_TYPE_LIST } from "@/lib/data/campaign-types";
import { SkuCard } from "@/components/sku-card";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-10">
      <div className="mb-10 border-b border-border pb-6">
        <div className="font-mono-label text-[10px] text-primary mb-1">Campaign command centre</div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight mb-2">
          Build a growth pod in minutes
        </h1>
        <p className="max-w-2xl text-[13px] text-muted-foreground mb-5">
          Pick a campaign type, tell us about your brand, and get a staffed pod, timeline, and
          transparent pricing — the same process our team uses internally, self-serve.
        </p>
        <Link href="/brand-foundation">
          <Button size="lg">Start with your brand foundation</Button>
        </Link>
      </div>

      <div className="mb-4">
        <h2 className="font-heading text-lg font-semibold">Campaign Types We Sell</h2>
        <p className="text-[12.5px] text-muted-foreground">
          Every card maps to a stage of the growth flywheel — acquisition, conversion, or retention.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPAIGN_TYPE_LIST.map((ct) => (
          <SkuCard key={ct.id} ct={ct} />
        ))}
      </div>
    </div>
  );
}
