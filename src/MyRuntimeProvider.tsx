import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useOpenCodeRuntime } from "@assistant-ui/react-opencode";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AgentProvider, useAgent } from "./AgentContext";
import {
  ModelProvider,
  parseModelString,
  useModel,
  type ModelSelection,
} from "./ModelContext";

const DEFAULT_BASE_URL = "http://127.0.0.1:4096";

type ServerConfig = {
  default_agent?: string;
  model?: string;
  agent?: Record<string, { model?: string }>;
};

/**
 * One-shot fetch of /config. Returns undefined while loading; null on error.
 */
function useServerConfig(): ServerConfig | null | undefined {
  const [value, setValue] = useState<ServerConfig | null | undefined>(
    undefined,
  );
  useEffect(() => {
    let cancelled = false;
    const baseUrl = import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL;
    void fetch(`${baseUrl}/config`)
      .then(async (r) => (r.ok ? ((await r.json()) as ServerConfig) : null))
      .then((cfg) => {
        if (!cancelled) setValue(cfg);
      })
      .catch(() => {
        if (!cancelled) setValue(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return value;
}

/**
 * Resolve the default model for a given agent:
 *   1. config.agent[name].model (per-agent override)
 *   2. config.model (global default)
 *   3. undefined (caller will fall back to first provider/model if needed)
 */
function resolveAgentModel(
  cfg: ServerConfig | null | undefined,
  agentName: string | undefined,
): ModelSelection | undefined {
  if (!cfg || !agentName) return undefined;
  const perAgent = cfg.agent?.[agentName]?.model;
  const resolved = parseModelString(perAgent) ?? parseModelString(cfg.model);
  return resolved;
}

export function MyRuntimeProvider({ children }: { children: ReactNode }) {
  const cfg = useServerConfig();
  // Wait for the server-config probe to resolve before mounting the runtime.
  // This avoids a flash where the first prompt goes out with the wrong agent.
  if (cfg === undefined) return null;
  const initialAgent = cfg?.default_agent ?? "plan";
  const initialModel = resolveAgentModel(cfg, initialAgent);
  return (
    <AgentProvider initial={initialAgent}>
      <ModelProvider initial={initialModel}>
        <AgentModelSync cfg={cfg} />
        <RuntimeShell>{children}</RuntimeShell>
      </ModelProvider>
    </AgentProvider>
  );
}

/**
 * When the user flips the agent toggle, reset the model to that agent's
 * configured default (per-agent override, or global config.model). This
 * matches OpenCode's intent: per-agent model is "the default when this
 * agent is active." If the user subsequently picks a different model, that
 * stays in effect until they flip agents again.
 */
function AgentModelSync({ cfg }: { cfg: ServerConfig | null }) {
  const { agent } = useAgent();
  const { setModel } = useModel();
  const lastAgentRef = useRef<string | undefined>(agent);
  useEffect(() => {
    if (agent === lastAgentRef.current) return;
    lastAgentRef.current = agent;
    const next = resolveAgentModel(cfg, agent);
    if (next) setModel(next);
  }, [agent, cfg, setModel]);
  return null;
}

function RuntimeShell({ children }: { children: ReactNode }) {
  const { agent } = useAgent();
  const { model } = useModel();
  const runtime = useOpenCodeRuntime({
    baseUrl: import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL,
    defaultAgent: agent,
    defaultModel: model
      ? { providerID: model.providerID, modelID: model.modelID }
      : undefined,
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
