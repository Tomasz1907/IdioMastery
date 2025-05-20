import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import type { QuizQuestion } from "@/lib/types/DictionaryEntry";

interface QuizQuestionProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
}) => {
  return (
    <CardContent className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Question {currentIndex + 1} of {totalQuestions}
        </h2>
        <div className="mt-2 w-full bg-[var(--color-muted)] rounded-[var(--radius-sm)] h-2">
          <div
            className="bg-[var(--color-primary)] h-full rounded-[var(--radius-sm)] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
      <p className="text-xl text-[var(--color-foreground)] text-center break-words whitespace-normal leading-relaxed px-4">
        Translate: <strong>{question.word}</strong>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option: string, index: number) => (
          <Button
            key={index}
            onClick={() => onAnswer(option)}
            className="py-8 text-left w-full text-base font-serif break-words whitespace-normal"
            aria-label={`Option ${String.fromCharCode(97 + index)}: ${option}`}
          >
            <span className="font-semibold mr-2">
              {String.fromCharCode(97 + index)}.
            </span>{" "}
            {option}
          </Button>
        ))}
      </div>
    </CardContent>
  );
};

export default QuizQuestion;
