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
    <CardContent className="space-y-6">
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-semibold">
          Question {currentIndex + 1} of {totalQuestions}
        </h2>
        <div className="mt-2 w-full h-3 bg-muted rounded-full shadow-sm">
          <div
            className="h-full bg-green-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
      <p className="text-xl text-center break-words whitespace-normal leading-relaxed px-4">
        Translate: <strong>{question.word}</strong>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option: string, index: number) => (
          <Button
            key={index}
            onClick={() => onAnswer(option)}
            variant="default"
            className="h-full flex justify-between py-4 text-left w-full text-base font-serif break-words whitespace-normal"
            aria-label={`Option ${String.fromCharCode(97 + index)}: ${option}`}
          >
            <span className="font-semibold mr-2">
              {String.fromCharCode(97 + index)}.
            </span>{" "}
            <div className="w-full">{option}</div>
          </Button>
        ))}
      </div>
    </CardContent>
  );
};

export default QuizQuestion;
