import { useOpenCodeSession } from "@assistant-ui/react-opencode";

export function SessionInfo() {
  const session = useOpenCodeSession();

  if (!session) {
    return (
      <div className="text-xs italic text-muted-foreground">
        Waiting for runtime…
      </div>
    );
  }

  const title = (session as { title?: string }).title || session.id;
  return (
    <div className="text-xs text-muted-foreground">
      <span className="font-semibold">Session:</span>{" "}
      <code className="rounded bg-muted px-1 py-0.5 text-foreground" title={session.id}>
        {title}
      </code>
    </div>
  );
}
