"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { slugToSku } from "@/lib/data/campaign-types";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { useClientStore } from "@/lib/store/client-store";

function NewCampaignRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // `type` (slug, preferred) takes priority; `sku` (internal id) is a legacy fallback.
  const sku = slugToSku(searchParams.get("type")) ?? slugToSku(searchParams.get("sku"));
  const brand = searchParams.get("brand");
  const score = searchParams.get("score");
  const name = searchParams.get("name");
  const createCampaign = useCampaignStore((s) => s.createCampaign);
  const updateConfig = useCampaignStore((s) => s.updateConfig);
  const clientProfile = useClientStore((s) => s.profile);

  useEffect(() => {
    if (!sku) {
      router.replace("/");
      return;
    }
    const id = createCampaign(sku, clientProfile?.id);
    const scoreNum = score !== null ? Number(score) : null;
    updateConfig(id, {
      ...(brand ? { brandName: brand } : {}),
      ...(scoreNum !== null && !Number.isNaN(scoreNum) ? { brandXrayScore: scoreNum } : {}),
      ...(name ? { contactFirstName: name } : {}),
    });
    router.replace(`/build/${id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-[13px]">
      Creating campaign…
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-[13px]">Creating campaign…</div>}>
      <NewCampaignRedirect />
    </Suspense>
  );
}
