import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { ToolCallMessagePartStatus } from "@assistant-ui/react";
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  LoaderIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type OpenCodeToolProps = {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  args?: string[];
  status?: ToolCallMessagePartStatus;
  children?: ReactNode;
  defaultOpen?: boolean;
  hideDetails?: boolean;
  className?: string;
  contentClassName?: string;
};

function statusKind(status: ToolCallMessagePartStatus | undefined) {
  if (!status) return "complete";
  if (status.type === "running") return "running";
  if (status.type === "requires-action") return "requires-action";
  if (status.type === "incomplete" && status.reason === "cancelled") {
    return "cancelled";
  }
  if (status.type === "incomplete") return "error";
  return "complete";
}

export function OpenCodeTool({
  icon,
  title,
  subtitle,
  args = [],
  status,
  children,
  defaultOpen = false,
  hideDetails = false,
  className,
  contentClassName,
}: OpenCodeToolProps) {
  const hasDetails = Boolean(children) && !hideDetails;
  const [open, setOpen] = useState(defaultOpen && hasDetails);
  const kind = statusKind(status);
  const isRunning = kind === "running" || kind === "requires-action";
  const isError = kind === "error";
  const isCancelled = kind === "cancelled";

  useEffect(() => {
    if (defaultOpen && hasDetails && !isRunning) {
      setOpen(true);
    }
  }, [defaultOpen, hasDetails, isRunning]);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!hasDetails || isRunning) return;
      setOpen(next);
    },
    [hasDetails, isRunning],
  );

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        "oc-tool group/oc-tool w-full",
        isError && "oc-tool-error",
        isCancelled && "oc-tool-cancelled",
        className,
      )}
      data-state={open ? "open" : "closed"}
      data-status={kind}
    >
      <CollapsibleTrigger
        type="button"
        disabled={!hasDetails || isRunning}
        className={cn(
          "oc-tool-trigger flex h-8 w-full select-none items-center gap-2 rounded-md px-0 text-left text-sm outline-none",
          "text-muted-foreground transition-colors hover:text-foreground focus-visible:bg-muted/50",
          hasDetails && !isRunning && "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "oc-tool-icon flex size-4 shrink-0 items-center justify-center text-muted-foreground",
            isRunning && "text-foreground",
            isError && "text-red-400",
          )}
        >
          {isRunning ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : isError ? (
            <AlertCircleIcon className="size-4" />
          ) : isCancelled ? (
            <CheckIcon className="size-4 opacity-40" />
          ) : (
            icon
          )}
        </span>
        <span className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden">
          <span
            className={cn(
              "oc-tool-title shrink-0 font-medium text-foreground",
              isCancelled && "line-through text-muted-foreground",
            )}
          >
            {title}
          </span>
          {subtitle ? (
            <span className="oc-tool-subtitle min-w-0 truncate text-muted-foreground">
              {subtitle}
            </span>
          ) : null}
          {args.map((arg) => (
            <span
              key={arg}
              className="oc-tool-arg min-w-0 truncate text-muted-foreground"
            >
              {arg}
            </span>
          ))}
        </span>
        {hasDetails ? (
          <ChevronDownIcon
            className={cn(
              "oc-tool-chevron size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover/oc-tool:opacity-100",
              open ? "rotate-0 opacity-100" : "-rotate-90",
            )}
          />
        ) : null}
      </CollapsibleTrigger>
      {hasDetails ? (
        <CollapsibleContent className="oc-tool-content overflow-hidden">
          <div
            className={cn(
              "mt-1 max-h-60 overflow-auto rounded-md border border-border/70",
              "bg-background/70 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              contentClassName,
            )}
          >
            {children}
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  );
}

export function formatToolResult(result: unknown): string {
  if (typeof result === "string") return result;
  if (result == null) return "";
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
}

export function stripAnsi(value: string): string {
  return value.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g,
    "",
  );
}
