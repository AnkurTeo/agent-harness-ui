import { Composer } from "@assistant-ui/react-ui";
import { AgentToggle } from "./AgentToggle";
import { ErrorBanner } from "./ErrorBanner";
import { PermissionPrompt } from "./PermissionPrompt";
import { QuestionPrompt } from "./QuestionPrompt";

export function DockedComposer() {
  return (
    <div className="flex w-full flex-col gap-2">
      <ErrorBanner />
      <QuestionPrompt />
      <PermissionPrompt />
      <Composer />
      <div className="flex items-center justify-end gap-2 pb-1">
        <AgentToggle />
      </div>
    </div>
  );
}
