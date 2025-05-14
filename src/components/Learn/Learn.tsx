import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, push, remove } from "firebase/database";
import DictionaryTable from "../DictionaryTable";
import Papa from "papaparse";

// Define the type for dictionary entries
type DictionaryEntry = {
  id?: string;
  english: string;
  spanish: string;
  saved?: boolean;
  timestamp?: number;
};

const Learn = () => {
  const [words, setWords] = useState<DictionaryEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load CSV and select 10 random words on mount
  useEffect(() => {
    const loadWords = async () => {
      setLoading(true);
      setError("");
      try {
        const csvUrl = "/src/data/englishspanish.csv";
        console.log("Fetching CSV from:", csvUrl);
        const response = await fetch(csvUrl, {
          headers: {
            Accept: "text/csv; charset=utf-8",
          },
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "CSV file not found at /src/data/englishspanish.csv. Please ensure the file exists."
            );
          }
          throw new Error(
            `Failed to load CSV file: ${response.status} ${response.statusText}`
          );
        }
        const csvText = await response.text();

        // Parse CSV using PapaParse
        const parsed = Papa.parse<DictionaryEntry>(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (result) => result.data,
          error: (error) => {
            throw new Error(`Error parsing CSV: ${error.message}`);
          },
        });

        // Skip header and validate rows
        const parsedWords = parsed.data
          .filter((row, index) => {
            if (index === 0 && row[0]?.toLowerCase() === "english") {
              return false; // Skip header
            }
            if (!row[0]?.trim() || !row[1]?.trim()) {
              console.warn(`Skipping invalid CSV line: ${row}`);
              return false;
            }
            return true;
          })
          .map(([english, spanish]) => ({ english, spanish }));

        if (parsedWords.length < 10) {
          throw new Error(
            `Not enough valid words in CSV. Found ${parsedWords.length} words, need at least 10.`
          );
        }

        // Select 10 random words
        const shuffled = parsedWords.sort(() => Math.random() - 0.5);
        const selectedWords = shuffled.slice(0, 10);
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

  // Handle saving a word to Firebase
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
      // Update local state to show word is saved
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

  // Handle removing a word from Firebase
  const handleRemoveWord = async (word: DictionaryEntry, index: number) => {
    const user = auth.currentUser;
    if (!user || !word.id) {
      setError("Please sign in to remove words.");
      return;
    }

    try {
      const wordRef = ref(database, `users/${user.uid}/dictionary/${word.id}`);
      await remove(wordRef);
      // Update local state to show word is no longer saved
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
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl mb-4 sm:text-xl">Learn English-Spanish Words</h1>

      {loading && <p className="text-sm sm:text-xs">Loading words...</p>}
      {error && <p className="mt-4 text-red-500 text-sm sm:text-xs">{error}</p>}
      {words.length > 0 && (
        <div className="mt-4 w-full max-w-4xl">
          <h2 className="text-xl mb-4 sm:text-lg">Your Words</h2>
          <DictionaryTable
            entries={words}
            onSaveWord={handleSaveWord}
            onRemoveWord={handleRemoveWord}
          />
        </div>
      )}
    </div>
  );
};

export default Learn;
