import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { DiffViewer } from "@/components/assistant-ui/diff-viewer";

type EditArgs = {
  filePath?: string;
  path?: string;
  file_path?: string;
  patch?: string;
};

type EditResult = {
  patch?: string;
  diff?: string;
  filePath?: string;
  path?: string;
};

function extractPatch(
  args: EditArgs,
  result: EditResult | string | null | undefined,
): string | undefined {
  if (typeof result === "string" && result.trim()) return result;
  if (result && typeof result === "object") {
    if (typeof result.patch === "string" && result.patch.trim()) return result.patch;
    if (typeof result.diff === "string" && result.diff.trim()) return result.diff;
  }
  if (typeof args.patch === "string" && args.patch.trim()) return args.patch;
  return undefined;
}

function extractFilePath(
  args: EditArgs,
  result: EditResult | string | null | undefined,
): string {
  if (result && typeof result === "object") {
    if (typeof result.filePath === "string") return result.filePath;
    if (typeof result.path === "string") return result.path;
  }
  return args.filePath ?? args.path ?? args.file_path ?? "file";
}

export const EditTool: ToolCallMessagePartComponent = ({
  toolName,
  args,
  result,
  status,
}) => {
  const editArgs = (args ?? {}) as EditArgs;
  const editResult = result as EditResult | string | null | undefined;

  const filePath = extractFilePath(editArgs, editResult);
  const patch = extractPatch(editArgs, editResult);
  const isRunning = status?.type === "running";

  const verb =
    toolName === "write"
      ? "Write"
      : toolName === "apply_patch"
        ? "Apply patch"
        : "Edit";
  const triggerLabel = `${verb}: ${filePath}`;

  return (
    <ToolFallback.Root defaultOpen>
      <ToolFallback.Trigger toolName={triggerLabel} status={status} />
      <ToolFallback.Content>
        <div className="mx-4">
          {patch ? (
            <DiffViewer patch={patch} viewMode="unified" showLineNumbers />
          ) : isRunning ? (
            <div className="text-xs text-muted-foreground">Applying edits…</div>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              No diff available.
            </div>
          )}
        </div>
      </ToolFallback.Content>
    </ToolFallback.Root>
  );
};
