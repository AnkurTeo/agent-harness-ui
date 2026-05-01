import { useEffect, useState } from "react";

export type OpenCodeAgent = {
  name: string;
  description?: string;
  mode?: "primary" | "subagent";
  hidden?: boolean;
  native?: boolean;
};

type State =
  | { status: "loading"; agents: OpenCodeAgent[] }
  | { status: "loaded"; agents: OpenCodeAgent[] }
  | { status: "error"; agents: OpenCodeAgent[]; error: string };

const DEFAULT_BASE_URL = "http://127.0.0.1:4096";

/**
 * Fetches the server's agent registry once on mount and filters to
 * user-facing primary agents (build, plan, any custom `mode: "primary"`
 * entries the user has added). Subagents (`explore`, `general`) and internal
 * agents (`compaction`, `summary`, `title`) are hidden.
 */
export function useAgents(): State {
  const [state, setState] = useState<State>({ status: "loading", agents: [] });

  useEffect(() => {
    let cancelled = false;
    const baseUrl = import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL;
    void fetch(`${baseUrl}/agent`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`GET /agent ${r.status}`);
        const raw = (await r.json()) as OpenCodeAgent[];
        const primary = raw.filter(
          (a) => a.mode === "primary" && a.hidden !== true,
        );
        if (!cancelled) setState({ status: "loaded", agents: primary });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            status: "error",
            agents: [],
            error: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
