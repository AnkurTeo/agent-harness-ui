import { OpencodeThread } from "./OpencodeThread";
import { PermissionPrompt } from "./PermissionPrompt";
import { QuestionPrompt } from "./QuestionPrompt";
import { SessionInfo } from "./SessionInfo";
import { ErrorBanner } from "./ErrorBanner";

export function Layout() {
  return (
    <div className="flex h-full flex-col">
      <SessionInfo />
      <div className="min-h-0 flex-1">
        <OpencodeThread />
      </div>
      <ErrorBanner />
      <QuestionPrompt />
      <PermissionPrompt />
    </div>
  );
}
