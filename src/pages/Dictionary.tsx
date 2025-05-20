import { useState, useEffect } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, get, remove } from "firebase/database";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import SearchBar from "@/components/SearchBar";
import WordList from "@/components/WordList";
import ErrorDisplay from "@/components/ErrorDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dictionary = () => {
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
            const snapshot = await get(dictionaryRef);
            if (snapshot.exists()) {
              const dictionaryData: DictionaryEntry[] = [];
              snapshot.forEach((child) => {
                const id = child.key!;
                const val = child.val();
                dictionaryData.push({
                  id,
                  english: val.english || "N/A",
                  spanish: val.spanish || "N/A",
                  saved: true,
                  timestamp: val.timestamp ?? 0,
                });
              });
              dictionaryData.sort(
                (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)
              );
              setDictionary(dictionaryData);
            } else {
              setError(
                "You don't have any saved words. You can save them on the Learn page with the star button."
              );
            }
          } catch (err) {
            console.error("Error fetching dictionary:", err);
            setError("Failed to fetch dictionary. Please try again.");
          }
        } else {
          setError("You must be signed in to view your dictionary.");
        }
        setLoading(false);
      });
    } catch (err) {
      console.error("Error initializing authentication:", err);
      setError("An error occurred while restoring your session.");
      setLoading(false);
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
      setDictionary((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error removing word:", err);
      setError("Could not remove word. Please try again.");
    }
  };

  const filteredDictionary = dictionary.filter(
    (entry) =>
      searchQuery === "" ||
      entry.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.spanish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-serif">
            Your Saved Vocabulary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          {!loading && !error && (
            <>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <WordList
                entries={filteredDictionary}
                onRemoveWord={handleRemoveWord}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dictionary;
