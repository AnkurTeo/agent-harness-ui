# Customization

The sample keeps the assistant-ui OpenCode runtime intact. Customization happens
at the renderer layer through `OpenCodeApp`, so the same UI primitives can stay
portable as more agent harnesses are added.

## Theme

```tsx
import { OpenCodeApp } from "./opencode-ui";

export default function App() {
  return (
    <OpenCodeApp
      theme={{
        mode: "dark",
        variables: {
          background: "0 0% 7%",
          foreground: "0 0% 98%",
          "oc-inline-code": "291 93% 83%",
        },
      }}
    />
  );
}
```

Theme variables are plain CSS custom properties without the `--` prefix. Values
should be valid CSS color channels for `hsl(...)` tokens.

Common tokens:

| Token | Purpose |
| --- | --- |
| `background` / `foreground` | App surface and primary text. |
| `muted` / `muted-foreground` | Secondary panels and quiet labels. |
| `accent` / `accent-foreground` | Hover and selected states. |
| `border` | Layout and divider lines. |
| `oc-inline-code` | Markdown inline code color. |

## Component Overrides

```tsx
import { OpenCodeApp, BashTool } from "./opencode-ui";
import type { ToolCallMessagePartComponent } from "@assistant-ui/react";

const CustomShell: ToolCallMessagePartComponent = (props) => {
  return <BashTool {...props} />;
};

export default function App() {
  return (
    <OpenCodeApp
      components={{
        tools: {
          bash: CustomShell,
        },
      }}
      strings={{
        composer: {
          input: {
            placeholder: "Ask your coding agent...",
          },
        },
      }}
    />
  );
}
```

Supported override keys:

| Key | Replaces |
| --- | --- |
| `AssistantMessage` | Full assistant message shell. |
| `Composer` | Docked composer, prompts, and selectors area. |
| `ContextGroup` | Group wrapper for adjacent explore calls. |
| `MarkdownText` | Markdown renderer. |
| `Reasoning` | Individual reasoning part inside the Thinking bubble. |
| `SessionInfo` | Sidebar session label. |
| `ThreadHeader` | Main thread title bar. |
| `ThreadList` | Sidebar thread list. |
| `ToolFallback` | Unknown tool renderer. |
| `tools` | Per-tool renderers by OpenCode tool name. |

Tool renderers should depend only on projected props from
`@assistant-ui/react-opencode`: `toolName`, `args`, `argsText`, `result`,
`status`, and `toolCallId`.
