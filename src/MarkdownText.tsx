import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import type { TextMessagePartComponent } from "@assistant-ui/react";

export const MarkdownText: TextMessagePartComponent = ({ status }) => {
  return (
    <MarkdownTextPrimitive
      className={`aui-md ${status?.type === "running" ? "aui-md-running" : ""}`}
      smooth
    />
  );
};
