import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { BashTool } from "./BashTool";
import { EditTool } from "./EditTool";
import { TaskTool } from "./TaskTool";
import { QuestionInlineTool } from "./QuestionInlineTool";
import { PlanExitTool } from "./PlanExitTool";
import { TodosTool } from "./TodosTool";
import {
  GlobTool,
  GrepTool,
  ListTool,
  ReadTool,
  WebFetchTool,
  WebSearchTool,
} from "./ExploreTools";

export const openCodeToolsByName: Record<string, ToolCallMessagePartComponent> = {
  bash: BashTool,
  edit: EditTool,
  write: EditTool,
  apply_patch: EditTool,
  task: TaskTool,
  question: QuestionInlineTool,
  plan_exit: PlanExitTool,
  plan_enter: PlanExitTool,
  todowrite: TodosTool,
  todoread: TodosTool,
  read: ReadTool,
  list: ListTool,
  glob: GlobTool,
  grep: GrepTool,
  webfetch: WebFetchTool,
  websearch: WebSearchTool,
};

export { groupContextTools } from "./groupContextTools";
export type { MessagePartGroup } from "./groupContextTools";
export { BashTool } from "./BashTool";
export { EditTool } from "./EditTool";
export {
  GlobTool,
  GrepTool,
  ListTool,
  ReadTool,
  WebFetchTool,
  WebSearchTool,
} from "./ExploreTools";
export { OpenCodeTool, formatToolResult, stripAnsi } from "./OpenCodeTool";
export { PlanExitTool } from "./PlanExitTool";
export { QuestionInlineTool } from "./QuestionInlineTool";
export { StepFinish, StepStart } from "./StepBoundary";
export { TaskTool } from "./TaskTool";
export { TodosTool } from "./TodosTool";
