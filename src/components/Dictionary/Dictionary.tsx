import { useState, useEffect, useMemo } from "react";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "@/../FirebaseConfig"; // Adjust path for firebase.ts in root
import { EyeIcon, SearchIcon } from "lucide-react";

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
  // New state for search and category filter
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

  // Close popup
  const closePopup = () => {
    setSelectedEntryIndex(null);
  };

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(dictionary.map((entry) => entry.category))
    );
    return ["All", ...uniqueCategories];
  }, [dictionary]);

  // Filter dictionary based on search query and category
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
            className="w-full outline-none"
          />
          <SearchIcon />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-1/3 p-2 rounded-md border-2 border-neutral-500 outline-none bg-neutral-500/20"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {filteredDictionary.length > 0 ? (
        <div className="w-full max-w-4xl">
          {filteredDictionary.map((entry, index) => (
            <div key={entry.id} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Verb {index + 1} ({entry.category})
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 bg-[#b41212]/90 ">Word</th>
                    <th
                      className="border px-4 py-2 sm:hidden w-[50px] bg-[#b41212]/90 "
                      style={{ width: "50px" }}
                    >
                      Details
                    </th>
                    <th className="border px-4 py-2 hidden sm:table-cell bg-[#b41212]/90 ">
                      Definition
                    </th>
                    <th className="border px-4 py-2 hidden sm:table-cell bg-[#b41212]/90 ">
                      Sentence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 bg-neutral-500/20 text-center">
                      {entry.translations.polish}
                    </td>
                    <td
                      className="border px-4 py-2 sm:hidden w-[50px] bg-neutral-500/20 text-center"
                      style={{ width: "50px" }}
                    >
                      <button
                        onClick={() => setSelectedEntryIndex(index)}
                        className="w-full flex items-center justify-center"
                      >
                        <EyeIcon className="text-blue-500" />
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20  text-center">
                      {entry.definitions.polish}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20  text-center">
                      {entry.sentences.polish}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 bg-neutral-500/20 text-center">
                      {entry.translations.english}
                    </td>
                    <td
                      className="border px-4 py-2 sm:hidden w-[50px] bg-neutral-500/20  text-center"
                      style={{ width: "50px" }}
                    >
                      <button
                        onClick={() => setSelectedEntryIndex(index)}
                        className="w-full flex items-center justify-center"
                      >
                        <EyeIcon className="text-blue-500" />
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20  text-center">
                      {entry.definitions.english}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20  text-center">
                      {entry.sentences.english}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 bg-neutral-500/20 text-center">
                      {entry.translations.spanish}
                    </td>
                    <td
                      className="border px-4 py-2 sm:hidden w-[50px] bg-neutral-500/20  text-center"
                      style={{ width: "50px" }}
                    >
                      <button
                        onClick={() => setSelectedEntryIndex(index)}
                        className="w-full flex items-center justify-center"
                      >
                        <EyeIcon className="text-blue-500" />
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20  text-center">
                      {entry.definitions.spanish}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20  text-center">
                      {entry.sentences.spanish}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No dictionary entries found.</p>
      )}

      {/* Popup for Mobile Details */}
      {selectedEntryIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">
              Verb {selectedEntryIndex + 1} Details (
              {filteredDictionary[selectedEntryIndex].category})
            </h3>
            <div className="mb-4">
              <h4 className="font-medium">Polish</h4>
              <p>
                <strong>Word:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].translations.polish}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].definitions.polish}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].sentences.polish}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium">English</h4>
              <p>
                <strong>Word:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].translations.english}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].definitions.english}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].sentences.english}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium">Spanish</h4>
              <p>
                <strong>Word:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].translations.spanish}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].definitions.spanish}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {filteredDictionary[selectedEntryIndex].sentences.spanish}
              </p>
            </div>
            <button
              onClick={closePopup}
              className="bg-red-500 text-white p-2 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
    </div>
  );
};

export default Dictionary;
