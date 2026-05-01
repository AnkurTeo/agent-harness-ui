import { useOpenCodeSession } from "@assistant-ui/react-opencode";

export function SessionInfo() {
  const session = useOpenCodeSession();

  return (
    <div className="border-b bg-gray-50 p-2 text-xs text-gray-600">
      {session ? (
        <>
          <span className="font-semibold">Session:</span>{" "}
          <code className="rounded bg-white px-1 py-0.5">{session.id}</code>
        </>
      ) : (
        <span className="italic">No session yet — waiting for runtime...</span>
      )}
    </div>
  );
}
