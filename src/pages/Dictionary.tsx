import { useState, useEffect, useMemo } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, get, remove } from "firebase/database";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import SearchBar from "@/components/LearnDictionary/SearchBar";
import WordList from "@/components/LearnDictionary/WordList";
import ErrorDisplay from "@/components/ErrorDisplay";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";

const PAGE_SIZE = 10;

const Dictionary = () => {
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

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
                const data: DictionaryEntry[] = [];
                snapshot.forEach((child) => {
                  const id = child.key!;
                  const val = child.val();
                  data.push({
                    id,
                    english: val.english || "N/A",
                    spanish: val.spanish || "N/A",
                    saved: true,
                    timestamp: val.timestamp ?? 0,
                  });
                });
                data.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
                setDictionary(data);
              } else {
                setError("No saved words yet. Go to Learn page to save some!");
              }
            } catch (err) {
              console.error(err);
              setError("Failed to load dictionary.");
            }
          } else {
            setError("Sign in to view your dictionary.");
          }
          setLoading(false);
        });
      } catch (err) {
        setError("Session error.");
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const handleRemoveWord = async (word: DictionaryEntry, index: number) => {
    const user = auth.currentUser;
    if (!user || !word.id) return;
    try {
      const wordRef = ref(database, `users/${user.uid}/dictionary/${word.id}`);
      await remove(wordRef);
      setDictionary((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError("Failed to remove word.");
    }
  };

  const filteredAndPaginated = useMemo(() => {
    const filtered = dictionary.filter(
      (entry) =>
        searchQuery === "" ||
        entry.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.spanish.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [dictionary, searchQuery, page]);

  const { items, total, totalPages } = filteredAndPaginated;

  return (
    <div className="min-h-screen flex flex-col items-center p-2">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle
            style={{ fontFamily: "'Baloo 2', cursive" }}
            className="text-2xl lg:text-4xl font-bold font-serif"
          >
            Your Saved Vocabulary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}

          {!loading && !error && (
            <motion.div
              key={items.map((i) => i.english).join("-")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              {total === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {searchQuery
                    ? "No words match your search."
                    : "No saved words yet. Save some on the Learn page!"}
                </p>
              ) : (
                <>
                  <WordList entries={items} onRemoveWord={handleRemoveWord} />

                  <div className="flex items-center justify-center mt-6">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dictionary;
