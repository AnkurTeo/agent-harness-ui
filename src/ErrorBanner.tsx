import { useOpenCodeThreadState } from "@assistant-ui/react-opencode";

export function ErrorBanner() {
  const runState = useOpenCodeThreadState((s) => s.runState);
  const sessionStatus = useOpenCodeThreadState((s) => s.sessionStatus);

  const isErrored = runState.type === "error";
  const isRetrying = sessionStatus?.type === "retry";

  if (!isErrored && !isRetrying) return null;

  const label = isErrored ? "Error:" : "Retrying:";
  const message = isErrored
    ? describeError(runState.error)
    : (sessionStatus as { type: "retry"; message: string }).message ||
      "Retrying…";

  return (
    <div className="border-t border-red-300 bg-red-50 p-3 text-sm text-red-900">
      <span className="font-semibold">{label}</span> {message}
    </div>
  );
}

function describeError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    if ("message" in err && typeof (err as { message: unknown }).message === "string") {
      return (err as { message: string }).message;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }
  return "Unknown error";
}
