import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgent } from "./AgentContext";
import { useAgents } from "./hooks/useAgents";

/**
 * Agent picker for the composer footer.
 *
 * We deliberately do NOT disable during streaming — the selected agent is
 * applied to the *next* prompt_async call, not the in-flight one, so the
 * user should be free to flip anytime (e.g. click Build while Plan is
 * mid-response, then send their follow-up on Build). Disabling the toggle
 * blocks the exact UX the dropdown exists for.
 */
export function AgentToggle() {
  const { agents, status } = useAgents();
  const { agent, setAgent } = useAgent();

  if (status === "loading" || agents.length === 0) return null;

  const currentAgent = agents.find((a) => a.name === agent);
  const valueText = currentAgent?.name ?? agent ?? "";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Agent</span>
      <Select
        value={valueText || undefined}
        onValueChange={(next) => setAgent(next)}
      >
        <SelectTrigger className="h-7 w-28 text-xs capitalize">
          <SelectValue placeholder="Select agent">
            <span className="capitalize">{valueText}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="border-border bg-popover text-popover-foreground shadow-md">
          {agents.map((a) => (
            <SelectItem
              key={a.name}
              value={a.name}
              className="capitalize data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
