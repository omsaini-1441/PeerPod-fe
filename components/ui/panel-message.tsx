import { Card, CardContent } from "@/components/ui/card";

export function PanelMessage({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-10 text-center text-slate-300">{message}</CardContent>
    </Card>
  );
}
