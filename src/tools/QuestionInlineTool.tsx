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

// Legacy object shape (some code paths may emit this). Real OpenCode tool
// output is a natural-language string we parse below.
type QuestionResultObj = {
  answers?: Array<string[]>;
  rejected?: boolean;
};

// OpenCode's question tool returns a string like:
//   User has answered your questions: "Q text"="Answer", "Q2 text"="Unanswered", ...
// We extract the "…"="…" pairs and index them by question text.
function parseAnswerString(s: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /"((?:[^"\\]|\\.)*)"="((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const q = m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    const a = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    map.set(q, a);
  }
  return map;
}

type ParsedResult = {
  kind: "object" | "string" | "none";
  answersByIndex: Array<string[] | undefined>;
  rejected: boolean;
  raw?: string;
};

function parseResult(
  result: unknown,
  infos: QuestionInfoArg[],
): ParsedResult {
  if (result == null) {
    return { kind: "none", answersByIndex: [], rejected: false };
  }
  if (typeof result === "object") {
    const obj = result as QuestionResultObj;
    return {
      kind: "object",
      answersByIndex: obj.answers ?? [],
      rejected: obj.rejected === true,
    };
  }
  if (typeof result === "string") {
    const map = parseAnswerString(result);
    const answers: Array<string[] | undefined> = infos.map((info) => {
      const key = info.question ?? "";
      const a = map.get(key);
      if (a === undefined) return undefined;
      if (a === "Unanswered") return [];
      // Multi-select answers are comma-separated in the string.
      return a.split(", ").map((s) => s.trim()).filter(Boolean);
    });
    return {
      kind: "string",
      answersByIndex: answers,
      rejected: false,
      raw: result,
    };
  }
  return { kind: "none", answersByIndex: [], rejected: false };
}

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
  const infos = qArgs.questions ?? [];
  const parsed = parseResult(result, infos);

  const anyAnswered = parsed.answersByIndex.some((a) => a && a.length > 0);
  const triggerLabel = parsed.rejected
    ? "Question (skipped)"
    : anyAnswered
      ? "Question (answered)"
      : "Question";

  return (
    <ToolFallback.Root defaultOpen>
      <ToolFallback.Trigger toolName={triggerLabel} status={status} />
      <ToolFallback.Content>
        <div className="mx-4 space-y-3 text-sm">
          {infos.map((info, i) => {
            const ans = parsed.answersByIndex[i];
            return (
              <div key={i} className="space-y-1">
                {info.header && <p className="font-medium">{info.header}</p>}
                {info.question && (
                  <p className="text-muted-foreground">{info.question}</p>
                )}
                {parsed.rejected ? (
                  <p className="italic text-muted-foreground">(skipped)</p>
                ) : ans && ans.length > 0 ? (
                  <p className="font-medium">→ {ans.join(", ")}</p>
                ) : ans && ans.length === 0 ? (
                  <p className="italic text-muted-foreground">(unanswered)</p>
                ) : parsed.kind === "none" ? null : (
                  <p className="italic text-muted-foreground">
                    (answer not recorded)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </ToolFallback.Content>
    </ToolFallback.Root>
  );
};
