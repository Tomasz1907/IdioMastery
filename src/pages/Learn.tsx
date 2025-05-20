import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, push, remove, set } from "firebase/database";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import WordList from "@/components/WordList";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CornerRightDownIcon } from "lucide-react";
import { toast } from "sonner";
import { updateStreak } from "@/lib/firebaseUtils";

const Learn = () => {
  const [words, setWords] = useState<DictionaryEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

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
          `Not enough valid sentences in CSV. Found ${parsedWords.length}, need at least 10.`
        );
      }

      // Pick 10 random sentences efficiently
      const indices = new Set<number>();
      while (indices.size < 10) {
        indices.add(Math.floor(Math.random() * parsedWords.length));
      }
      const selectedWords = Array.from(indices).map(
        (index) => parsedWords[index]
      );

      setWords(selectedWords);
    } catch (err: any) {
      console.error("Error loading sentences:", err.message);
      setError(`Could not load sentences: ${err.message}.`);
    } finally {
      setLoading(false);
    }
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
      toast.success("Sentence saved successfully!");
    } catch (err) {
      console.error("Error saving sentence:", err);
      setError("Could not save sentence. Please try again.");
      toast.error("Failed to save sentence.");
    }
  };

  const handleRemoveWord = async (word: DictionaryEntry, index: number) => {
    const user = auth.currentUser;
    if (!user || !word.id) {
      setError("Please sign in to remove sentences.");
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
      console.error("Error removing sentence:", err);
      setError("Could not remove sentence. Please try again.");
      toast.error("Failed to remove sentence.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 ">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-serif">
            <div className="flex justify-between">
              <p>Learn New Sentences</p>
              <div className="hidden md:flex text-sm gap-2 items-end justify-center mr-5">
                <p>Click and save to dictionary</p>
                <CornerRightDownIcon className="size-4" />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WordList
            words={words}
            error={error}
            loading={loading}
            onSaveWord={handleSaveWord}
            onRemoveWord={handleRemoveWord}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Learn;
