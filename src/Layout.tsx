import { OpencodeThread } from "./OpencodeThread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { SessionInfo } from "./SessionInfo";
import { ThreadHeader } from "./ThreadHeader";

export function Layout() {
  return (
    <div className="grid h-full grid-cols-[260px_1fr] gap-0">
      <aside className="flex min-h-0 flex-col border-r">
        <div className="border-b p-3">
          <SessionInfo />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <ThreadList />
        </div>
      </aside>
      <main className="flex min-h-0 flex-col">
        <ThreadHeader />
        <div className="min-h-0 flex-1">
          <OpencodeThread />
        </div>
      </main>
    </div>
  );
}
