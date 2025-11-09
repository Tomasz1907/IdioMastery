import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, get, set, push } from "firebase/database";
import QuizSettings from "@/components/Quiz/QuizSettings";
import QuizQuestion from "@/components/Quiz/QuizQuestion";
import QuizResults from "@/components/Quiz/QuizResults";
import ErrorDisplay from "@/components/ErrorDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  DictionaryEntry,
  QuizQuestion as QuizQuestionType,
} from "@/lib/types/DictionaryEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateStreak } from "@/lib/firebaseUtils";
import { motion } from "framer-motion";

const Quiz = () => {
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [mode, setMode] = useState<"spanish-english" | "english-spanish" | "">(
    ""
  );
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError("");
      const user = auth.currentUser;
      if (!user) {
        setError("Please sign in to take the quiz.");
        setLoading(false);
        return;
      }

      try {
        const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
        const snapshot = await get(dictionaryRef);
        if (snapshot.exists()) {
          const allEntries: DictionaryEntry[] = [];
          snapshot.forEach((child) => {
            allEntries.push({ ...child.val(), id: child.key });
          });
          setEntries(allEntries.length ? allEntries : []);
          if (allEntries.length < 5)
            setError("Before doing the quiz, save at least 5 words.");
        } else {
          setError("Before doing the quiz, save at least 5 words.");
        }
      } catch (err) {
        console.error("Error fetching dictionary:", err);
        setError("Could not fetch words. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const saveQuizResult = async (score: number, totalQuestions: number) => {
    if (!auth.currentUser) return;
    try {
      const quizRef = ref(
        database,
        `users/${auth.currentUser.uid}/quizResults`
      );
      const newQuizRef = push(quizRef);
      await set(newQuizRef, {
        score,
        totalQuestions,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast.error("Failed to save quiz result.");
    }
  };

  const generateQuestions = () => {
    if (
      !numQuestions ||
      !mode ||
      entries.length < 5 ||
      entries.length < numQuestions
    ) {
      setError("Before doing the quiz, save at least 5 words.");
      return;
    }

    const [sourceLang, targetLang] = mode.split("-") as [
      "english" | "spanish",
      "english" | "spanish"
    ];
    const shuffledEntries = [...entries]
      .sort(() => Math.random() - 0.5)
      .slice(0, numQuestions);
    const newQuestions: QuizQuestionType[] = shuffledEntries.map((entry) => {
      const word = entry[sourceLang];
      const correctTranslation = entry[targetLang];
      const otherEntries = entries.filter((e) => e.id !== entry.id);
      const incorrectOptions: string[] = [];
      while (incorrectOptions.length < 3 && otherEntries.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherEntries.length);
        const option = otherEntries[randomIndex][targetLang];
        if (
          option !== correctTranslation &&
          !incorrectOptions.includes(option)
        ) {
          incorrectOptions.push(option);
          otherEntries.splice(randomIndex, 1);
        }
      }
      while (incorrectOptions.length < 3) {
        incorrectOptions.push(`incorrect_${incorrectOptions.length + 1}`);
      }
      const options = [correctTranslation, ...incorrectOptions].sort(
        () => Math.random() - 0.5
      );
      return {
        word,
        correctTranslation,
        options,
        sourceLang,
        targetLang,
        userAnswer: null,
      };
    });

    setQuestions(newQuestions);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStartTime(Date.now());
    setEndTime(null);
    setError("");
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctTranslation;

    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentQuestionIndex ? { ...q, userAnswer: answer } : q
      )
    );

    if (isCorrect) setScore((prev) => prev + 1);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setEndTime(Date.now());
      setQuizStarted(false);
      const finalScore = score + (isCorrect ? 1 : 0);
      saveQuizResult(finalScore, questions.length);
      if (auth.currentUser) updateStreak(auth.currentUser.uid);
    }
  };

  const resetQuiz = () => {
    setNumQuestions(null);
    setMode("");
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStartTime(null);
    setEndTime(null);
    setError("");
  };

  return (
    <div className="flex flex-col items-center p-2 mx-auto">
      <Card className="w-full max-w-5xl py-12">
        <CardHeader className="text-center">
          <CardTitle
            style={{ fontFamily: "'Baloo 2', cursive" }}
            className="text-3xl font-bold font-serif"
          >
            Translation Quiz
          </CardTitle>
        </CardHeader>
        {loading && <LoadingSpinner />}
        {!loading && !error && (
          <motion.div
            key={entries.map((e) => e.english).join("-")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <CardContent className="space-y-6 flex items-center justify-center">
              {error && <ErrorDisplay message={error} />}
              {!quizStarted && endTime === null && (
                <QuizSettings
                  entries={entries}
                  numQuestions={numQuestions}
                  mode={mode}
                  loading={loading}
                  setNumQuestions={setNumQuestions}
                  setMode={setMode}
                  onStartQuiz={generateQuestions}
                />
              )}
              {quizStarted && questions.length > 0 && (
                <QuizQuestion
                  question={questions[currentQuestionIndex]}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  onAnswer={handleAnswer}
                />
              )}
              {endTime !== null && questions.length > 0 && (
                <QuizResults
                  questions={questions}
                  score={score}
                  startTime={startTime}
                  endTime={endTime}
                  onReset={resetQuiz}
                />
              )}
            </CardContent>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default Quiz;
