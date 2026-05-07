import { useEffect, type ReactNode } from "react";
import { Layout } from "./Layout";
import { MyRuntimeProvider } from "./MyRuntimeProvider";
import type {
  OpenCodeThemeConfig,
  OpenCodeUIConfig,
} from "./opencode-ui-config";

export type {
  ContextGroupProps,
  OpenCodeComponentOverrides,
  OpenCodeThemeConfig,
  OpenCodeThemeMode,
  OpenCodeThemeVariables,
  OpenCodeUIConfig,
} from "./opencode-ui-config";

export function applyOpenCodeTheme(theme: OpenCodeThemeConfig = {}) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const mode = theme.mode ?? "dark";
  const resolvedMode =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;

  root.classList.toggle("dark", resolvedMode === "dark");
  root.style.colorScheme = resolvedMode;

  for (const [name, value] of Object.entries(theme.variables ?? {})) {
    if (value) root.style.setProperty(`--${name}`, value);
  }
}

function OpenCodeThemeRuntime({ theme }: { theme?: OpenCodeThemeConfig }) {
  useEffect(() => {
    applyOpenCodeTheme(theme);
  }, [theme]);

  return null;
}

export function OpenCodeApp({
  children,
  components,
  strings,
  theme,
}: OpenCodeUIConfig & { children?: ReactNode }) {
  return (
    <>
      <OpenCodeThemeRuntime theme={theme} />
      <MyRuntimeProvider>
        {children ?? (
          <Layout components={components} strings={strings} theme={theme} />
        )}
      </MyRuntimeProvider>
    </>
  );
}

export { AgentToggle } from "./AgentToggle";
export { DockedComposer } from "./DockedComposer";
export { ErrorBanner } from "./ErrorBanner";
export { InterruptedMarker } from "./InterruptedMarker";
export { Layout } from "./Layout";
export { MarkdownText } from "@/components/assistant-ui/markdown-text";
export { ModelToggle } from "./ModelToggle";
export { OpencodeThread } from "./OpencodeThread";
export { PermissionPrompt } from "./PermissionPrompt";
export { QuestionPrompt } from "./QuestionPrompt";
export {
  Reasoning,
  ReasoningContent,
  ReasoningFade,
  ReasoningGroup,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
export { SessionInfo } from "./SessionInfo";
export { ThreadHeader } from "./ThreadHeader";
export { ThreadList } from "@/components/assistant-ui/thread-list";
export { ToolFallback } from "@/components/assistant-ui/tool-fallback";
export { ToolGroup } from "@/components/assistant-ui/tool-group";
export * from "./tools";
