import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { BotIcon } from "lucide-react";
import { OpenCodeTool } from "./OpenCodeTool";

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

  return (
    <OpenCodeTool
      icon={<BotIcon className="size-4" />}
      title="Task"
      subtitle={agent}
      args={description ? [description] : []}
      status={status}
      defaultOpen={Boolean(summary)}
      hideDetails={!summary && !isRunning}
    >
      <div className="space-y-2 p-3 text-sm">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: hashColor(agent) }}
          />
          <span className="font-medium">{agent}</span>
          {isRunning && <span className="text-muted-foreground">running...</span>}
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
        {!isRunning && summary && (
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6">
            {summary}
          </pre>
        )}
      </div>
    </OpenCodeTool>
  );
};
