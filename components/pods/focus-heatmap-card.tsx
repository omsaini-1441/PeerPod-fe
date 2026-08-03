"use client";

import { useMemo, useState } from "react";
import type { FocusHeatmapCell, FocusHeatmapResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Score } from "@/components/ui/score";
import { cn } from "@/lib/utils";

interface FocusHeatmapCardProps {
  heatmap: FocusHeatmapResponse | null;
}

type Intensity = 0 | 1 | 2 | 3 | 4;

const LEVEL_SAMPLES: Intensity[] = [0, 1, 2, 3, 4];

function intensityLevel(minutes: number): Intensity {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

function levelClass(level: Intensity) {
  switch (level) {
    case 0:
      return "bg-white/[0.05]";
    case 1:
      return "bg-[var(--accent)]/20";
    case 2:
      return "bg-[var(--accent)]/40";
    case 3:
      return "bg-[var(--accent)]/65";
    case 4:
      return "bg-[var(--accent)]";
  }
}

function formatDayLabel(day: string) {
  const date = new Date(`${day}T12:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(cell: FocusHeatmapCell) {
  if (cell.totalMinutes <= 0) {
    return "No focus";
  }
  if (cell.totalMinutes < 60) {
    return `${cell.totalMinutes} min`;
  }
  const hours = Math.floor(cell.totalMinutes / 60);
  const minutes = cell.totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function FocusHeatmapCard({ heatmap }: FocusHeatmapCardProps) {
  const [hoveredDay, setHoveredDay] = useState<FocusHeatmapCell | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<Intensity | null>(null);

  const weeks = useMemo(() => {
    if (!heatmap?.cells.length) {
      return [];
    }

    const cells = [...heatmap.cells];
    const first = new Date(`${cells[0].day}T00:00:00.000Z`);
    const pad = first.getUTCDay();
    const padded: Array<FocusHeatmapCell | null> = [
      ...Array.from({ length: pad }, () => null),
      ...cells,
    ];

    const columns: Array<Array<FocusHeatmapCell | null>> = [];
    for (let i = 0; i < padded.length; i += 7) {
      columns.push(padded.slice(i, i + 7));
    }
    return columns;
  }, [heatmap]);

  const totalHours = heatmap
    ? Math.round((heatmap.totalMinutes / 60) * 10) / 10
    : 0;

  return (
    <Card className="w-full overflow-visible">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 py-4">
        <div>
          <CardTitle className="text-base sm:text-lg">Effort map</CardTitle>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Last {heatmap?.days ?? 84} days
          </p>
        </div>
        <Score
          value={totalHours}
          suffix="h"
          decimals={1}
          className="text-sm text-[var(--accent)]"
        />
      </CardHeader>

      <CardContent className="pt-0">
        {!heatmap?.cells.length ? (
          <p className="text-sm text-[var(--muted)]">
            Finish a focus block to start painting the grid.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <div className="flex w-full gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div
                    key={`week-${weekIndex}`}
                    className="flex min-w-0 flex-1 flex-col gap-[3px]"
                  >
                    {week.map((cell, dayIndex) => {
                      if (!cell) {
                        return (
                          <div
                            key={`pad-${weekIndex}-${dayIndex}`}
                            className="aspect-square w-full"
                          />
                        );
                      }

                      const level = intensityLevel(cell.totalMinutes);
                      const isLevelMatch =
                        hoveredLevel !== null && hoveredLevel === level;
                      const isLevelDim =
                        hoveredLevel !== null && hoveredLevel !== level;
                      const isDayHover = hoveredDay?.day === cell.day;

                      return (
                        <button
                          key={cell.day}
                          type="button"
                          aria-label={`${formatDayLabel(cell.day)}: ${formatDuration(cell)}`}
                          onMouseEnter={() => {
                            setHoveredDay(cell);
                            setHoveredLevel(null);
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          onFocus={() => {
                            setHoveredDay(cell);
                            setHoveredLevel(null);
                          }}
                          onBlur={() => setHoveredDay(null)}
                          className={cn(
                            "aspect-square w-full rounded-[2px] transition duration-150",
                            levelClass(level),
                            isDayHover && "ring-1 ring-white/70 z-[1] scale-110",
                            isLevelMatch &&
                              "ring-1 ring-[var(--accent)] z-[1] scale-105",
                            isLevelDim && "opacity-20",
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {hoveredDay ? (
                <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 rounded-lg border border-[var(--border-strong)] bg-[#101210]/95 px-2.5 py-1.5 text-xs shadow-lg backdrop-blur-md">
                  <p className="font-medium text-white">
                    {formatDayLabel(hoveredDay.day)}
                  </p>
                  <p className="mt-0.5 text-[var(--muted)]">
                    {formatDuration(hoveredDay)}
                    {hoveredDay.sessionCount > 0
                      ? ` · ${hoveredDay.sessionCount} session${hoveredDay.sessionCount === 1 ? "" : "s"}`
                      : ""}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <span>Less</span>
              <div className="flex items-center gap-1">
                {LEVEL_SAMPLES.map((level) => {
                  const active = hoveredLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      aria-label={`Highlight level ${level}`}
                      onMouseEnter={() => {
                        setHoveredLevel(level);
                        setHoveredDay(null);
                      }}
                      onMouseLeave={() => setHoveredLevel(null)}
                      onFocus={() => {
                        setHoveredLevel(level);
                        setHoveredDay(null);
                      }}
                      onBlur={() => setHoveredLevel(null)}
                      className={cn(
                        "h-2.5 w-2.5 rounded-[2px] transition",
                        levelClass(level),
                        active && "ring-1 ring-white/70 scale-125",
                      )}
                    />
                  );
                })}
              </div>
              <span>More</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
