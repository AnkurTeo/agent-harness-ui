# Contributing

This repo provides reusable UI support for agentic harnesses. OpenCode is the
first supported harness, built on top of assistant-ui.

Keep contributions focused on renderer quality, documented customization, and
compatibility with public harness/runtime APIs.

## Local Setup

```bash
npm install
opencode serve
npm run dev
```

The app expects OpenCode at `http://127.0.0.1:4096` by default. Override it in
`.env` with `VITE_OPENCODE_URL`.

## Before Opening a PR

```bash
npm run typecheck
npm run build
```

For UI changes, include or update screenshots in `docs/assets/` and mention the
browser/session you used for verification.

## Scope

Good fits:

- Tool renderers that use projected `@assistant-ui/react-opencode` props.
- Markdown and theme polish.
- Component override hooks that keep the runtime untouched.
- Reusable agent-harness UI primitives that can work beyond OpenCode.
- Docs and runnable examples.

Avoid:

- Forking assistant-ui runtime internals.
- Depending on OpenCode metadata that the projection does not expose.
- Large app-specific product features that make the sample harder to reuse.

## Issues

Use bug reports for broken behavior, visual regressions, runtime integration
issues, or incorrect docs. Use feature requests for reusable agent-harness UI
improvements. For sensitive security reports, follow [SECURITY.md](SECURITY.md).
