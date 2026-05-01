import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useOpenCodeRuntime } from "@assistant-ui/react-opencode";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

type RuntimeOptions = {
  baseUrl: string;
  defaultAgent: string | undefined;
  defaultModel: { providerID: string; modelID: string } | undefined;
  onError: (error: unknown) => void;
};

/**
 * Pass a STABLE options object to useOpenCodeRuntime and mutate its
 * defaultAgent / defaultModel fields in place on every render.
 *
 * assistant-ui@0.12.28's useRemoteThreadListRuntime stabilizes
 * options.runtimeHook via useCallback([]), which freezes the closure
 * inside useOpenCodeRuntime at the initial render — the fresh `onNew`
 * closure built on subsequent renders never reaches the external-store
 * adapter, so passing a new `{ defaultAgent: "build" }` object has no
 * effect on the wire.
 *
 * The mutable-ref trick works because the frozen `onNew` reads
 * `options.defaultAgent` at invocation time (when the user clicks Send),
 * not at closure creation time. Mutating the shared object's fields
 * surfaces the latest selection without remounting the runtime (which
 * was creating empty throwaway sessions on every toggle flip).
 */
function RuntimeShell({ children }: { children: ReactNode }) {
  const { agent } = useAgent();
  const { model } = useModel();

  const optionsRef = useRef<RuntimeOptions | null>(null);
  if (optionsRef.current === null) {
    optionsRef.current = {
      baseUrl: import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL,
      defaultAgent: agent,
      defaultModel: model
        ? { providerID: model.providerID, modelID: model.modelID }
        : undefined,
      onError: (error) => {
        console.error("[opencode-runtime] error:", error);
      },
    };
  }
  // Mutate fields so the runtime's frozen closure reads fresh values at
  // invocation time (send / reload / cancel).
  optionsRef.current.defaultAgent = agent;
  optionsRef.current.defaultModel = model
    ? { providerID: model.providerID, modelID: model.modelID }
    : undefined;

  // The runtime wants a stable argument; hand it the same object across
  // renders. useMemo([]) guarantees identity doesn't change.
  const stableOptions = useMemo(() => optionsRef.current!, []);
  const runtime = useOpenCodeRuntime(stableOptions);

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
