# Agent Harness Components

This sample layers agent-harness renderers over assistant-ui. The first runtime
target is OpenCode through `@assistant-ui/react-opencode`; these components only
control presentation.

## Thread

| Component | File | Notes |
| --- | --- | --- |
| `OpenCodeApp` | `src/opencode-ui.tsx` | Public app wrapper with theme and component overrides. |
| `Layout` | `src/Layout.tsx` | Sidebar + thread layout. |
| `OpencodeThread` | `src/OpencodeThread.tsx` | Uses `Unstable_PartsGrouped` to group tool parts and route renderers. |
| `DockedComposer` | `src/DockedComposer.tsx` | Composer with errors, questions, permissions, model and agent selectors. |
| `ThreadHeader` | `src/ThreadHeader.tsx` | Server-side session title above the thread. |
| `InterruptedMarker` | `src/InterruptedMarker.tsx` | Centered interrupted label for cancelled assistant messages. |
| `Reasoning` / `ReasoningGroup` | `src/components/assistant-ui/reasoning.tsx` | Collapsible `Thinking` bubble for reasoning parts. |

## Tools

| Tool | Renderer | UI |
| --- | --- | --- |
| `bash` | `BashTool` | Compact `Shell` row, command/output details, copy action. |
| `read`, `list`, `glob`, `grep` | `ExploreTools` | Compact `Explore` rows grouped as `Explored` / `Exploring`. |
| `webfetch` | `WebFetchTool` | URL-first web fetch row. |
| `websearch` | `WebSearchTool` | Query-first search row with text details. |
| `todowrite`, `todoread` | `TodosTool` | Checklist with status icons and completion count. |
| `edit`, `write`, `apply_patch` | `EditTool` | OpenCode-style edit row with existing diff viewer details. |
| `task` | `TaskTool` | Subagent row with compact result details. |
| unknown | `ToolFallback` | Compact fallback using the same visual language. |

All tool renderers build on `OpenCodeTool`, a small collapsible primitive in
`src/tools/OpenCodeTool.tsx`.

## Markdown

`src/components/assistant-ui/markdown-text.tsx` keeps the assistant-ui markdown
pipeline and GFM support, while `src/index.css` overrides scale and spacing:

- 14px body text.
- Compact headings.
- Minimal inline code styling.
- Bordered code blocks with hover copy action.
- Muted blockquotes, simple tables, and quiet dividers.

## Questions

`src/QuestionPrompt.tsx` renders OpenCode question requests as a stepper. A
single request can contain several questions; the UI shows numbered steps,
Back/Next navigation, and submits the full answer list only at the end.
