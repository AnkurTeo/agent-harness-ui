import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";

/**
 * OpenCode's plan_exit server-side tool asks the user a Yes/No question
 * through the question.asked event, then either switches the session's
 * active agent to `build` (on "Yes") or rejects (on "No"). The inline
 * renderer shows the resolved state once the tool call has completed.
 *
 * The tool's `result` is a string:
 *   - "User approved switching to build agent. Wait for further instructions."
 *   - (error text) when the user answered "No" (Question.RejectedError)
 */

function summarizeResult(
  result: unknown,
): { approved: boolean; message: string } {
  if (typeof result === "string") {
    const lower = result.toLowerCase();
    if (lower.includes("approved") && lower.includes("build")) {
      return { approved: true, message: result };
    }
    if (lower.includes("rejected") || lower.includes("declined")) {
      return { approved: false, message: result };
    }
    return { approved: false, message: result };
  }
  return { approved: false, message: "Plan exit declined." };
}

export const PlanExitTool: ToolCallMessagePartComponent = ({
  status,
  result,
}) => {
  const statusType = status?.type;
  if (statusType === "running" || statusType === undefined) {
    // Pending plan_exit question is rendered by the docked <QuestionPrompt/>.
    return null;
  }

  const isCancelled =
    statusType === "incomplete" && status.reason === "cancelled";
  const isError = statusType === "incomplete" && !isCancelled;

  let heading: string;
  let body: string | null = null;

  if (isCancelled) {
    heading = "Plan exit cancelled";
  } else if (isError) {
    heading = "Stayed in plan mode";
    body =
      typeof result === "string"
        ? result
        : "User declined to switch to the build agent.";
  } else {
    const { approved, message } = summarizeResult(result);
    heading = approved ? "Switched to build agent" : "Stayed in plan mode";
    body = message;
  }

  return (
    <ToolFallback.Root defaultOpen={false}>
      <ToolFallback.Trigger toolName={heading} status={status} />
      {body && (
        <ToolFallback.Content>
          <div className="mx-4 text-xs text-muted-foreground">{body}</div>
        </ToolFallback.Content>
      )}
    </ToolFallback.Root>
  );
};
