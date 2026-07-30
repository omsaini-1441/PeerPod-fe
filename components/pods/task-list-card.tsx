"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskListCardProps {
  tasks: Task[];
  newTaskTitle: string;
  newTaskDescription: string;
  isMutating: boolean;
  onNewTaskTitleChange: (value: string) => void;
  onNewTaskDescriptionChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onStatusChange: (taskId: number, status: Task["status"]) => void;
}

const statusLabel = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  DONE: "Done",
} as const;

export function TaskListCard({
  tasks,
  newTaskTitle,
  newTaskDescription,
  isMutating,
  onNewTaskTitleChange,
  onNewTaskDescriptionChange,
  onSubmit,
  onStatusChange,
}: TaskListCardProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Tasks</CardTitle>
          <Badge>{tasks.length} linked</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-xl border border-[var(--border)] bg-black/20 p-4"
        >
          <Input
            value={newTaskTitle}
            onChange={(event) => onNewTaskTitleChange(event.target.value)}
            placeholder="Task that counts for this pod"
            required
          />
          <Textarea
            value={newTaskDescription}
            onChange={(event) => onNewTaskDescriptionChange(event.target.value)}
            placeholder="Optional details"
          />
          <Button type="submit" variant="secondary" disabled={isMutating}>
            Add task
          </Button>
        </form>

        {tasks.length === 0 ? (
          <EmptyState message="No pod-linked tasks yet." />
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {tasks.map((task) => (
                <motion.div
                  key={`${task.id}-${task.status}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-[var(--border)] bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{task.title}</p>
                      {task.description ? (
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {task.description}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant={task.status === "DONE" ? "accent" : "default"}>
                      {statusLabel[task.status]}
                    </Badge>
                  </div>

                  {task.status === "DONE" ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--muted)]">
                      <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                      Completed
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.status === "OPEN" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={isMutating}
                            onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
                          >
                            Start
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onStatusChange(task.id, "DONE")}
                          >
                            Complete
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onStatusChange(task.id, "DONE")}
                          >
                            Complete
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isMutating}
                            onClick={() => onStatusChange(task.id, "OPEN")}
                          >
                            Move back to open
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
