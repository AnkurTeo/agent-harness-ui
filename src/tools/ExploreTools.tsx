import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import {
  ExternalLinkIcon,
  FileSearchIcon,
  FileTextIcon,
  FolderOpenIcon,
  GlobeIcon,
  SearchIcon,
} from "lucide-react";
import { OpenCodeTool, formatToolResult, stripAnsi } from "./OpenCodeTool";

type ToolArgs = Record<string, unknown>;

function asArgs(args: unknown): ToolArgs {
  return args && typeof args === "object" ? (args as ToolArgs) : {};
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function filename(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : path;
}

function dirname(path: string): string {
  const index = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return index >= 0 ? path.slice(0, index) : "";
}

function detail(result: unknown): string {
  return stripAnsi(formatToolResult(result)).trim();
}

function argsList(...values: Array<string | undefined>): string[] {
  return values.filter((value): value is string => Boolean(value));
}

function ResultBlock({
  children,
  mono = true,
}: {
  children: string;
  mono?: boolean;
}) {
  if (!children) return null;

  return (
    <pre
      className={
        mono
          ? "whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-6 text-foreground"
          : "whitespace-pre-wrap break-words p-3 text-sm leading-relaxed text-foreground"
      }
    >
      {children}
    </pre>
  );
}

export const ReadTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const data = asArgs(args);
  const path = text(data.filePath) || text(data.path);
  const offset = text(data.offset);
  const limit = text(data.limit);
  const output = detail(result);

  return (
    <OpenCodeTool
      icon={<FileTextIcon className="size-4" />}
      title="Explore"
      subtitle={path ? filename(path) : "Read file"}
      args={argsList(dirname(path), offset && `offset ${offset}`, limit && `limit ${limit}`)}
      status={status}
      hideDetails={!output}
    >
      <ResultBlock>{output}</ResultBlock>
    </OpenCodeTool>
  );
};

export const ListTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const data = asArgs(args);
  const path = text(data.path) || text(data.directory) || text(data.cwd);
  const ignore = text(data.ignore);
  const output = detail(result);

  return (
    <OpenCodeTool
      icon={<FolderOpenIcon className="size-4" />}
      title="Explore"
      subtitle={path || "List files"}
      args={argsList(ignore && `ignore ${ignore}`)}
      status={status}
      hideDetails={!output}
    >
      <ResultBlock>{output}</ResultBlock>
    </OpenCodeTool>
  );
};

export const GlobTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const data = asArgs(args);
  const pattern = text(data.pattern);
  const path = text(data.path) || text(data.cwd);
  const output = detail(result);

  return (
    <OpenCodeTool
      icon={<FileSearchIcon className="size-4" />}
      title="Explore"
      subtitle={pattern || "Glob"}
      args={argsList(path)}
      status={status}
      hideDetails={!output}
    >
      <ResultBlock>{output}</ResultBlock>
    </OpenCodeTool>
  );
};

export const GrepTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const data = asArgs(args);
  const pattern = text(data.pattern);
  const path = text(data.path) || text(data.cwd);
  const include = text(data.include);
  const output = detail(result);

  return (
    <OpenCodeTool
      icon={<SearchIcon className="size-4" />}
      title="Explore"
      subtitle={pattern || "Search"}
      args={argsList(path, include && `include ${include}`)}
      status={status}
      hideDetails={!output}
    >
      <ResultBlock>{output}</ResultBlock>
    </OpenCodeTool>
  );
};

export const WebFetchTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const data = asArgs(args);
  const url = text(data.url);
  const output = detail(result);

  return (
    <OpenCodeTool
      icon={<ExternalLinkIcon className="size-4" />}
      title="Webfetch"
      subtitle={url || "Fetch URL"}
      status={status}
      hideDetails={!output}
    >
      <ResultBlock mono={false}>{output}</ResultBlock>
    </OpenCodeTool>
  );
};

export const WebSearchTool: ToolCallMessagePartComponent = ({
  args,
  result,
  status,
}) => {
  const data = asArgs(args);
  const query = text(data.query) || text(data.q);
  const output = detail(result);

  return (
    <OpenCodeTool
      icon={<GlobeIcon className="size-4" />}
      title="Web Search"
      subtitle={query || "Search web"}
      status={status}
      hideDetails={!output}
      defaultOpen={Boolean(output)}
    >
      <ResultBlock mono={false}>{output}</ResultBlock>
    </OpenCodeTool>
  );
};
