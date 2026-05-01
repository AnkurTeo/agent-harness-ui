import type { FC } from "react";

/**
 * Thin horizontal rule rendered between OpenCode step boundaries.
 * The opencode-step-start and opencode-step-finish parts both plumb
 * through MessagePrimitive.Parts's `data.by_name` slot (they arrive
 * as `data` parts after react-opencode's projection; see
 * openCodeMessageProjection.js).
 *
 * We only render a divider for step-finish (not step-start) to avoid
 * a double rule between adjacent turns.
 */
export const StepFinish: FC = () => {
  return <hr className="my-3 border-dashed border-border" />;
};

export const StepStart: FC = () => null;
