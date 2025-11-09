import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { QuizQuestion } from "@/lib/types/DictionaryEntry";

interface QuizResultsProps {
  questions: QuizQuestion[];
  score: number;
  startTime: number | null;
  endTime: number | null;
  onReset: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  score,
  startTime,
  endTime,
  onReset,
}) => {
  return (
    <CardContent className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-serif">Quiz Results</h2>
        <p className="text-xl  mt-2">
          Score: {score}/{questions.length} (
          {((score / questions.length) * 100).toFixed(2)}%)
        </p>
        <p className="text-lg text-muted-foreground mt-1">
          Time Taken:{" "}
          {startTime && endTime
            ? (() => {
                const durationInSeconds = Math.floor(
                  (endTime - startTime) / 1000
                );
                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor((durationInSeconds % 3600) / 60);
                const seconds = durationInSeconds % 60;

                return `${hours > 0 ? `${hours} hours ` : ""}${
                  minutes > 0 ? `${minutes} minutes ` : ""
                }${seconds} seconds`;
              })()
            : "0 seconds"}
        </p>
      </div>
      <div className=" overflow-y-auto space-y-4 pr-2">
        <h3 className="text-lg font-semibold ">Review Questions:</h3>
        {questions.map((q, index) => (
          <div key={index} className="">
            <p className="text-lg  mb-2">
              <strong>Question {index + 1}: </strong>
              <strong>{q.word}</strong>
            </p>
            <ul className="space-y-2">
              {q.options.map((option: string, i: number) => (
                <li
                  key={i}
                  className={`p-2 rounded-sm ${
                    option === q.correctTranslation
                      ? "bg-green-600 text-white"
                      : option === q.userAnswer
                      ? "bg-red-700 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {String.fromCharCode(97 + i)}. {option}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Button onClick={onReset} className="w-full py-3 text-lg font-semibold">
        Start New Quiz
      </Button>
    </CardContent>
  );
};

export default QuizResults;
