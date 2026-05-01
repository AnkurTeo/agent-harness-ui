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
 *   3. undefined
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

/**
 * Remember the most-recently-active session id so a remount of the
 * runtime (see KeyedRuntimeShell) can continue the same conversation
 * instead of bootstrapping a fresh thread.
 */
function useActiveSessionRef() {
  return useRef<string | undefined>(undefined);
}

export function MyRuntimeProvider({ children }: { children: ReactNode }) {
  const cfg = useServerConfig();
  if (cfg === undefined) return null;
  const initialAgent = cfg?.default_agent ?? "plan";
  const initialModel = resolveAgentModel(cfg, initialAgent);
  return (
    <AgentProvider initial={initialAgent}>
      <ModelProvider initial={initialModel}>
        <AgentModelSync cfg={cfg} />
        <KeyedRuntimeShell>{children}</KeyedRuntimeShell>
      </ModelProvider>
    </AgentProvider>
  );
}

/**
 * Key the RuntimeShell by (agent, model) so a change to either value
 * forces a remount. Works around assistant-ui@0.12.28's
 * `useRemoteThreadListRuntime` stabilizing `options.runtimeHook` via
 * useCallback([]) — that freezes the closure `useOpenCodeRuntime`
 * provides (with defaultAgent / defaultModel) at mount and prevents
 * later updates from reaching the external-store adapter's `onNew`.
 * Remounting rebuilds the closure with the current values.
 *
 * We preserve the active conversation across remounts via
 * `activeSessionRef`, which is written whenever the runtime attaches
 * to a session and read as `initialSessionId` on remount so the new
 * runtime picks up the same thread instead of creating a new one.
 */
function KeyedRuntimeShell({ children }: { children: ReactNode }) {
  const { agent } = useAgent();
  const { model } = useModel();
  const activeSessionRef = useActiveSessionRef();
  const key = `${agent ?? "-"}::${model?.providerID ?? "-"}/${model?.modelID ?? "-"}`;
  return (
    <RuntimeShell key={key} activeSessionRef={activeSessionRef}>
      {children}
    </RuntimeShell>
  );
}

/**
 * When the user flips the agent toggle, reset the model to that agent's
 * configured default. Matches OpenCode's "per-agent model is the default
 * when this agent is active" semantic. A subsequent manual model pick
 * stays sticky until the next agent change.
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

function RuntimeShell({
  children,
  activeSessionRef,
}: {
  children: ReactNode;
  activeSessionRef: React.MutableRefObject<string | undefined>;
}) {
  const { agent } = useAgent();
  const { model } = useModel();
  const runtime = useOpenCodeRuntime({
    baseUrl: import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL,
    defaultAgent: agent,
    defaultModel: model
      ? { providerID: model.providerID, modelID: model.modelID }
      : undefined,
    initialSessionId: activeSessionRef.current,
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
        // If we're not resuming a prior session, create + initialize a new one.
        if (!activeSessionRef.current) {
          await runtime.threads.switchToNewThread();
          await runtime.threads.mainItem.initialize();
        }
      } catch (err) {
        console.error(
          "[opencode-runtime] failed to create initial session:",
          err,
        );
      }
    })();
  }, [runtime, activeSessionRef]);

  // Track the active session id so the next remount resumes it.
  useEffect(() => {
    const unsub = runtime.threads.subscribe(() => {
      const id = runtime.threads.mainItem.getState()?.remoteId;
      if (id) activeSessionRef.current = id;
    });
    return unsub;
  }, [runtime, activeSessionRef]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
