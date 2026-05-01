import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { BashTool } from "./BashTool";
import { EditTool } from "./EditTool";
import { TaskTool } from "./TaskTool";
import { QuestionInlineTool } from "./QuestionInlineTool";

export const openCodeToolsByName: Record<string, ToolCallMessagePartComponent> = {
  bash: BashTool,
  edit: EditTool,
  write: EditTool,
  apply_patch: EditTool,
  task: TaskTool,
  question: QuestionInlineTool,
};

export { groupContextTools } from "./groupContextTools";
export type { MessagePartGroup } from "./groupContextTools";
