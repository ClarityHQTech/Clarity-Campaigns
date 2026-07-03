"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/lib/store/campaign-store";

const ILLUSTRATIVE_ICP =
  "D2C founders and growth leads at $1-10M ARR e-commerce brands, India-first, active on Instagram and LinkedIn, price-sensitive but conversion-literate.";
const ILLUSTRATIVE_BRAND_BOOK =
  "Voice: direct, no-fluff, confident. Primary palette skews dark with a single warm accent. Typography pairs a geometric display face with a plain-spoken body face. Never uses stock-photo aesthetics.";

export default function BrandFoundationPage() {
  const router = useRouter();
  const setBrand = useCampaignStore((s) => s.setBrand);

  const [brandBookName, setBrandBookName] = useState("");
  const [salesDataName, setSalesDataName] = useState("");
  const [socialHandles, setSocialHandles] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  function handleProcess() {
    setStatus("processing");
    setTimeout(() => {
      setBrand({
        brandBookName,
        salesDataName,
        socialHandles,
        websiteUrl,
        processed: true,
        icpSnippet: ILLUSTRATIVE_ICP,
        brandBookSnippet: ILLUSTRATIVE_BRAND_BOOK,
      });
      setStatus("done");
    }, 1400);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Step 1 of 9</div>
        <h1 className="font-heading text-2xl font-semibold">Brand Foundation</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Give us what you have. This pre-fills your campaign brief in the next step — nothing here
          is sent anywhere in this demo.
        </p>
      </div>

      <Card className="bg-paper border-paper-border">
        <CardContent className="pt-5 text-paper-foreground">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Brand book (file name)</Label>
              <Input
                placeholder="brand-guidelines.pdf"
                value={brandBookName}
                onChange={(e) => setBrandBookName(e.target.value)}
              />
            </div>
            <div>
              <Label>Sales data (CSV file name)</Label>
              <Input
                placeholder="sales-export-2026.csv"
                value={salesDataName}
                onChange={(e) => setSalesDataName(e.target.value)}
              />
            </div>
            <div>
              <Label>Social handles</Label>
              <Input
                placeholder="@yourbrand"
                value={socialHandles}
                onChange={(e) => setSocialHandles(e.target.value)}
              />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input
                placeholder="https://yourbrand.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-[#6a7280]">
            Mock upload fields — no files are actually uploaded or stored in this demo.
          </p>
          <Button className="mt-4" onClick={handleProcess} disabled={status === "processing"}>
            {status === "processing" ? "Processing…" : "Process brand inputs"}
          </Button>
        </CardContent>
      </Card>

      {status === "processing" && (
        <Card className="mt-4">
          <CardContent className="pt-5 text-[13px] text-muted-foreground">
            Analyzing brand inputs…
          </CardContent>
        </Card>
      )}

      {status === "done" && (
        <Card className="mt-4 border-secondary/30">
          <CardContent className="pt-5">
            <CardTitle className="text-secondary">Brand Intelligence Summary — illustrative</CardTitle>
            <p className="mb-3 text-[11px] text-muted-foreground-2">
              This is a hardcoded placeholder output for demo purposes, not a real analysis of your
              inputs.
            </p>
            <div className="mb-3">
              <div className="font-mono-label text-[9.5px] text-primary mb-1">ICP snippet</div>
              <p className="text-[13px] text-foreground">{ILLUSTRATIVE_ICP}</p>
            </div>
            <div>
              <div className="font-mono-label text-[9.5px] text-primary mb-1">Brand book snippet</div>
              <p className="text-[13px] text-foreground">{ILLUSTRATIVE_BRAND_BOOK}</p>
            </div>
            <Button className="mt-5" variant="secondary" onClick={() => router.push("/")}>
              Continue to campaign selection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
