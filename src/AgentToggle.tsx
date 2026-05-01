import { useOpenCodeThreadState } from "@assistant-ui/react-opencode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgent } from "./AgentContext";
import { useAgents } from "./hooks/useAgents";

export function AgentToggle() {
  const { agents, status } = useAgents();
  const { agent, setAgent } = useAgent();
  const isRunning = useOpenCodeThreadState(
    (s) =>
      s.runState.type === "streaming" ||
      s.runState.type === "cancelling" ||
      s.runState.type === "reverting" ||
      s.sessionStatus?.type === "busy" ||
      s.sessionStatus?.type === "retry",
  );

  if (status === "loading" || agents.length === 0) return null;

  const currentAgent = agents.find((a) => a.name === agent);
  const valueText = currentAgent?.name ?? agent ?? "";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Agent</span>
      <Select
        value={valueText || undefined}
        onValueChange={(next) => setAgent(next)}
        disabled={isRunning}
      >
        <SelectTrigger className="h-7 w-36 text-xs capitalize">
          <SelectValue placeholder="Select agent" />
        </SelectTrigger>
        <SelectContent>
          {agents.map((a) => (
            <SelectItem key={a.name} value={a.name} className="capitalize">
              <div className="flex flex-col">
                <span>{a.name}</span>
                {a.description && (
                  <span className="text-muted-foreground text-[10px]">
                    {a.description.slice(0, 80)}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
