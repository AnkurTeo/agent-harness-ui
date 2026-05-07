import { OpencodeThread } from "./OpencodeThread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { SessionInfo } from "./SessionInfo";
import { ThreadHeader } from "./ThreadHeader";
import { cn } from "@/lib/utils";
import type {
  OpenCodeComponentOverrides,
  OpenCodeThemeConfig,
  OpenCodeUIConfig,
} from "./opencode-ui-config";

type LayoutProps = {
  components?: OpenCodeComponentOverrides;
  strings?: OpenCodeUIConfig["strings"];
  theme?: OpenCodeThemeConfig;
};

export function Layout({ components, strings, theme }: LayoutProps) {
  const SidebarSessionInfo = components?.SessionInfo ?? SessionInfo;
  const SidebarThreadList = components?.ThreadList ?? ThreadList;
  const Header = components?.ThreadHeader ?? ThreadHeader;

  return (
    <div
      className={cn(
        "grid h-full grid-cols-[260px_1fr] gap-0 bg-background text-foreground",
        theme?.className,
      )}
      style={theme?.style}
    >
      <aside className="flex min-h-0 flex-col border-r">
        <div className="border-b p-3">
          <SidebarSessionInfo />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <SidebarThreadList />
        </div>
      </aside>
      <main className="flex min-h-0 flex-col">
        <Header />
        <div className="min-h-0 flex-1">
          <OpencodeThread components={components} strings={strings} />
        </div>
      </main>
    </div>
  );
}
