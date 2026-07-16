import { Card, CardContent } from "@/components/ui/card";

export function BriefSection({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardContent className="p-[18px]">
        <div className="font-heading mb-0.5 text-[14px] font-semibold">{title}</div>
        {helper && <p className="mb-3 text-[11px] text-muted-foreground-2">{helper}</p>}
        <div className={helper ? undefined : "mt-3"}>{children}</div>
      </CardContent>
    </Card>
  );
}
