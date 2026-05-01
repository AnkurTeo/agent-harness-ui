import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AgentContextValue = {
  agent: string | undefined;
  setAgent: (name: string) => void;
};

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export function AgentProvider({
  initial,
  children,
}: {
  initial: string | undefined;
  children: ReactNode;
}) {
  const [agent, setAgent] = useState<string | undefined>(initial);
  const value = useMemo(() => ({ agent, setAgent }), [agent]);
  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used inside <AgentProvider>");
  return ctx;
}
