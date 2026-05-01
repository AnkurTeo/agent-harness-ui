import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useOpenCodeRuntime } from "@assistant-ui/react-opencode";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AgentProvider, useAgent } from "./AgentContext";

const DEFAULT_BASE_URL = "http://127.0.0.1:4096";

/**
 * Fetch the server's default agent from /config once on mount. Falls back to
 * "plan" if the request fails or the field is missing.
 */
function useServerDefaultAgent(): string | undefined {
  const [value, setValue] = useState<string | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    const baseUrl = import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL;
    void fetch(`${baseUrl}/config`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((cfg: { default_agent?: string } | null) => {
        if (cancelled) return;
        setValue(cfg?.default_agent ?? "plan");
      })
      .catch(() => {
        if (!cancelled) setValue("plan");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return value;
}

export function MyRuntimeProvider({ children }: { children: ReactNode }) {
  const initialAgent = useServerDefaultAgent();
  // Wait for the server-config probe to resolve before mounting the runtime.
  // This avoids a flash where the first prompt goes out with the wrong agent.
  if (initialAgent === undefined) return null;
  return (
    <AgentProvider initial={initialAgent}>
      <RuntimeShell>{children}</RuntimeShell>
    </AgentProvider>
  );
}

function RuntimeShell({ children }: { children: ReactNode }) {
  const { agent } = useAgent();
  const runtime = useOpenCodeRuntime({
    baseUrl: import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL,
    defaultAgent: agent,
    onError: (error) => {
      console.error("[opencode-runtime] error:", error);
    },
  });

  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      try {
        await runtime.threads.switchToNewThread();
        await runtime.threads.mainItem.initialize();
      } catch (err) {
        console.error(
          "[opencode-runtime] failed to create initial session:",
          err,
        );
      }
    })();
  }, [runtime]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
