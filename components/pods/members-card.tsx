import Link from "next/link";
import { Flame } from "lucide-react";
import type { GroupMember, Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Score } from "@/components/ui/score";

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
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-xs font-semibold text-[var(--muted)]">
                  {member.user.username.slice(0, 1).toUpperCase()}
                </span>
                <p className="truncate font-medium text-white">
                  {member.user.username}
                </p>
              </div>
              <span className="shrink-0 text-xs text-[var(--muted)]">
                {member.role}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-2 pt-3">
          <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-4">
            <div className="flex items-center gap-2 text-[var(--warning)]">
              <Flame className="h-4 w-4" />
              <p className="text-sm">Your streak</p>
            </div>
            <Score
              value={profile?.currentStreak ?? 0}
              suffix="days"
              className="pp-display mt-2 text-3xl font-semibold text-white"
            />
          </div>

          <Button asChild variant="secondary" className="w-full">
            <Link href="/profile">Open profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
