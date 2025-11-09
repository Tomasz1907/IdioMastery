import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, push, remove, set } from "firebase/database";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import WordList from "@/components/LearnDictionary/WordList";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CornerRightDownIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { updateStreak } from "@/lib/firebaseUtils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";

const Learn = () => {
  const [words, setWords] = useState<DictionaryEntry[]>([]);
  const [allCsvWords, setAllCsvWords] = useState<DictionaryEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);

  // Load CSV once
  useEffect(() => {
    const loadCsv = async () => {
      setLoading(true);
      setError("");
      try {
        const csvUrl = "/englishspanish.csv";
        const response = await fetch(csvUrl, {
          headers: { Accept: "text/csv; charset=utf-8" },
        });
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "CSV file not found."
              : `Failed to load CSV: ${response.status}`
          );
        }
        const csvText = await response.text();
        const parsed = Papa.parse<string[]>(csvText, {
          header: false,
          skipEmptyLines: true,
        })
          .data.filter(
            (row) => row.length === 2 && row[0]?.trim() && row[1]?.trim()
          )
          .map(([english, spanish]) => ({ english, spanish }));

        if (parsed.length < 3) {
          throw new Error(
            `Only ${parsed.length} valid sentences found. Need at least 3.`
          );
        }

        setAllCsvWords(parsed);
        loadRandomWords(parsed);
      } catch (err: any) {
        setError(`Could not load sentences: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadCsv();
  }, []);

  // Pick 3 random words
  const loadRandomWords = (source: DictionaryEntry[]) => {
    const indices = new Set<number>();
    while (indices.size < 3 && indices.size < source.length) {
      indices.add(Math.floor(Math.random() * source.length));
    }
    const selected = Array.from(indices).map((i) => ({
      ...source[i],
      saved: false,
      id: undefined,
    }));
    setWords(selected);
  };

  // Animated reload
  const handleReload = () => {
    if (allCsvWords.length === 0 || isReloading) return;

    setIsReloading(true);
    setTimeout(() => {
      loadRandomWords(allCsvWords);
      setIsReloading(false);
    }, 300);
  };

  const handleSaveWord = async (word: DictionaryEntry, index: number) => {
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to save sentences.");
      return;
    }
    try {
      const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
      const newEntry = {
        english: word.english,
        spanish: word.spanish,
        timestamp: Date.now(),
      };
      const newWordRef = await push(dictionaryRef);
      await set(newWordRef, newEntry);
      setWords((prev) =>
        prev.map((w, i) =>
          i === index ? { ...w, saved: true, id: newWordRef.key } : w
        )
      );
      await updateStreak(user.uid);
      toast.success("Sentence saved!");
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Failed to save.");
    }
  };

  const handleRemoveWord = async (word: DictionaryEntry, index: number) => {
    const user = auth.currentUser;
    if (!user || !word.id) return;
    try {
      const wordRef = ref(database, `users/${user.uid}/dictionary/${word.id}`);
      await remove(wordRef);
      setWords((prev) =>
        prev.map((w, i) =>
          i === index ? { ...w, saved: false, id: undefined } : w
        )
      );
      toast.success("Sentence removed.");
    } catch (err) {
      console.error("Error removing:", err);
      toast.error("Failed to remove.");
    }
  };

  return (
    <div className="flex flex-col items-center p-2">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl lg:text-4xl font-bold font-serif">
            <div className="flex justify-between items-center">
              <p style={{ fontFamily: "'Baloo 2', cursive" }}>
                Learn New Sentences
              </p>
              <div className="hidden md:flex text-base gap-2 items-center mr-5">
                <p>Click to save</p>
                <CornerRightDownIcon className="size-5" />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Animated Word List */}
          <AnimatePresence mode="wait">
            {!loading && words.length > 0 && (
              <motion.div
                key={words.map((w) => w.english).join("-")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <WordList
                  words={words}
                  error={error}
                  loading={loading}
                  onSaveWord={handleSaveWord}
                  onRemoveWord={handleRemoveWord}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {loading && <LoadingSpinner />}

          {/* RELOAD BUTTON with animation */}
          {!loading && allCsvWords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center pt-4"
            >
              <Button
                onClick={handleReload}
                disabled={isReloading}
                size="lg"
                className="bg-[#F6BE2C] hover:bg-[#e0a800] text-gray-900 font-bold shadow-md text-lg"
              >
                <motion.div
                  animate={{ rotate: isReloading ? 360 : 0 }}
                  transition={{
                    duration: 0.6,
                    repeat: isReloading ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <RefreshCw className="size-5 mr-2" />
                </motion.div>
                {isReloading ? "Loading..." : "Load New Sentences"}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Learn;
