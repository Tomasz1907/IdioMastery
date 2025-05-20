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
      setMode(value);
    }
  };

  return (
    <CardContent className="space-y-6 animate-slide-up">
      {entries.length >= 5 && (
        <>
          <div>
            <label
              htmlFor="numQuestions"
              className="block mb-2 text-lg font-medium text-[var(--color-foreground)]"
            >
              Number of Questions
            </label>
            <Select
              onValueChange={(value) =>
                setNumQuestions(
                  value === "all" ? entries.length : Number(value)
                )
              }
              disabled={loading}
            >
              <SelectTrigger
                id="numQuestions"
                className="w-full bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-border)] rounded-[var(--radius-md)] focus:ring-[var(--color-ring)] focus:ring-2 transition-[var(--transition-theme)] hover:bg-[var(--color-muted)]"
              >
                <SelectValue placeholder="Choose Number" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-card)] text-[var(--color-card-foreground)] border-[var(--color-border)] rounded-[var(--radius-md)] transition-[var(--transition-theme)]">
                {questionOptions
                  .filter((num) => num <= entries.length)
                  .map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                <SelectItem value="all">All ({entries.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {numQuestions && (
            <div>
              <label
                htmlFor="mode"
                className="block mb-2 text-lg font-medium text-[var(--color-foreground)]"
              >
                Translation Mode
              </label>
              <Select onValueChange={handleModeChange} disabled={loading}>
                <SelectTrigger
                  id="mode"
                  className="w-full bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-border)] rounded-[var(--radius-md)] focus:ring-[var(--color-ring)] focus:ring-2 transition-[var(--transition-theme)] hover:bg-[var(--color-muted)]"
                >
                  <SelectValue placeholder="Choose Mode" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-card)] text-[var(--color-card-foreground)] border-[var(--color-border)] rounded-[var(--radius-md)] transition-[var(--transition-theme)]">
                  <SelectItem value="spanish-english">
                    Spanish to English
                  </SelectItem>
                  <SelectItem value="english-spanish">
                    English to Spanish
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {numQuestions && mode && (
            <Button
              onClick={onStartQuiz}
              className="w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || entries.length < numQuestions}
            >
              {loading ? "Loading..." : "Start Quiz"}
            </Button>
          )}
        </>
      )}
    </CardContent>
  );
};

export default QuizSettings;
