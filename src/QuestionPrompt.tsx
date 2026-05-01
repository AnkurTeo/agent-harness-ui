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

  const getDraft = (id: string) => drafts[id] ?? EMPTY_DRAFT;
  const setDraft = (id: string, next: Partial<DraftState>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? EMPTY_DRAFT), ...next },
    }));
  };

  return (
    <div className="aui-root border-aui-border bg-aui-background border-t p-3">
      <div className="text-aui-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
        Agent question
      </div>
      <div className="space-y-3">
        {questions.map((req) => {
          const info = req.questions[0];
          if (!info) return null;

          const draft = getDraft(req.id);
          const isMulti = info.multiple === true;
          const allowCustom = info.custom !== false;

          const submitSingle = (label: string) =>
            void replyToQuestion(req.id, [[label]]);
          const submitMulti = () => {
            if (draft.selected.length === 0) return;
            void replyToQuestion(req.id, [draft.selected]);
          };
          const submitCustom = () => {
            const text = draft.custom.trim();
            if (!text) return;
            void replyToQuestion(req.id, [[text]]);
          };
          const toggle = (label: string) => {
            const selected = draft.selected.includes(label)
              ? draft.selected.filter((l) => l !== label)
              : [...draft.selected, label];
            setDraft(req.id, { selected });
          };

          return (
            <div
              key={req.id}
              className="border-aui-border bg-aui-background rounded-lg border p-3"
            >
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
                      onClick={() =>
                        isMulti ? toggle(opt.label) : submitSingle(opt.label)
                      }
                      className="aui-thread-welcome-suggestion !items-start !justify-start !max-w-none text-left"
                      aria-pressed={isMulti ? checked : undefined}
                    >
                      <span className="flex w-full items-start gap-2">
                        {isMulti && (
                          <span
                            aria-hidden
                            className="border-aui-border text-aui-primary mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] leading-none"
                          >
                            {checked ? "✓" : ""}
                          </span>
                        )}
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
                      setDraft(req.id, { custom: e.target.value })
                    }
                    placeholder="Type your answer..."
                  />
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isMulti && (
                  <button
                    type="button"
                    className="aui-button aui-button-primary aui-button-medium"
                    disabled={draft.selected.length === 0}
                    onClick={submitMulti}
                  >
                    Submit ({draft.selected.length})
                  </button>
                )}
                {allowCustom && (
                  <button
                    type="button"
                    className="aui-button aui-button-outline aui-button-medium"
                    disabled={draft.custom.trim().length === 0}
                    onClick={submitCustom}
                  >
                    Send custom
                  </button>
                )}
                <button
                  type="button"
                  className="aui-button aui-button-ghost aui-button-medium ml-auto"
                  onClick={() => rejectQuestion(req.id)}
                >
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
