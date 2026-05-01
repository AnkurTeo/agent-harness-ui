import { useOpenCodeThreadState } from "@assistant-ui/react-opencode";

type MessageError = { name?: string; data?: { message?: string } } | string | null | undefined;

/**
 * Pull the last assistant message's error (if any) from thread state.
 * OpenCode writes provider/transport errors to `message.info.error` with
 * shape like `{ name: "...", data: { message: "..." } }`.
 */
function useLastAssistantError(): MessageError {
  return useOpenCodeThreadState((s) => {
    for (let i = s.messageOrder.length - 1; i >= 0; i--) {
      const m = s.messagesById[s.messageOrder[i]];
      const info = m?.info;
      if (!info || info.role !== "assistant") continue;
      return (info as { error?: MessageError }).error ?? null;
    }
    return null;
  });
}

export function ErrorBanner() {
  const runState = useOpenCodeThreadState((s) => s.runState);
  const sessionStatus = useOpenCodeThreadState((s) => s.sessionStatus);
  const lastMessageError = useLastAssistantError();

  const isErrored = runState.type === "error";
  const isRetrying = sessionStatus?.type === "retry";
  const hasMessageError =
    lastMessageError != null &&
    (typeof lastMessageError === "string" ||
      (typeof lastMessageError === "object" &&
        (("data" in lastMessageError && lastMessageError.data?.message) ||
          "name" in lastMessageError)));

  if (!isErrored && !isRetrying && !hasMessageError) return null;

  const label = isErrored || hasMessageError ? "Error:" : "Retrying:";
  const message = isErrored
    ? describeError(runState.error)
    : isRetrying
      ? (sessionStatus as { type: "retry"; message?: string }).message ??
        "Retrying…"
      : describeError(lastMessageError);

  return (
    <div className="border-t border-red-300 bg-red-50 p-3 text-sm text-red-900">
      <span className="font-semibold">{label}</span> {message}
    </div>
  );
}

function describeError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const obj = err as {
      message?: unknown;
      data?: { message?: unknown };
      name?: unknown;
    };
    if (obj.data?.message && typeof obj.data.message === "string") {
      return obj.data.message;
    }
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.name === "string") return obj.name;
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }
  return "Unknown error";
}
