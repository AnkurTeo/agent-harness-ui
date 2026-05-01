import { useOpenCodePermissions } from "@assistant-ui/react-opencode";

export function PermissionPrompt() {
  const { pending, reply } = useOpenCodePermissions();

  if (!pending.length) return null;

  return (
    <div className="border-t bg-amber-50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
        Permission requested
      </div>
      <div className="space-y-2">
        {pending.map((req) => (
          <div
            key={req.id}
            className="flex flex-wrap items-center gap-2 rounded border border-amber-200 bg-white p-2 text-sm"
          >
            <p className="min-w-0 flex-1">
              Allow{" "}
              <code className="rounded bg-gray-100 px-1">
                {req.toolName ?? "tool"}
              </code>
              : {req.title ?? req.permission}?
            </p>
            <button
              type="button"
              className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
              onClick={() => reply(req.id, "once")}
            >
              Allow once
            </button>
            <button
              type="button"
              className="rounded bg-emerald-800 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-900"
              onClick={() => reply(req.id, "always")}
            >
              Always
            </button>
            <button
              type="button"
              className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
              onClick={() => reply(req.id, "reject")}
            >
              Reject
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
