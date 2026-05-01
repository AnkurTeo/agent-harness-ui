import { useState } from "react";
import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { cn } from "@/lib/utils";

type BashArgs = {
  command?: string;
  description?: string;
};

export const BashTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const bashArgs = (args ?? {}) as BashArgs;
  const command = bashArgs.command ?? "";
  const description = bashArgs.description ?? "";
  const output =
    typeof result === "string"
      ? result
      : result != null
        ? JSON.stringify(result, null, 2)
        : "";

  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    const text = output ? `$ ${command}\n\n${output}` : `$ ${command}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  const triggerLabel = description ? `Shell: ${description}` : "Shell";
  const isRunning = status?.type === "running";

  return (
    <ToolFallback.Root defaultOpen>
      <ToolFallback.Trigger toolName={triggerLabel} status={status} />
      <ToolFallback.Content>
        <div className="mx-4 rounded-md border bg-muted/40 p-3 text-xs">
          <div className="mb-2 flex items-center justify-between gap-2">
            <code className="truncate font-mono text-muted-foreground">
              $ {command || "…"}
            </code>
            {output && (
              <button
                type="button"
                onClick={onCopy}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded px-2 py-1",
                  "text-[11px] text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                aria-label={copied ? "Copied" : "Copy command and output"}
              >
                {copied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          {output ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs">
              {output}
            </pre>
          ) : isRunning ? (
            <div className="text-muted-foreground">Running…</div>
          ) : (
            <div className="text-muted-foreground italic">No output</div>
          )}
        </div>
      </ToolFallback.Content>
    </ToolFallback.Root>
  );
};
