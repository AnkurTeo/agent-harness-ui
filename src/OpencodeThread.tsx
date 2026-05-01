import type { PropsWithChildren } from "react";
import {
  AssistantActionBar,
  AssistantMessage,
  BranchPicker,
  Thread,
} from "@assistant-ui/react-ui";
import { MessagePrimitive } from "@assistant-ui/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { ToolGroup } from "@/components/assistant-ui/tool-group";
import { Reasoning } from "@/components/assistant-ui/reasoning";
import { openCodeToolsByName, groupContextTools } from "./tools";
import { DockedComposer } from "./DockedComposer";

export function OpencodeThread() {
  return (
    <TooltipProvider>
      <Thread
        components={{
          AssistantMessage: OpencodeAssistantMessage,
          Composer: DockedComposer,
        }}
      />
    </TooltipProvider>
  );
}

// Keep react-ui's chrome (Root wrapper, Avatar) and replace ONLY the inner
// parts renderer with Unstable_PartsGrouped so we can coalesce context tools
// and dispatch tool-calls through our by_name map.
function OpencodeAssistantMessage() {
  return (
    <AssistantMessage.Root>
      <AssistantMessage.Avatar />
      <div className="aui-assistant-message-content">
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
      </div>
      <BranchPicker />
      <AssistantActionBar />
    </AssistantMessage.Root>
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
