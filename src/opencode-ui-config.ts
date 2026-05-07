import type {
  ComponentProps,
  ComponentType,
  CSSProperties,
  PropsWithChildren,
} from "react";
import type {
  DataMessagePartComponent,
  ReasoningMessagePartComponent,
  TextMessagePartComponent,
  ToolCallMessagePartComponent,
} from "@assistant-ui/react";
import type { Thread } from "@assistant-ui/react-ui";

export type ContextGroupProps = PropsWithChildren<{
  groupKey: string | undefined;
  indices: number[];
}>;

export type OpenCodeComponentOverrides = {
  AssistantMessage?: ComponentType;
  Composer?: ComponentType;
  ContextGroup?: ComponentType<ContextGroupProps>;
  MarkdownText?: TextMessagePartComponent;
  Reasoning?: ReasoningMessagePartComponent;
  SessionInfo?: ComponentType;
  StepFinish?: DataMessagePartComponent;
  StepStart?: DataMessagePartComponent;
  ThreadHeader?: ComponentType;
  ThreadList?: ComponentType;
  ToolFallback?: ToolCallMessagePartComponent;
  tools?: Record<string, ToolCallMessagePartComponent>;
};

export type OpenCodeThemeMode = "dark" | "light" | "system";

export type OpenCodeThemeVariables = Partial<
  Record<
    | "background"
    | "foreground"
    | "card"
    | "card-foreground"
    | "popover"
    | "popover-foreground"
    | "primary"
    | "primary-foreground"
    | "secondary"
    | "secondary-foreground"
    | "muted"
    | "muted-foreground"
    | "accent"
    | "accent-foreground"
    | "destructive"
    | "destructive-foreground"
    | "border"
    | "input"
    | "ring"
    | "oc-inline-code",
    string
  >
>;

export type OpenCodeThemeConfig = {
  className?: string;
  mode?: OpenCodeThemeMode;
  style?: CSSProperties;
  variables?: OpenCodeThemeVariables;
};

export type OpenCodeUIConfig = {
  components?: OpenCodeComponentOverrides;
  strings?: ComponentProps<typeof Thread>["strings"];
  theme?: OpenCodeThemeConfig;
};
