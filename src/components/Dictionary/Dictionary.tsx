import { useState, useEffect, useMemo } from "react";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "@/../FirebaseConfig";
import { SearchIcon } from "lucide-react";
import DictionaryTable from "../DictionaryTable";

// Define the type for dictionary entries
type DictionaryEntry = {
  id: string;
  category: string;
  translations: {
    english: string;
    polish: string;
    spanish: string;
  };
  sentences: {
    english: string;
    polish: string;
    spanish: string;
  };
  definitions: {
    english: string;
    polish: string;
    spanish: string;
  };
};

const Dictionary = () => {
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
                    category: val.category || "No category",
                    translations: {
                      english: val.translations?.english || "N/A",
                      polish: val.translations?.polish || "N/A",
                      spanish: val.translations?.spanish || "N/A",
                    },
                    sentences: {
                      english: val.sentences?.english || "N/A",
                      polish: val.sentences?.polish || "N/A",
                      spanish: val.sentences?.spanish || "N/A",
                    },
                    definitions: {
                      english: val.definitions?.english || "N/A",
                      polish: val.definitions?.polish || "N/A",
                      spanish: val.definitions?.spanish || "N/A",
                    },
                  });
                });

                setDictionary(dictionaryData);
              } else {
                setError("No entries found in your dictionary.");
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

  const closePopup = () => {
    setSelectedEntryIndex(null);
  };

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(dictionary.map((entry) => entry.category))
    );
    return ["All", ...uniqueCategories];
  }, [dictionary]);

  const filteredDictionary = useMemo(() => {
    return dictionary.filter((entry) => {
      const matchesCategory =
        selectedCategory === "All" || entry.category === selectedCategory;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        Object.values(entry.translations).some((word) =>
          word.toLowerCase().includes(searchLower)
        ) ||
        Object.values(entry.definitions).some((def) =>
          def.toLowerCase().includes(searchLower)
        );

      return matchesCategory && matchesSearch;
    });
  }, [dictionary, searchQuery, selectedCategory]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center py-4 md:px-4">
      <h1 className="text-2xl mb-4">Your Dictionary</h1>
      {/* Search and Category Filter */}
      <div className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center justify-between gap-2 w-full sm:w-2/3 p-2 px-4 rounded-md border-2 border-neutral-500 bg-neutral-500/20">
          <input
            type="text"
            placeholder="Search by word or definition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none placeholder-neutral-500"
          />
          <SearchIcon />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-1/3 p-2 rounded-md border-2 border-neutral-500 outline-none bg-neutral-500/20"
        >
          {categories.map((category) => (
            <option
              key={category}
              value={category}
              className="bg-neutral-500/50"
            >
              {category}
            </option>
          ))}
        </select>
      </div>
      {/* Render Dictionary Table */}
      <DictionaryTable
        entries={filteredDictionary}
        selectedEntryIndex={selectedEntryIndex}
        setSelectedEntryIndex={setSelectedEntryIndex}
        closePopup={closePopup}
      />
      {/* Error Message */}
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
    </div>
  );
};

export default Dictionary;
