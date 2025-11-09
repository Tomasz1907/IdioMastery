import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, get } from "firebase/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import MatchSettings from "@/components/Match/MatchSettings";
import MatchGame from "@/components/Match/MatchGame";
import MatchResults from "@/components/Match/MatchResults";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

const Match = () => {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"english-spanish" | "spanish-english">(
    "english-spanish"
  );
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [results, setResults] = useState<{
    correct: number;
    wrong: number;
    highestCombo: number;
  } | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("Please sign in to play.");
        setLoading(false);
        return;
      }
      try {
        const dictRef = ref(database, `users/${user.uid}/dictionary`);
        const snap = await get(dictRef);
        if (snap.exists()) {
          const data: DictionaryEntry[] = [];
          snap.forEach((child) => {
            data.push({ ...child.val(), id: child.key });
          });
          setEntries(data);
          if (data.length < 5) setError("Save at least 5 sentences to play.");
        } else {
          setError("Save at least 5 sentences to play.");
        }
      } catch (err) {
        setError("Failed to load sentences.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handleStart = (m: "english-spanish" | "spanish-english", t: number) => {
    setMode(m);
    setTimeLimit(t);
    setGameStarted(true);
    setGameEnded(false);
    setResults(null);
  };

  const handleEnd = (res: {
    correct: number;
    wrong: number;
    highestCombo: number;
  }) => {
    setGameEnded(true);
    setGameStarted(false);
    setResults(res);
  };

  const handleReset = () => {
    setMode("english-spanish");
    setTimeLimit(null);
    setGameStarted(false);
    setGameEnded(false);
    setResults(null);
  };

  return (
    <div className="flex flex-col items-center p-2 mx-auto">
      <Card className="w-full max-w-5xl py-12">
        <CardHeader className="text-center">
          <CardTitle
            style={{ fontFamily: "'Baloo 2', cursive" }}
            className="text-3xl font-bold font-serif"
          >
            Match Master
          </CardTitle>
        </CardHeader>
        {loading && <LoadingSpinner />}
        {error && <div className="p-6 text-center text-red-500">{error}</div>}
        {!loading && !error && (
          <motion.div
            key={entries.map((e) => e.english).join("-")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <CardContent className="space-y-8 flex items-center justify-center">
              {!gameStarted && !gameEnded && (
                <MatchSettings entries={entries} onStart={handleStart} />
              )}
              {gameStarted && timeLimit && (
                <MatchGame
                  entries={entries}
                  mode={mode}
                  timeLimit={timeLimit}
                  onEnd={handleEnd}
                />
              )}
              {gameEnded && results && (
                <MatchResults results={results} onReset={handleReset} />
              )}
            </CardContent>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default Match;
