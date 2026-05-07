import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import {
  CheckIcon,
  CircleDashedIcon,
  CircleIcon,
  ListTodoIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OpenCodeTool } from "./OpenCodeTool";

type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";
type TodoItem = {
  content: string;
  status: TodoStatus;
  priority?: "high" | "medium" | "low";
};

type TodoWriteArgs = { todos?: TodoItem[] };

/**
 * Extract the todo list from a tool part. Both `todowrite` and `todoread`
 * expose the array either on args (todowrite's input) or on the result
 * (todoread's output — a JSON string). Returns [] if neither path yields
 * a usable array.
 */
function extractTodos(args: unknown, result: unknown): TodoItem[] {
  if (args && typeof args === "object" && Array.isArray((args as TodoWriteArgs).todos)) {
    return (args as TodoWriteArgs).todos as TodoItem[];
  }
  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) return parsed as TodoItem[];
      if (parsed && Array.isArray(parsed.todos)) return parsed.todos as TodoItem[];
    } catch {
      // fallthrough
    }
  }
  if (result && typeof result === "object" && Array.isArray((result as TodoWriteArgs).todos)) {
    return (result as TodoWriteArgs).todos as TodoItem[];
  }
  return [];
}

function StatusIcon({ status }: { status: TodoStatus }) {
  if (status === "completed") return <CheckIcon className="size-3.5 text-emerald-600" />;
  if (status === "in_progress") return <CircleDashedIcon className="size-3.5 animate-spin text-sky-600" />;
  if (status === "cancelled") return <XIcon className="size-3.5 text-muted-foreground" />;
  return <CircleIcon className="size-3.5 text-muted-foreground" />;
}

export const TodosTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const todos = extractTodos(args, result);
  const total = todos.length;
  const completed = todos.filter((t) => t.status === "completed").length;
  const header =
    total === 0 ? "Todos" : `${completed} of ${total} todos completed`;

  return (
    <OpenCodeTool
      icon={<ListTodoIcon className="size-4" />}
      title="Todos"
      subtitle={total === 0 ? undefined : header}
      status={status}
      defaultOpen
      hideDetails={todos.length === 0}
    >
      <div className="p-3">
        {todos.length === 0 ? (
          <div className="text-xs italic text-muted-foreground">
            (empty list)
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {todos.map((t, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2",
                  t.status === "completed" &&
                    "line-through text-muted-foreground",
                  t.status === "cancelled" &&
                    "line-through text-muted-foreground opacity-70",
                )}
              >
                <span className="mt-0.5 shrink-0">
                  <StatusIcon status={t.status} />
                </span>
                <span className="min-w-0 break-words">{t.content}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </OpenCodeTool>
  );
};
