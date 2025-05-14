import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { ref, get, remove } from "firebase/database";
import { auth, database } from "@/../FirebaseConfig";
import { Loader, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import DictionaryTable from "../DictionaryTable";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";

const Dictionary = () => {
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const dictionaryRef = ref(
                database,
                `users/${user.uid}/dictionary`
              );
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
    initializeAuth();
  }, []);

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

  const filteredDictionary = dictionary.filter((entry) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      searchQuery === "" ||
      entry.english.toLowerCase().includes(searchLower) ||
      entry.spanish.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center">
        <Loader className="animate-spin my-5" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 text-sm sm:text-xs">{error}</p>
    );
  }

  return (
    <div className="flex flex-col items-center py-4 md:px-4">
      <h1 className="text-2xl mb-4 sm:text-xl">Your Saved Words</h1>
      <div className="w-full max-w-4xl mb-6 flex gap-4">
        <div className="relative flex items-center w-full border-2 border-neutral-500 bg-neutral-500/10 rounded-full">
          <Input
            type="text"
            placeholder="Search by word..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 ring-0 border-0 focus-visible:ring-0 placeholder:text-neutral-500"
          />
          <SearchIcon className="absolute right-3 w-5 h-5 text-neutral-500" />
        </div>
      </div>
      <DictionaryTable
        entries={filteredDictionary}
        onRemoveWord={handleRemoveWord}
      />
      {error && (
        <p className="mt-4 text-red-500 text-center text-sm sm:text-xs">
          {error}
        </p>
      )}
    </div>
  );
};

export default Dictionary;
