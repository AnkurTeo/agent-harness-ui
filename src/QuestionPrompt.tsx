import { useState } from "react";
import {
  useOpenCodeQuestions,
  useOpenCodeRuntimeExtras,
  type OpenCodeQuestionRequest,
} from "@assistant-ui/react-opencode";

export function QuestionPrompt() {
  const questions = useOpenCodeQuestions();

  if (!questions.length) return null;

  return <QuestionPromptInner questions={questions} />;
}

type DraftState = { selected: string[]; custom: string };
const EMPTY_DRAFT: DraftState = { selected: [], custom: "" };

function QuestionPromptInner({
  questions,
}: {
  questions: OpenCodeQuestionRequest[];
}) {
  const { replyToQuestion, rejectQuestion } = useOpenCodeRuntimeExtras();
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [activeByRequest, setActiveByRequest] = useState<Record<string, number>>(
    {},
  );
  const req = questions[0];
  const questionInfos = req?.questions ?? [];
  const questionCount = questionInfos.length;
  const activeIndex = Math.min(
    activeByRequest[req?.id ?? ""] ?? 0,
    Math.max(0, questionCount - 1),
  );
  const info = questionInfos[activeIndex];

  if (!req || !info) return null;

  const draftId = (index: number) => `${req.id}:${index}`;
  const getDraft = (index: number) => drafts[draftId(index)] ?? EMPTY_DRAFT;
  const setDraft = (index: number, next: Partial<DraftState>) => {
    setDrafts((prev) => ({
      ...prev,
      [draftId(index)]: { ...(prev[draftId(index)] ?? EMPTY_DRAFT), ...next },
    }));
  };
  const goTo = (index: number) => {
    setActiveByRequest((prev) => ({
      ...prev,
      [req.id]: Math.min(Math.max(index, 0), questionCount - 1),
    }));
  };

  const draft = getDraft(activeIndex);
  const isMulti = info.multiple === true;
  const allowCustom = info.custom !== false;
  const pendingCount = questions.length;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === questionCount - 1;
  const hasAnswer = (index: number) => {
    const item = getDraft(index);
    return item.custom.trim().length > 0 || item.selected.length > 0;
  };
  const canAdvance = hasAnswer(activeIndex);
  const allAnswered = questionInfos.every((_, index) => hasAnswer(index));

  const submitAll = () => {
    if (!allAnswered) return;
    const answers = questionInfos.map((_, index) => {
      const item = getDraft(index);
      const custom = item.custom.trim();
      return custom ? [custom] : item.selected;
    });
    void replyToQuestion(req.id, answers);
  };
  const next = () => {
    if (!canAdvance) return;
    if (isLast) {
      submitAll();
      return;
    }
    goTo(activeIndex + 1);
  };
  const selectSingle = (label: string) => {
    setDraft(activeIndex, { selected: [label], custom: "" });
  };
  const toggle = (label: string) => {
    const selected = draft.selected.includes(label)
      ? draft.selected.filter((l) => l !== label)
      : [...draft.selected, label];
    setDraft(activeIndex, { selected, custom: "" });
  };

  return (
    <div className="aui-root border-aui-border bg-aui-background border-t p-3">
      <div className="text-aui-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
        Agent questions {activeIndex + 1} of {questionCount}
        {pendingCount > 1 ? ` · request 1 of ${pendingCount}` : ""}
      </div>
      <div className="border-aui-border bg-aui-background rounded-lg border p-3">
        {questionCount > 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {questionInfos.map((question, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={[
                  "h-6 rounded-full border px-2 text-xs transition-colors",
                  index === activeIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : hasAnswer(index)
                      ? "border-border bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                ].join(" ")}
                aria-current={index === activeIndex ? "step" : undefined}
                title={question.question}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {info.header && (
          <p className="text-aui-foreground mb-1 text-sm font-semibold">
            {info.header}
          </p>
        )}
        {info.question && (
          <p className="text-aui-muted-foreground mb-3 text-sm">
            {info.question}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {info.options.map((opt, i) => {
            const checked = draft.selected.includes(opt.label);
            return (
              <button
                key={i}
                type="button"
                onClick={() => (isMulti ? toggle(opt.label) : selectSingle(opt.label))}
                className="aui-thread-welcome-suggestion !items-start !justify-start !max-w-none text-left"
                aria-pressed={checked}
              >
                <span className="flex w-full items-start gap-2">
                  <span
                    aria-hidden
                    className="border-aui-border text-aui-primary mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] leading-none"
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span className="flex flex-col items-start gap-0.5">
                    <span className="aui-thread-welcome-suggestion-text">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-aui-muted-foreground line-clamp-3 text-xs font-normal">
                        {opt.description}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {allowCustom && (
          <div className="mt-3">
            <label className="text-aui-muted-foreground mb-1 block text-xs font-medium">
              Or type a custom answer
            </label>
            <textarea
              className="aui-composer-input border-aui-border w-full rounded-md border p-2"
              rows={2}
              value={draft.custom}
              onChange={(e) =>
                setDraft(activeIndex, {
                  custom: e.target.value,
                  selected: e.target.value.trim() ? [] : draft.selected,
                })
              }
              placeholder="Type your answer..."
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              className="aui-button aui-button-outline aui-button-medium"
              onClick={() => goTo(activeIndex - 1)}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="aui-button aui-button-primary aui-button-medium"
            disabled={!canAdvance || (isLast && !allAnswered)}
            onClick={next}
          >
            {isLast ? "Submit" : "Next"}
          </button>
          <button
            type="button"
            className="aui-button aui-button-ghost aui-button-medium ml-auto"
            onClick={() => rejectQuestion(req.id)}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
