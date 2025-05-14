import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, push, remove } from "firebase/database";
import DictionaryTable from "../DictionaryTable";
import Papa from "papaparse";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import { Loader } from "lucide-react";

const Learn = () => {
  const [words, setWords] = useState<DictionaryEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWords = async () => {
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
              ? "CSV file not found. Please ensure the file exists."
              : `Failed to load CSV file: ${response.status} ${response.statusText}`
          );
        }

        const csvText = await response.text();

        const parsedWords = Papa.parse<string[]>(csvText, {
          header: false,
          skipEmptyLines: true,
        })
          .data.filter(
            (row) => row.length === 2 && row[0]?.trim() && row[1]?.trim()
          )
          .map(([english, spanish]) => ({ english, spanish }));

        if (parsedWords.length < 10) {
          throw new Error(
            `Not enough valid words in CSV. Found ${parsedWords.length}, need at least 10.`
          );
        }

        const selectedWords = parsedWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);

        setWords(selectedWords);
      } catch (err: any) {
        console.error("Error loading words:", err.message);
        setError(`Could not load words: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, []);

  const handleSaveWord = async (word: DictionaryEntry, index: number) => {
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to save words.");
      return;
    }

    try {
      const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
      const newEntry = {
        english: word.english,
        spanish: word.spanish,
        timestamp: Date.now(),
      };
      const newWordRef = await push(dictionaryRef, newEntry);

      setWords((prev) =>
        prev.map((w, i) =>
          i === index ? { ...w, saved: true, id: newWordRef.key } : w
        )
      );
    } catch (err) {
      console.error("Error saving word:", err);
      setError("Could not save word. Please try again.");
    }
  };

  const handleRemoveWord = async (word: DictionaryEntry, index: number) => {
    const user = auth.currentUser;
    if (!user || !word.id) {
      setError("Please sign in to remove words.");
      return;
    }

    try {
      const wordRef = ref(database, `users/${user.uid}/dictionary/${word.id}`);
      await remove(wordRef);

      setWords((prev) =>
        prev.map((w, i) =>
          i === index ? { ...w, saved: false, id: undefined } : w
        )
      );
    } catch (err) {
      console.error("Error removing word:", err);
      setError("Could not remove word. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center ">
      {loading && <Loader className="animate-spin my-5" />}
      {error && <p className="mt-4 text-red-500 text-sm sm:text-xs">{error}</p>}
      {words.length > 0 && (
        <div className="mt-4 w-full max-w-4xl text-center">
          <h1 className="text-xl mb-4">Your New Words</h1>
          <DictionaryTable
            entries={words}
            onSaveWord={handleSaveWord}
            onRemoveWord={handleRemoveWord}
          />
          <p className="text-xl mb-4 sm:text-lg">
            Refresh page to get new words!
          </p>
        </div>
      )}
    </div>
  );
};

export default Learn;
