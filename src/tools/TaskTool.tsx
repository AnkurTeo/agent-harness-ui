import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";

type TaskArgs = {
  subagent_type?: string;
  description?: string;
  prompt?: string;
};

type TaskResult = {
  summary?: string;
  sessionId?: string;
};

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  const hue = h % 360;
  return `hsl(${hue} 60% 55%)`;
}

export const TaskTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const taskArgs = (args ?? {}) as TaskArgs;
  const taskResult = result as TaskResult | string | null | undefined;
  const agent = taskArgs.subagent_type ?? "task";
  const description =
    taskArgs.description ?? taskArgs.prompt?.slice(0, 120) ?? "";
  const isRunning = status?.type === "running";

  const summary =
    typeof taskResult === "string"
      ? taskResult
      : taskResult && typeof taskResult === "object" && taskResult.summary
        ? taskResult.summary
        : "";

  const triggerLabel = `Task: ${agent}`;

  return (
    <ToolFallback.Root defaultOpen>
      <ToolFallback.Trigger toolName={triggerLabel} status={status} />
      <ToolFallback.Content>
        <div className="mx-4 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: hashColor(agent) }}
            />
            <span className="font-medium">{agent}</span>
            {isRunning && (
              <span className="text-muted-foreground">· running…</span>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          {!isRunning && summary && (
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px]">
              {summary}
            </pre>
          )}
        </div>
      </ToolFallback.Content>
    </ToolFallback.Root>
  );
};
