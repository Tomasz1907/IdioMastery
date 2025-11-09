import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";

interface QuizSettingsProps {
  entries: DictionaryEntry[];
  numQuestions: number | null;
  mode: "spanish-english" | "english-spanish" | "";
  loading: boolean;
  setNumQuestions: (value: number | null) => void;
  setMode: (value: "spanish-english" | "english-spanish" | "") => void;
  onStartQuiz: () => void;
}

const questionOptions = [5, 10, 15, 30, 50, 100];

const QuizSettings: React.FC<QuizSettingsProps> = ({
  entries,
  numQuestions,
  mode,
  loading,
  setNumQuestions,
  setMode,
  onStartQuiz,
}) => {
  const handleModeChange = (value: string) => {
    if (
      value === "spanish-english" ||
      value === "english-spanish" ||
      value === ""
    ) {
      setMode(value as any);
    }
  };

  const canStart = numQuestions && mode && numQuestions <= entries.length;

  return (
    <CardContent className="space-y-8 w-full">
      {entries.length >= 5 ? (
        <>
          {/* NUMBER OF QUESTIONS */}
          <div className="space-y-3">
            <label
              htmlFor="numQuestions"
              className="block text-lg font-medium text-center"
            >
              Number of Questions
            </label>
            <Select
              value={numQuestions?.toString() || ""}
              onValueChange={(value) =>
                setNumQuestions(
                  value === "all" ? entries.length : Number(value)
                )
              }
              disabled={loading}
            >
              <SelectTrigger
                id="numQuestions"
                className="w-full h-12 text-base"
              >
                <SelectValue placeholder="Choose number of questions" />
              </SelectTrigger>
              <SelectContent>
                {questionOptions
                  .filter((num) => num <= entries.length)
                  .map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} questions
                    </SelectItem>
                  ))}
                {entries.length >
                  questionOptions[questionOptions.length - 1] && (
                  <SelectItem value="all">
                    All ({entries.length} questions)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* MODE */}
          <div className="space-y-3">
            <label
              htmlFor="mode"
              className="block text-lg font-medium text-center"
            >
              Translation Mode
            </label>
            <Select
              value={mode}
              onValueChange={handleModeChange}
              disabled={loading}
            >
              <SelectTrigger id="mode" className="w-full h-12 text-base">
                <SelectValue placeholder="Choose translation direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spanish-english">
                  Spanish to English
                </SelectItem>
                <SelectItem value="english-spanish">
                  English to Spanish
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* START BUTTON */}
          <Button
            onClick={onStartQuiz}
            disabled={!canStart || loading}
            className="w-full py-6 text-xl font-bold bg-[#F6BE2C] hover:bg-[#e0a800] text-slate-900"
          >
            {loading ? "Loading..." : "Start Quiz"}
          </Button>

          {numQuestions && numQuestions > entries.length && (
            <p className="text-sm text-red-600 text-center">
              You only have {entries.length} saved words. Max: {entries.length}
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            Save at least <strong>5 words</strong> in your dictionary to start a
            quiz.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Go to <strong>Learn</strong> page and click the star to save!
          </p>
        </div>
      )}
    </CardContent>
  );
};

export default QuizSettings;
