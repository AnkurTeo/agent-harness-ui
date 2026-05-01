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

function QuestionPromptInner({
  questions,
}: {
  questions: OpenCodeQuestionRequest[];
}) {
  const { replyToQuestion, rejectQuestion } = useOpenCodeRuntimeExtras();

  return (
    <div className="border-t bg-sky-50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-800">
        Agent question
      </div>
      <div className="space-y-3">
        {questions.map((req) => {
          const first = req.questions[0];
          return (
            <div
              key={req.id}
              className="rounded border border-sky-200 bg-white p-2 text-sm"
            >
              <p className="mb-2 font-medium">
                {first?.header ?? "Question"}
              </p>
              {first?.question && (
                <p className="mb-2 text-gray-700">{first.question}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {first?.options?.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    title={opt.description}
                    className="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700"
                    onClick={() => replyToQuestion(req.id, [[opt.label]])}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded bg-gray-300 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-400"
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
