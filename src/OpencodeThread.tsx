import {
  AssistantActionBar,
  AssistantMessage,
  BranchPicker,
  Thread,
} from "@assistant-ui/react-ui";
import { MessagePrimitive } from "@assistant-ui/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { Reasoning, ReasoningGroup } from "@/components/assistant-ui/reasoning";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { ToolGroup } from "@/components/assistant-ui/tool-group";
import { openCodeToolsByName, groupContextTools } from "./tools";
import { StepFinish, StepStart } from "./tools/StepBoundary";
import { DockedComposer } from "./DockedComposer";
import { InterruptedMarker } from "./InterruptedMarker";
import type {
  ContextGroupProps,
  OpenCodeComponentOverrides,
  OpenCodeUIConfig,
} from "./opencode-ui-config";

type OpencodeThreadProps = {
  components?: OpenCodeComponentOverrides;
  strings?: OpenCodeUIConfig["strings"];
};

export function OpencodeThread({ components, strings }: OpencodeThreadProps) {
  const Composer = components?.Composer ?? DockedComposer;
  const AssistantMessageComponent =
    components?.AssistantMessage ??
    function DefaultAssistantMessage() {
      return <OpencodeAssistantMessage components={components} />;
    };

  return (
    <TooltipProvider>
      <Thread
        strings={{
          ...strings,
          composer: {
            ...strings?.composer,
            input: {
              placeholder: "Ask anything...",
              ...strings?.composer?.input,
            },
          },
        }}
        components={{
          AssistantMessage: AssistantMessageComponent,
          Composer,
        }}
      />
    </TooltipProvider>
  );
}

// Keep react-ui's chrome (Root wrapper, Avatar) and replace ONLY the inner
// parts renderer with Unstable_PartsGrouped so we can coalesce context tools
// and dispatch tool-calls through our by_name map.
function OpencodeAssistantMessage({
  components,
}: {
  components?: OpenCodeComponentOverrides;
}) {
  const Text = components?.MarkdownText ?? MarkdownText;
  const ReasoningPart = components?.Reasoning ?? Reasoning;
  const Fallback = components?.ToolFallback ?? ToolFallback;
  const ContextGroupComponent = components?.ContextGroup ?? ContextGroup;
  const StepStartComponent = components?.StepStart ?? StepStart;
  const StepFinishComponent = components?.StepFinish ?? StepFinish;
  const toolsByName = {
    ...openCodeToolsByName,
    ...components?.tools,
  };

  return (
    <AssistantMessage.Root>
      <AssistantMessage.Avatar />
      <div className="aui-assistant-message-content">
        <MessagePrimitive.Unstable_PartsGrouped
          groupingFunction={groupContextTools}
          components={{
            Text,
            Reasoning: ReasoningPart,
            tools: {
              by_name: toolsByName,
              Fallback,
            },
            data: {
              by_name: {
                "opencode-step-start": StepStartComponent,
                "opencode-step-finish": StepFinishComponent,
              },
            },
            Group: ContextGroupComponent,
          }}
        />
      </div>
      <InterruptedMarker />
      <BranchPicker />
      <AssistantActionBar />
    </AssistantMessage.Root>
  );
}

function ContextGroup({
  groupKey,
  indices,
  children,
}: ContextGroupProps) {
  if (!groupKey || !groupKey.startsWith("context-")) {
    if (groupKey?.startsWith("reasoning-")) {
      const startIndex = indices[0] ?? 0;
      const endIndex = indices[indices.length - 1] ?? startIndex;
      return (
        <ReasoningGroup startIndex={startIndex} endIndex={endIndex}>
          {children}
        </ReasoningGroup>
      );
    }
    return <>{children}</>;
  }
  return (
    <ToolGroup.Root variant="outline">
      <ToolGroup.Trigger count={indices.length} />
      <ToolGroup.Content>{children}</ToolGroup.Content>
    </ToolGroup.Root>
  );
}
