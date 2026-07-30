import Link from "next/link";
import { Flame } from "lucide-react";
import type { GroupMember, Profile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MembersCardProps {
  members: GroupMember[];
  profile: Profile | null;
}

export function MembersCard({ members, profile }: MembersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Who is inside this pod</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-black/20 px-3.5 py-3"
            >
              <p className="truncate font-medium text-white">{member.user.username}</p>
              <Badge>{member.role}</Badge>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-2 pt-3">
          <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-4">
            <div className="flex items-center gap-2 text-[var(--warning)]">
              <Flame className="h-4 w-4" />
              <p className="text-sm">Your streak</p>
            </div>
            <p className="pp-display mt-2 text-3xl font-semibold text-white">
              {profile?.currentStreak ?? 0}
              <span className="ml-1 text-base font-normal text-[var(--muted)]">days</span>
            </p>
          </div>

          <Button asChild variant="secondary" className="w-full">
            <Link href="/profile">Open profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
