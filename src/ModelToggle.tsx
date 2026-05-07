import { useMemo } from "react";
import { useOpenCodeThreadState } from "@assistant-ui/react-opencode";
import {
  ModelSelector,
  type ModelOption,
} from "@/components/assistant-ui/model-selector";
import {
  SelectGroup,
  SelectLabel,
} from "@/components/assistant-ui/select";
import { useModel } from "./ModelContext";
import { useProviders } from "./hooks/useProviders";

export function ModelToggle() {
  const { providers, status } = useProviders();
  const { model, setModel } = useModel();

  const isRunning = useOpenCodeThreadState(
    (s) =>
      s.runState.type === "streaming" ||
      s.runState.type === "cancelling" ||
      s.runState.type === "reverting" ||
      s.sessionStatus?.type === "busy" ||
      s.sessionStatus?.type === "retry",
  );

  // Flatten all (provider, model) pairs into the option shape the selector
  // wants internally (id = "<providerID>/<modelID>"). The selector uses this
  // list to resolve the currently selected model's display name.
  const allOptions = useMemo<ModelOption[]>(() => {
    const out: ModelOption[] = [];
    for (const p of providers) {
      for (const m of p.models) {
        out.push({
          id: `${p.id}/${m.id}`,
          name: m.name,
          description: p.name,
        });
      }
    }
    return out;
  }, [providers]);

  if (status === "loading" || allOptions.length === 0) return null;

  const currentValue = model ? `${model.providerID}/${model.modelID}` : undefined;

  const onValueChange = (next: string) => {
    const slash = next.indexOf("/");
    if (slash <= 0) return;
    setModel({ providerID: next.slice(0, slash), modelID: next.slice(slash + 1) });
  };

  return (
    <div
      className={`flex items-center gap-2 text-xs ${isRunning ? "pointer-events-none opacity-50" : ""}`}
      aria-disabled={isRunning}
    >
      <span className="text-muted-foreground">Model</span>
      <ModelSelector.Root
        models={allOptions}
        value={currentValue}
        onValueChange={onValueChange}
      >
        <ModelSelector.Trigger
          variant="outline"
          size="sm"
          className="h-7 w-44 text-xs"
        />
        <ModelSelector.Content className="border-border bg-popover text-popover-foreground shadow-md">
          {providers.map((p) => (
            <SelectGroup key={p.id}>
              <SelectLabel className="text-muted-foreground px-3 py-1 text-[10px] uppercase tracking-wide">
                {p.name}
              </SelectLabel>
              {p.models.map((m) => (
                <ModelSelector.Item
                  key={`${p.id}/${m.id}`}
                  model={{ id: `${p.id}/${m.id}`, name: m.name }}
                  className="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                />
              ))}
            </SelectGroup>
          ))}
        </ModelSelector.Content>
      </ModelSelector.Root>
    </div>
  );
}
