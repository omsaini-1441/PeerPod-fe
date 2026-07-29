import { Card, CardContent } from "@/components/ui/card";

export function PanelMessage({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-10 text-center text-[var(--muted)]">{message}</CardContent>
    </Card>
  );
}
