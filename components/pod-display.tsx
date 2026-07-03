import { PodRow } from "@/lib/calc/staffing";
import { Card, CardContent } from "@/components/ui/card";
import { fmtMoney } from "@/lib/utils";

export function PodDisplay({ pod }: { pod: PodRow[] }) {
  const totalHours = pod.reduce((s, r) => s + r.hours, 0);
  const totalCost = pod.reduce((s, r) => s + r.hours * r.rate, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono-label text-[9.5px] text-muted-foreground">
          Auto-staffed pod — locked to process
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          {totalHours} hrs · {fmtMoney(totalCost)} cost basis
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {pod.map((row) => (
          <Card key={row.stepNumber}>
            <CardContent className="pt-4 pb-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-[#0E141B]">
                    {row.stepNumber}
                  </span>
                  <span className="font-heading text-[13px] font-semibold">{row.stepTitle}</span>
                </div>
                <span className="font-mono text-[10.5px] text-secondary whitespace-nowrap">
                  {row.role} · {row.hours} hrs @ ${row.rate}/hr
                </span>
              </div>
              <div className="ml-7 rounded-[3px] border-l-2 border-primary bg-muted px-2.5 py-2 text-[12px] text-muted-foreground">
                {row.out}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
