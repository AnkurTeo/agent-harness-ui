import { useOpenCodeSession } from "@assistant-ui/react-opencode";

/**
 * Shows the current session's title above the thread. Falls back to the
 * session id if the server hasn't titled the session yet (that's
 * auto-generated a few seconds after the first prompt via
 * session.summarize).
 */
export function ThreadHeader() {
  const session = useOpenCodeSession();
  if (!session) return null;
  const title = (session as { title?: string }).title?.trim();
  if (!title) return null;
  return (
    <div className="border-b px-6 py-3">
      <h1 className="truncate text-sm font-semibold" title={session.id}>
        {title}
      </h1>
    </div>
  );
}
