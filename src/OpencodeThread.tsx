import type { PropsWithChildren } from "react";
import { MessagePrimitive } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react-ui";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { ToolGroup } from "@/components/assistant-ui/tool-group";
import { Reasoning } from "@/components/assistant-ui/reasoning";
import { openCodeToolsByName, groupContextTools } from "./tools";

export function OpencodeThread() {
  return (
    <Thread
      components={{
        AssistantMessage: GroupedAssistantMessage,
      }}
    />
  );
}

function GroupedAssistantMessage() {
  return (
    <MessagePrimitive.Root>
      <MessagePrimitive.Unstable_PartsGrouped
        groupingFunction={groupContextTools}
        components={{
          Text: MarkdownText,
          Reasoning,
          tools: {
            by_name: openCodeToolsByName,
            Fallback: ToolFallback,
          },
          Group: ContextGroup,
        }}
      />
    </MessagePrimitive.Root>
  );
}

function ContextGroup({
  groupKey,
  indices,
  children,
}: PropsWithChildren<{
  groupKey: string | undefined;
  indices: number[];
}>) {
  if (!groupKey || !groupKey.startsWith("context-")) {
    return <>{children}</>;
  }
  return (
    <ToolGroup.Root variant="outline">
      <ToolGroup.Trigger count={indices.length} />
      <ToolGroup.Content>{children}</ToolGroup.Content>
    </ToolGroup.Root>
  );
}
