import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useOpenCodeRuntime } from "@assistant-ui/react-opencode";
import type { ReactNode } from "react";

const DEFAULT_BASE_URL = "http://127.0.0.1:4096";

export function MyRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useOpenCodeRuntime({
    baseUrl: import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL,
    onError: (error) => {
      console.error("[opencode-runtime] error:", error);
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
