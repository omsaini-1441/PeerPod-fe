import Link from "next/link";
import { Flame, UserRound } from "lucide-react";
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
        <Badge>
          <UserRound className="h-3.5 w-3.5" />
          Pod members
        </Badge>
        <CardTitle className="mt-3">Who is inside</CardTitle>
        <CardDescription className="mt-2">
          Enough consistency to matter, not enough sugar to turn this into a game shop.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-white">{member.user.username}</p>
              <Badge>{member.role}</Badge>
            </div>
          </div>
        ))}

        <div className="rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-4">
          <div className="flex items-center gap-2 text-amber-100">
            <Flame className="h-4 w-4" />
            <p className="text-sm">Current streak</p>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            {profile?.currentStreak ?? 0} days
          </p>
        </div>

        <Button asChild variant="secondary" className="w-full">
          <Link href="/profile">Open profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
