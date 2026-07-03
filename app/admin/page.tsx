"use client";

import { useState } from "react";
import { useAdminStore, VendorMediaType } from "@/lib/store/admin-store";
import { CAMPAIGN_TYPE_LIST, SkuId } from "@/lib/data/campaign-types";
import { ROLE_LIBRARY } from "@/lib/data/role-library";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDIA_TYPES: VendorMediaType[] = ["video", "image", "other"];

export default function AdminPage() {
  const freelancers = useAdminStore((s) => s.freelancers);
  const addFreelancer = useAdminStore((s) => s.addFreelancer);
  const updateFreelancer = useAdminStore((s) => s.updateFreelancer);
  const removeFreelancer = useAdminStore((s) => s.removeFreelancer);

  const vendors = useAdminStore((s) => s.vendors);
  const addVendor = useAdminStore((s) => s.addVendor);
  const updateVendor = useAdminStore((s) => s.updateVendor);
  const removeVendor = useAdminStore((s) => s.removeVendor);

  const [tab, setTab] = useState("freelancers");

  function toggleSkuScope(vendorId: string, sku: SkuId, current: SkuId[]) {
    const next = current.includes(sku) ? current.filter((s) => s !== sku) : [...current, sku];
    updateVendor(vendorId, { skuScope: next });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Internal — no auth in this demo</div>
        <h1 className="font-heading text-2xl font-semibold">Admin</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage the named freelancer roster and vendor list used when building campaigns.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="freelancers">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Named freelancers, each tied to a job/role and hourly rate. These can be pulled onto a pod card
            while building a campaign, so the plan shows real people instead of just role titles.
          </p>
          <div className="flex flex-col gap-2">
            {freelancers.map((f) => (
              <Card key={f.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[150px]">
                      <Label>Name</Label>
                      <Input value={f.name} onChange={(e) => updateFreelancer(f.id, { name: e.target.value })} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Label>Role / job</Label>
                      <Input
                        list="role-library-options"
                        value={f.role}
                        onChange={(e) => updateFreelancer(f.id, { role: e.target.value })}
                      />
                    </div>
                    <div className="w-36">
                      <Label>Dept</Label>
                      <Input value={f.dept} onChange={(e) => updateFreelancer(f.id, { dept: e.target.value })} />
                    </div>
                    <div className="w-28">
                      <Label>Rate ($/hr)</Label>
                      <Input
                        type="number"
                        value={f.rate}
                        onChange={(e) => updateFreelancer(f.id, { rate: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFreelancer(f.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <datalist id="role-library-options">
            {ROLE_LIBRARY.map((r) => (
              <option key={r.name} value={r.name} />
            ))}
          </datalist>
          <Button variant="outline" size="sm" className="mt-3" onClick={addFreelancer}>
            + Add freelancer
          </Button>
        </TabsContent>

        <TabsContent value="vendors">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Vendors and specialist capacity, priced per project. Scope to specific campaign types, or leave
            unscoped to make a vendor available everywhere. Media type (video/image) gates visibility to
            campaigns that actually have that kind of asset in the brief.
          </p>
          <div className="flex flex-col gap-2">
            {vendors.map((v) => (
              <Card key={v.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-end gap-3 mb-3">
                    <div className="flex-1 min-w-[150px]">
                      <Label>Name</Label>
                      <Input value={v.name} onChange={(e) => updateVendor(v.id, { name: e.target.value })} />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <Label>Specialist area</Label>
                      <Input value={v.specialistArea} onChange={(e) => updateVendor(v.id, { specialistArea: e.target.value })} />
                    </div>
                    <div className="w-32">
                      <Label>Media type</Label>
                      <Select value={v.mediaType} onValueChange={(mt) => updateVendor(v.id, { mediaType: mt as VendorMediaType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MEDIA_TYPES.map((mt) => (
                            <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-28">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        placeholder="TBD"
                        value={v.price ?? ""}
                        onChange={(e) => updateVendor(v.id, { price: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                    </div>
                    <div className="w-24">
                      <Label>Currency</Label>
                      <Select value={v.currency} onValueChange={(c) => updateVendor(v.id, { currency: c as "USD" | "INR" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeVendor(v.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div>
                    <Label className="mb-1">
                      SKU scope <span className="normal-case text-[#8a8578]">(none selected = all campaign types)</span>
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {CAMPAIGN_TYPE_LIST.map((ct) => {
                        const selected = v.skuScope.includes(ct.id);
                        return (
                          <button
                            key={ct.id}
                            type="button"
                            onClick={() => toggleSkuScope(v.id, ct.id, v.skuScope)}
                            className={cn(
                              "font-mono text-[10px] px-2 py-1 rounded-[3px] border transition-colors",
                              selected
                                ? "bg-paper-foreground text-paper border-paper-foreground"
                                : "bg-transparent text-muted-foreground-2 border-border-strong hover:border-primary-hover"
                            )}
                          >
                            {ct.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={addVendor}>
            + Add vendor
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
