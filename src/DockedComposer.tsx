import { Composer } from "@assistant-ui/react-ui";
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
    </div>
  );
}
