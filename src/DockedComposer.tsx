import { Composer } from "@assistant-ui/react-ui";
import { AgentToggle } from "./AgentToggle";
import { ErrorBanner } from "./ErrorBanner";
import { ModelToggle } from "./ModelToggle";
import { PermissionPrompt } from "./PermissionPrompt";
import { QuestionPrompt } from "./QuestionPrompt";

export function DockedComposer() {
  return (
    <div className="flex w-full flex-col gap-2">
      <ErrorBanner />
      <QuestionPrompt />
      <PermissionPrompt />
      <Composer />
      <div className="flex flex-wrap items-center justify-end gap-4 pb-1">
        <ModelToggle />
        <AgentToggle />
      </div>
    </div>
  );
}
