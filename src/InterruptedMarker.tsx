import { useAuiState } from "@assistant-ui/store";

/**
 * Centered "Interrupted" label shown for assistant messages whose status
 * is `incomplete` with reason `cancelled`. Matches OpenCode's visual
 * treatment for a turn that was stopped mid-stream (e.g. the user hit
 * the cancel button or a provider returned early).
 */
export function InterruptedMarker() {
  const show = useAuiState((s) => {
    const msg = s.message;
    if (!msg || msg.role !== "assistant") return false;
    const status = msg.status as { type?: string; reason?: string } | undefined;
    return status?.type === "incomplete" && status.reason === "cancelled";
  });
  if (!show) return null;
  return (
    <div className="relative my-3 flex items-center">
      <div className="flex-1 border-t border-dashed border-border" />
      <span className="px-3 text-xs uppercase tracking-wide text-muted-foreground">
        Interrupted
      </span>
      <div className="flex-1 border-t border-dashed border-border" />
    </div>
  );
}
