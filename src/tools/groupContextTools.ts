import type { PartState } from "@assistant-ui/core/react";

export type MessagePartGroup = {
  groupKey: string | undefined;
  indices: number[];
};

const CONTEXT_TOOLS = new Set(["read", "grep", "glob", "list"]);

function isContextTool(part: PartState | undefined): boolean {
  if (!part) return false;
  if (part.type !== "tool-call") return false;
  return CONTEXT_TOOLS.has(part.toolName);
}

export function groupContextTools(
  parts: readonly PartState[],
): MessagePartGroup[] {
  const groups: MessagePartGroup[] = [];
  let i = 0;
  while (i < parts.length) {
    if (isContextTool(parts[i])) {
      const start = i;
      const indices: number[] = [];
      while (i < parts.length && isContextTool(parts[i])) {
        indices.push(i);
        i++;
      }
      // Only collapse if 2+ adjacent context tools; single calls render normally.
      if (indices.length >= 2) {
        groups.push({ groupKey: `context-${start}`, indices });
      } else {
        groups.push({ groupKey: undefined, indices });
      }
      continue;
    }
    groups.push({ groupKey: undefined, indices: [i] });
    i++;
  }
  return groups;
}
