import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, get } from "firebase/database";

type DictionaryEntry = {
  id?: string;
  category: string;
  translations: { polish: string; english: string; spanish: string };
  sentences: { polish: string; english: string; spanish: string };
  definitions: { polish: string; english: string; spanish: string };
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
  const [category, setCategory] = useState("");
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [mode, setMode] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [validCategories, setValidCategories] = useState<string[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allTopics = [
    "food",
    "travel",
    "family",
    "emotions",
    "technology",
    "sports",
    "nature",
    "daily routine",
  ];
  const questionOptions = [5, 10, 15, 30, 50];
  const modes = [
    "Polish-Spanish",
    "Spanish-Polish",
    "English-Spanish",
    "Spanish-English",
  ];

  // Fetch valid categories on mount
  useEffect(() => {
    const fetchValidCategories = async () => {
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
          const categorySet = new Set<string>();
          snapshot.forEach((child) => {
            const entry = child.val();
            if (entry.category) {
              categorySet.add(entry.category);
            }
          });
          const categories = Array.from(categorySet).filter((cat) =>
            allTopics.includes(cat)
          );
          setValidCategories(["All", ...categories.sort()]);
        } else {
          setError("No words found in your dictionary.");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Could not fetch categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchValidCategories();
  }, []);

  // Fetch dictionary entries for the selected category
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError("");
      setEntries([]);
      setNumQuestions(null);
      setMode("");

      const user = auth.currentUser;
      if (!user || !category) {
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
            if (category === "All" || entry.category === category) {
              allEntries.push({ ...entry, id: child.key });
            }
          });
          if (allEntries.length === 0) {
            setError("No words found for this category.");
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
  }, [category]);

  // Generate quiz questions
  const generateQuestions = () => {
    if (!numQuestions || !mode || entries.length < numQuestions) return;

    const [sourceLang, targetLang] = mode.toLowerCase().split("-") as [
      "polish" | "spanish" | "english",
      "polish" | "spanish"
    ];

    const shuffledEntries = [...entries]
      .sort(() => Math.random() - 0.5)
      .slice(0, numQuestions);

    const newQuestions: QuizQuestion[] = shuffledEntries.map((entry) => {
      const word = entry.translations[sourceLang];
      const correctTranslation = entry.translations[targetLang];

      const otherEntries = entries.filter((e) => e.id !== entry.id);
      const incorrectOptions: any[] = [];
      while (incorrectOptions.length < 2 && otherEntries.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherEntries.length);
        const option = otherEntries[randomIndex].translations[targetLang];
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
    setCategory("");
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
          {/* Category Selection */}
          <div className="mb-4">
            <label htmlFor="category" className="block mb-2 text-lg">
              Select a Category:
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 rounded-md outline-none bg-neutral-700 text-white"
              disabled={loading || validCategories.length === 0}
            >
              <option value="">--Choose a Category--</option>
              {validCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Questions */}
          {category && (
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
          )}

          {/* Mode Selection */}
          {numQuestions && (
            <div className="mb-4">
              <label htmlFor="mode" className="block mb-2 text-lg">
                Translation Mode:
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 rounded-md outline-none bg-neutral-700 text-white"
              >
                <option value="">--Choose Mode--</option>
                {modes.map((m, index) => (
                  <option key={index} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Quiz Button */}
          {category && numQuestions && mode && (
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
          <h3 className="text-lg font-semibold mb-2">Review</h3>
          {questions.map((q, index) => (
            <div key={index} className="mb-6">
              <p className="text-md mb-2">
                Question {index + 1}: Translate <strong>{q.word}</strong> (
                {q.sourceLang} to {q.targetLang})
              </p>
              <div className="grid gap-2">
                {q.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-3 rounded-md text-white ${
                      option === q.correctTranslation && q.userAnswer === option
                        ? "bg-green-500"
                        : option === q.correctTranslation
                        ? "bg-green-500"
                        : option === q.userAnswer
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {String.fromCharCode(97 + optIndex)}. {option}
                    {option === q.userAnswer && (
                      <span className="ml-2">
                        (Your answer:{" "}
                        {q.userAnswer === q.correctTranslation
                          ? "Correct"
                          : "Incorrect"}
                        )
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
