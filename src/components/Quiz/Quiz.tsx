import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, get } from "firebase/database";

type DictionaryEntry = {
  id?: string;
  english: string;
  spanish: string;
  saved?: boolean;
  timestamp?: number;
};

type QuizQuestion = {
  word: string;
  correctTranslation: string;
  options: string[];
  sourceLang: string;
  targetLang: string;
  userAnswer: string | null;
};

const Quiz = () => {
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [mode, setMode] = useState<"spanish-english" | "english-spanish" | "">(
    ""
  );
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const questionOptions = [5, 10, 15, 20];

  // Fetch dictionary entries on mount
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
            const entry = child.val();
            allEntries.push({ ...entry, id: child.key });
          });
          if (allEntries.length === 0) {
            setError("No words found in your dictionary.");
          } else {
            setEntries(allEntries);
          }
        } else {
          setError("No words found in your dictionary.");
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

  // Generate quiz questions
  const generateQuestions = () => {
    if (!numQuestions || !mode || entries.length < numQuestions) return;

    const [sourceLang, targetLang] = mode.split("-") as [
      "english" | "spanish",
      "english" | "spanish"
    ];

    const shuffledEntries = [...entries]
      .sort(() => Math.random() - 0.5)
      .slice(0, numQuestions);

    const newQuestions: QuizQuestion[] = shuffledEntries.map((entry) => {
      const word = entry[sourceLang];
      const correctTranslation = entry[targetLang];

      const otherEntries = entries.filter((e) => e.id !== entry.id);
      const incorrectOptions: string[] = [];
      while (incorrectOptions.length < 2 && otherEntries.length > 0) {
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

      while (incorrectOptions.length < 2) {
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
  };

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctTranslation;

    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentQuestionIndex ? { ...q, userAnswer: answer } : q
      )
    );

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setEndTime(Date.now());
      setQuizStarted(false);
    }
  };

  // Reset quiz
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
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl mb-4">Translation Quiz</h1>

      {!quizStarted && endTime === null && (
        <div className="w-full max-w-md">
          {/* Number of Questions */}
          <div className="mb-4">
            <label htmlFor="numQuestions" className="block mb-2 text-lg">
              Number of Questions:
            </label>
            <select
              id="numQuestions"
              value={numQuestions || ""}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full p-2 rounded-md outline-none bg-neutral-700 text-white"
              disabled={loading || entries.length === 0}
            >
              <option value="">--Choose Number--</option>
              {questionOptions.map((num) => (
                <option key={num} value={num} disabled={entries.length < num}>
                  {num}{" "}
                  {entries.length < num &&
                    `(Not enough words: ${entries.length})`}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selection */}
          {numQuestions && (
            <div className="mb-4">
              <label htmlFor="mode" className="block mb-2 text-lg">
                Translation Mode:
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) =>
                  setMode(
                    e.target.value as "spanish-english" | "english-spanish"
                  )
                }
                className="w-full p-2 rounded-md outline-none bg-neutral-700 text-white"
              >
                <option value="">--Choose Mode--</option>
                <option value="spanish-english">Spanish to English</option>
                <option value="english-spanish">English to Spanish</option>
              </select>
            </div>
          )}

          {/* Start Quiz Button */}
          {numQuestions && mode && (
            <button
              onClick={generateQuestions}
              className="bg-green-500 text-white p-2 rounded-md w-full hover:bg-green-600 transition disabled:bg-gray-400"
              disabled={loading || entries.length < numQuestions}
            >
              {loading ? "Loading..." : "Start Quiz"}
            </button>
          )}

          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        </div>
      )}

      {/* Quiz Interface */}
      {quizStarted && questions.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl mb-4">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-lg mb-4">
            Translate: <strong>{questions[currentQuestionIndex].word}</strong> (
            {questions[currentQuestionIndex].sourceLang} to{" "}
            {questions[currentQuestionIndex].targetLang})
          </p>
          <div className="grid gap-4">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition text-left"
              >
                {String.fromCharCode(97 + index)}. {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Interface */}
      {endTime !== null && questions.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl mb-4">Quiz Results</h2>
          <p className="text-lg mb-2">
            Score: {score}/{questions.length} (
            {((score / questions.length) * 100).toFixed(2)}%)
          </p>
          <p className="text-lg mb-4">
            Time Taken: {((endTime - (startTime || 0)) / 1000).toFixed(2)}{" "}
            seconds
          </p>

          {/* Display All Questions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Review Questions:</h3>
            <ul className="space-y-4">
              {questions.map((q, index) => (
                <li key={index} className="p-4 border rounded-md">
                  <p className="text-lg mb-2">
                    <strong>Question {index + 1}:</strong> Translate{" "}
                    <strong>{q.word}</strong> ({q.sourceLang} to {q.targetLang})
                  </p>
                  <ul className="space-y-2">
                    {q.options.map((option, i) => (
                      <li
                        key={i}
                        className={`p-2 rounded-md ${
                          option === q.correctTranslation
                            ? "bg-green-200 text-green-800"
                            : option === q.userAnswer
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-100"
                        }`}
                      >
                        {String.fromCharCode(97 + i)}. {option}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={resetQuiz}
            className="bg-blue-500 text-white p-2 rounded-md mt-4 hover:bg-blue-600 transition text-center w-full"
          >
            Start New Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
