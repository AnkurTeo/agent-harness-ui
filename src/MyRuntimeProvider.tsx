import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useOpenCodeRuntime } from "@assistant-ui/react-opencode";
import { useEffect, useRef, type ReactNode } from "react";

const DEFAULT_BASE_URL = "http://127.0.0.1:4096";

export function MyRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useOpenCodeRuntime({
    baseUrl: import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL,
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
        console.error("[opencode-runtime] failed to create initial session:", err);
      }
    })();
  }, [runtime]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
