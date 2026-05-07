import { useState } from "react";
import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { CheckIcon, CopyIcon, TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { OpenCodeTool, formatToolResult, stripAnsi } from "./OpenCodeTool";

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
  const output = stripAnsi(formatToolResult(result));

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

  const isRunning = status?.type === "running";

  return (
    <OpenCodeTool
      icon={<TerminalIcon className="size-4" />}
      title="Shell"
      subtitle={description || command || undefined}
      status={status}
      defaultOpen={Boolean(output)}
      hideDetails={!command && !output && !isRunning}
    >
      <div className="relative">
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded px-2 py-1",
            "bg-background/80 text-[11px] text-muted-foreground opacity-0 shadow-sm",
            "transition hover:bg-accent hover:text-accent-foreground group-hover/oc-tool:opacity-100",
          )}
          aria-label={copied ? "Copied" : "Copy command and output"}
        >
          {copied ? (
            <CheckIcon className="size-3" />
          ) : (
            <CopyIcon className="size-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
        <div className="border-b border-border/60 px-3 py-2 pr-20">
          <code className="whitespace-pre-wrap break-words font-mono text-[13px] text-muted-foreground">
            $ {command || "..."}
          </code>
        </div>
        {output ? (
          <pre className="whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-6 text-foreground">
            {output}
          </pre>
        ) : isRunning ? (
          <div className="p-3 text-sm text-muted-foreground">Running...</div>
        ) : (
          <div className="p-3 text-sm italic text-muted-foreground">
            No output
          </div>
        )}
      </div>
    </OpenCodeTool>
  );
};
