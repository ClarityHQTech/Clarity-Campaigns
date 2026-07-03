import Link from "next/link";
import { TalkToUsCta } from "@/components/talk-to-us-cta";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-[56px] max-w-[1180px] items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-[15px] font-bold text-foreground">
          <span className="grid h-[24px] w-[24px] place-items-center rounded-full bg-primary/15 border border-primary/40">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          ClarityHQ
        </Link>
        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary">
          Campaign Marketplace
        </span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/campaigns" className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            My Campaigns
          </Link>
          <Link href="/client" className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            Client Portal
          </Link>
          <Link href="/admin" className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <TalkToUsCta />
        </div>
      </div>
    </header>
  );
}
