import { Button } from "@/components/ui/button";

const HUBSPOT_MEETING_LINK = "https://meetings-na2.hubspot.com/virat-mohan";

export function TalkToUsCta({ variant = "header" }: { variant?: "header" | "inline" }) {
  if (variant === "inline") {
    return (
      <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm">
          Talk to us instead
        </Button>
      </a>
    );
  }
  return (
    <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="sm">
        Talk to us
      </Button>
    </a>
  );
}
