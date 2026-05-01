# assistant-ui + OpenCode — barebones integration sample

Smallest working POC that drives a local `opencode serve` instance with the
[`@assistant-ui/react-opencode`](https://www.assistant-ui.com/docs/runtimes/opencode/overview)
runtime. No server, no framework boilerplate — pure Vite SPA talking directly
to `http://127.0.0.1:4096`.

Spec: `docs/superpowers/specs/2026-05-01-opencode-assistant-ui-barebones-design.md`

## What's wired up

All four critical hooks from the runtime docs:

| Hook | Component | Purpose |
| --- | --- | --- |
| `useOpenCodeRuntime` | `src/MyRuntimeProvider.tsx` | Creates the runtime + `AssistantRuntimeProvider`. |
| `useOpenCodeSession` | `src/SessionInfo.tsx` | Shows the live session id (debug aid). |
| `useOpenCodePermissions` | `src/PermissionPrompt.tsx` | Approve/reject tool permission requests. |
| `useOpenCodeQuestions` + `useOpenCodeRuntimeExtras` | `src/QuestionPrompt.tsx` | Answer or skip agent-asked questions. |

Chat UI is the prebuilt `Thread` from `@assistant-ui/react-ui`.

## Run it

Two terminals.

```bash
# terminal 1 — OpenCode server
opencode serve
# → listens on http://127.0.0.1:4096

# terminal 2 — Vite dev server
cd /Users/ankurteotia/Desktop/assistant-ui-opencode-sample
npm install
npm run dev
# → opens http://localhost:5173
```

Type a message in the composer. Confirm a reply streams in, the session id
appears in the top strip, and any tool call surfaces a permission prompt at
the bottom.

### Custom OpenCode URL

Copy `.env.example` → `.env` and set `VITE_OPENCODE_URL=http://host:port`.
Default is `http://127.0.0.1:4096`.

## Versions

`@assistant-ui/react-opencode` is **v0.0.3 and marked experimental** — the
API may change without notice. `package.json` pins the exact version so this
POC doesn't drift.

| Package | Version |
| --- | --- |
| `@assistant-ui/react` | `^0.12.26` |
| `@assistant-ui/react-ui` | `^0.2.1` |
| `@assistant-ui/react-opencode` | `0.0.3` (pinned) |
| `@opencode-ai/sdk` | `^1.14.20` |

## Troubleshooting

### CORS rejection (Chrome console shows blocked preflight / SSE)

`opencode serve` needs to accept cross-origin requests from
`http://localhost:5173`. If the default config rejects them, add a Vite dev
proxy:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/opencode": {
        target: "http://127.0.0.1:4096",
        changeOrigin: true,
        ws: true,
        rewrite: (p) => p.replace(/^\/opencode/, ""),
      },
    },
  },
});
```

Then set `VITE_OPENCODE_URL=/opencode` in `.env` so the runtime hits
same-origin and the proxy forwards.

### "No session yet" never goes away

The SSE stream didn't attach. Check the browser Network tab for a failing
request to `/event` or `/session` on port 4096. Most common cause is the
OpenCode server isn't actually listening on `127.0.0.1:4096` — try
`curl http://127.0.0.1:4096/config` in a third terminal.

### Permission prompt never appears, tool call hangs

The permission prompt only shows tools that require approval. If you're
testing with a prompt that OpenCode auto-approves, you won't see the UI —
that's correct behavior. Force it with a write-like prompt (e.g. "create a
file named hello.txt with body world").

### `Thread` renders unstyled

Tailwind isn't picking up the react-ui classes. Verify
`tailwind.config.ts`'s `content` array includes
`./node_modules/@assistant-ui/react-ui/dist/**/*.{js,mjs}`.

## File layout

```
src/
  main.tsx               React root
  App.tsx                <MyRuntimeProvider><Layout/></MyRuntimeProvider>
  MyRuntimeProvider.tsx  useOpenCodeRuntime + AssistantRuntimeProvider
  Layout.tsx             SessionInfo / Thread / QuestionPrompt / PermissionPrompt
  PermissionPrompt.tsx   useOpenCodePermissions
  QuestionPrompt.tsx     useOpenCodeQuestions + useOpenCodeRuntimeExtras
  SessionInfo.tsx        useOpenCodeSession
  index.css              Tailwind + assistant-ui styles
```

## References

- Overview: https://www.assistant-ui.com/docs/runtimes/opencode/overview
- Quickstart: https://www.assistant-ui.com/docs/runtimes/opencode/quickstart
- Hooks: https://www.assistant-ui.com/docs/runtimes/opencode/hooks
