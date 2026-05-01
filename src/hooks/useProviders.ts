import { useEffect, useState } from "react";

export type ProviderModel = {
  id: string; // modelID (e.g., "big-pickle")
  name: string;
};

export type ProviderInfo = {
  id: string; // providerID (e.g., "opencode-zen")
  name: string;
  models: ProviderModel[];
};

export type ProvidersState =
  | { status: "loading"; providers: ProviderInfo[]; defaultMap: Record<string, string> }
  | { status: "loaded"; providers: ProviderInfo[]; defaultMap: Record<string, string> }
  | {
      status: "error";
      providers: ProviderInfo[];
      defaultMap: Record<string, string>;
      error: string;
    };

const DEFAULT_BASE_URL = "http://127.0.0.1:4096";

/**
 * Fetches /config/providers once on mount. Returns each provider with its
 * list of models sorted alphabetically, plus the server's default model
 * per provider (e.g. { "opencode-zen": "big-pickle" }).
 */
export function useProviders(): ProvidersState {
  const [state, setState] = useState<ProvidersState>({
    status: "loading",
    providers: [],
    defaultMap: {},
  });

  useEffect(() => {
    let cancelled = false;
    const baseUrl = import.meta.env.VITE_OPENCODE_URL ?? DEFAULT_BASE_URL;
    void fetch(`${baseUrl}/config/providers`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`GET /config/providers ${r.status}`);
        return (await r.json()) as {
          providers: Array<{
            id: string;
            name?: string;
            models?: Record<string, { name?: string }>;
          }>;
          default?: Record<string, string>;
        };
      })
      .then((raw) => {
        if (cancelled) return;
        const providers: ProviderInfo[] = (raw.providers ?? []).map((p) => ({
          id: p.id,
          name: p.name ?? p.id,
          models: Object.entries(p.models ?? {})
            .map(([id, m]) => ({ id, name: m.name ?? id }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));
        setState({
          status: "loaded",
          providers,
          defaultMap: raw.default ?? {},
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          status: "error",
          providers: [],
          defaultMap: {},
          error: err instanceof Error ? err.message : String(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
