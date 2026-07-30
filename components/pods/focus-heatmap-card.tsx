"use client";

import { useMemo } from "react";
import type { FocusHeatmapResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface FocusHeatmapCardProps {
  heatmap: FocusHeatmapResponse | null;
}

function intensityClass(minutes: number) {
  if (minutes <= 0) return "bg-white/[0.04]";
  if (minutes < 30) return "bg-[var(--accent)]/20";
  if (minutes < 60) return "bg-[var(--accent)]/40";
  if (minutes < 120) return "bg-[var(--accent)]/65";
  return "bg-[var(--accent)]";
}

export function FocusHeatmapCard({ heatmap }: FocusHeatmapCardProps) {
  const weeks = useMemo(() => {
    if (!heatmap?.cells.length) {
      return [];
    }

    const cells = [...heatmap.cells];
    const first = new Date(`${cells[0].day}T00:00:00.000Z`);
    const pad = first.getUTCDay(); // 0 Sun … 6 Sat
    const padded: Array<FocusHeatmapResponse["cells"][number] | null> = [
      ...Array.from({ length: pad }, () => null),
      ...cells,
    ];

    const rows: Array<Array<FocusHeatmapResponse["cells"][number] | null>> = [];
    for (let i = 0; i < padded.length; i += 7) {
      rows.push(padded.slice(i, i + 7));
    }
    return rows;
  }, [heatmap]);

  const totalHours = heatmap
    ? Math.round((heatmap.totalMinutes / 60) * 10) / 10
    : 0;

  return (
    <Card className="overflow-hidden border-[var(--accent)]/15 bg-[radial-gradient(circle_at_bottom_left,_rgba(198,243,90,0.08),_transparent_50%)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Focus heatmap</CardTitle>
            <CardDescription className="mt-1">
              Hours you actually sat down and worked — last {heatmap?.days ?? 84}{" "}
              days.
            </CardDescription>
          </div>
          <Badge variant="accent">{totalHours}h</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {!heatmap?.cells.length ? (
          <EmptyState message="Finish a focus block to start painting the grid." />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto pb-1">
              <div className="inline-flex min-w-full gap-1.5">
                {weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="flex flex-col gap-1.5">
                    {week.map((cell, dayIndex) => {
                      if (!cell) {
                        return (
                          <div
                            key={`pad-${weekIndex}-${dayIndex}`}
                            className="h-3 w-3 rounded-[3px] bg-transparent sm:h-3.5 sm:w-3.5"
                          />
                        );
                      }

                      return (
                        <div
                          key={cell.day}
                          title={`${cell.day}: ${cell.hours}h (${cell.sessionCount} sessions)`}
                          className={cn(
                            "h-3 w-3 rounded-[3px] sm:h-3.5 sm:w-3.5",
                            intensityClass(cell.totalMinutes),
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
              <span>Less</span>
              <div className="flex items-center gap-1">
                {[0, 20, 45, 90, 150].map((minutes) => (
                  <div
                    key={minutes}
                    className={cn(
                      "h-3 w-3 rounded-[3px]",
                      intensityClass(minutes),
                    )}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
