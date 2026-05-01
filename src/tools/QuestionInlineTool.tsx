import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";

type QuestionOption = { label: string; description?: string };
type QuestionInfoArg = {
  question?: string;
  header?: string;
  options?: QuestionOption[];
};
type QuestionArgs = {
  questions?: QuestionInfoArg[];
};

type QuestionResult = {
  answers?: Array<string[]>;
  rejected?: boolean;
};

export const QuestionInlineTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const statusType = status?.type;
  if (statusType === "running" || statusType === undefined) {
    // Pending questions render via the docked <QuestionPrompt />; skip inline.
    return null;
  }

  const qArgs = (args ?? {}) as QuestionArgs;
  const qResult = (result ?? {}) as QuestionResult;
  const infos = qArgs.questions ?? [];
  const answers = qResult.answers ?? [];
  const rejected = qResult.rejected === true;

  const triggerLabel = rejected
    ? "Question (skipped)"
    : "Question (answered)";

  return (
    <ToolFallback.Root defaultOpen>
      <ToolFallback.Trigger toolName={triggerLabel} status={status} />
      <ToolFallback.Content>
        <div className="mx-4 space-y-3 text-sm">
          {infos.map((info, i) => (
            <div key={i} className="space-y-1">
              {info.header && (
                <p className="font-medium">{info.header}</p>
              )}
              {info.question && (
                <p className="text-muted-foreground">{info.question}</p>
              )}
              {!rejected && answers[i]?.length ? (
                <p>→ {answers[i].join(", ")}</p>
              ) : rejected ? (
                <p className="italic text-muted-foreground">(skipped)</p>
              ) : null}
            </div>
          ))}
        </div>
      </ToolFallback.Content>
    </ToolFallback.Root>
  );
};
