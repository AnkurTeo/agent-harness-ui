import { Thread } from "@assistant-ui/react-ui";
import { MarkdownText } from "./MarkdownText";
import { PermissionPrompt } from "./PermissionPrompt";
import { QuestionPrompt } from "./QuestionPrompt";
import { SessionInfo } from "./SessionInfo";

export function Layout() {
  return (
    <div className="flex h-full flex-col">
      <SessionInfo />
      <div className="min-h-0 flex-1">
        <Thread
          assistantMessage={{
            components: { Text: MarkdownText },
          }}
        />
      </div>
      <QuestionPrompt />
      <PermissionPrompt />
    </div>
  );
}
