import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { FilePenIcon } from "lucide-react";
import { DiffViewer } from "@/components/assistant-ui/diff-viewer";
import { OpenCodeTool } from "./OpenCodeTool";

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

function filename(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : path;
}

function dirname(path: string): string {
  const index = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return index >= 0 ? path.slice(0, index) : "";
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
  return (
    <OpenCodeTool
      icon={<FilePenIcon className="size-4" />}
      title={verb}
      subtitle={filename(filePath)}
      args={[dirname(filePath)].filter(Boolean)}
      status={status}
      defaultOpen={Boolean(patch)}
      hideDetails={!patch && !isRunning}
      contentClassName="max-h-[28rem]"
    >
      <div className="p-3">
        {patch ? (
          <DiffViewer patch={patch} viewMode="unified" showLineNumbers />
        ) : isRunning ? (
          <div className="text-sm text-muted-foreground">Applying edits...</div>
        ) : (
          <div className="text-sm italic text-muted-foreground">
            No diff available.
          </div>
        )}
      </div>
    </OpenCodeTool>
  );
};
