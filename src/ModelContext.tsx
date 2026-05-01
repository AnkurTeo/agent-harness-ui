import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ModelSelection = { providerID: string; modelID: string };

type ModelContextValue = {
  model: ModelSelection | undefined;
  setModel: (next: ModelSelection) => void;
};

const ModelContext = createContext<ModelContextValue | undefined>(undefined);

export function ModelProvider({
  initial,
  children,
}: {
  initial: ModelSelection | undefined;
  children: ReactNode;
}) {
  const [model, setModel] = useState<ModelSelection | undefined>(initial);
  const value = useMemo(() => ({ model, setModel }), [model]);
  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used inside <ModelProvider>");
  return ctx;
}

/**
 * Parse "<providerID>/<modelID>" into a ModelSelection. Returns undefined
 * when the string is malformed. Matches OpenCode's config.model and
 * config.agent[name].model format.
 */
export function parseModelString(
  raw: string | undefined,
): ModelSelection | undefined {
  if (!raw) return undefined;
  const slash = raw.indexOf("/");
  if (slash <= 0 || slash === raw.length - 1) return undefined;
  return {
    providerID: raw.slice(0, slash),
    modelID: raw.slice(slash + 1),
  };
}
