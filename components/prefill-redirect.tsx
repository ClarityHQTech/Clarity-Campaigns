"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { slugToSku } from "@/lib/data/campaign-types";

// Deep-link prefill (brief §7.2): ?type=outbound-sales[&brand=&score=&name=] routes
// straight into the brief with the campaign preselected. Invalid/missing `type`
// leaves the normal landing page untouched.
export function PrefillRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const sku = slugToSku(type);

  useEffect(() => {
    if (!sku) return;
    const forward = new URLSearchParams();
    forward.set("type", type!);
    const brand = searchParams.get("brand");
    const score = searchParams.get("score");
    const name = searchParams.get("name");
    if (brand) forward.set("brand", brand);
    if (score) forward.set("score", score);
    if (name) forward.set("name", name);
    router.replace(`/build/new?${forward.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
