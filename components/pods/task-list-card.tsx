import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, CircleDashed, ListTodo, TimerReset } from "lucide-react";
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

const statusMeta = {
  OPEN: { label: "OPEN", icon: CircleDashed },
  IN_PROGRESS: { label: "IN PROGRESS", icon: TimerReset },
  DONE: { label: "DONE", icon: CheckCheck },
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
        <div className="flex items-end justify-between gap-4">
          <div>
            <Badge>
              <ListTodo className="h-3.5 w-3.5" />
              Task flow
            </Badge>
            <CardTitle className="mt-3">What you ship</CardTitle>
          </div>
          <Badge variant="glow">{tasks.length} linked tasks</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <form onSubmit={onSubmit} className="space-y-3 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4">
          <Input
            value={newTaskTitle}
            onChange={(event) => onNewTaskTitleChange(event.target.value)}
            placeholder="Add a task that counts toward this pod"
            required
          />
          <Textarea
            value={newTaskDescription}
            onChange={(event) => onNewTaskDescriptionChange(event.target.value)}
            placeholder="Optional details"
          />
          <Button type="submit" variant="accent" disabled={isMutating}>
            Add task
          </Button>
        </form>

        {tasks.length === 0 ? (
          <EmptyState message="No pod-linked tasks yet." />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {tasks.map((task) => {
                const TaskIcon = statusMeta[task.status].icon;

                return (
                  <motion.div
                    key={`${task.id}-${task.status}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-[1.75rem] border border-white/8 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        {task.description ? (
                          <p className="mt-1 text-sm text-slate-400">{task.description}</p>
                        ) : null}
                      </div>
                      <Badge variant={task.status === "DONE" ? "accent" : "default"}>
                        <TaskIcon className="h-3.5 w-3.5" />
                        {statusMeta[task.status].label}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["OPEN", "IN_PROGRESS", "DONE"] as const).map((status) => (
                        <Button
                          key={status}
                          type="button"
                          size="sm"
                          variant={task.status === status ? "default" : "secondary"}
                          disabled={task.status === status || isMutating}
                          onClick={() => onStatusChange(task.id, status)}
                        >
                          {status.replace("_", " ")}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
