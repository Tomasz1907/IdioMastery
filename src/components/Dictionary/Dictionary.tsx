import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "@/FirebaseConfig";

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

  useEffect(() => {
    const auth = getAuth();

    const initializeAuth = async () => {
      try {
        // Set session persistence to `local` (persists even after page reloads)
        await setPersistence(auth, browserLocalPersistence);

        // Listen for auth state changes
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const db = database;
              const dictionaryRef = ref(db, `users/${user.uid}/dictionary`);
              const snapshot = await get(dictionaryRef);

              console.log("Snapshot data:", snapshot.val()); // Debugging log

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
        });
      } catch (err) {
        console.error("Error initializing authentication:", err);
        setError("An error occurred while restoring your session.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 text-center">Your Dictionary</h1>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Category</th>
            <th className="border px-4 py-2">Translations</th>
            <th className="border px-4 py-2">Sentence</th>
            <th className="border px-4 py-2">Definition</th>
          </tr>
        </thead>
        <tbody>
          {dictionary.map((entry) => (
            <tr key={entry.id}>
              <td className="border px-4 py-2">{entry.category}</td>
              <td className="border px-4 py-2">
                English: {entry.translations.english} <br />
                Polish: {entry.translations.polish} <br />
                Spanish: {entry.translations.spanish}
              </td>
              <td className="border px-4 py-2">
                English: {entry.sentences.english} <br />
                Polish: {entry.sentences.polish} <br />
                Spanish: {entry.sentences.spanish}
              </td>
              <td className="border px-4 py-2">
                English: {entry.definitions.english} <br />
                Polish: {entry.definitions.polish} <br />
                Spanish: {entry.definitions.spanish}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dictionary;
