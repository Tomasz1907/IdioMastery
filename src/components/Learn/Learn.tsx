import { useState } from "react";
import { auth, database } from "@/../FirebaseConfig";
import { ref, push, get, set } from "firebase/database";
import DictionaryTable from "../DictionaryTable"; // Adjust path as needed

// Define the type for dictionary entries to match DictionaryTable
type DictionaryEntry = {
  id?: string;
  category: string;
  translations: { polish: string; english: string; spanish: string };
  sentences: { polish: string; english: string; spanish: string };
  definitions: { polish: string; english: string; spanish: string };
};

const Learn = () => {
  const [topic, setTopic] = useState("");
  const [data, setData] = useState<DictionaryEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedVerbIndex, setSelectedVerbIndex] = useState<number | null>(
    null
  );

  const topics = [
    "food",
    "travel",
    "family",
    "emotions",
    "technology",
    "sports",
    "nature",
    "daily routine",
  ];

  const handleFetchWords = async () => {
    setError("");
    setData([]);
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to fetch words.");
      setLoading(false);
      return;
    }

    if (!topic) {
      setError("Please select a topic.");
      setLoading(false);
      return;
    }

    try {
      const lastFetchRef = ref(database, `users/${user.uid}/lastFetch`);
      const lastFetchSnapshot = await get(lastFetchRef);
      const lastFetch = lastFetchSnapshot.exists()
        ? lastFetchSnapshot.val()
        : 0;

      const now = new Date();
      const oneMinuteInMs = 60 * 1000; // 60 seconds in milliseconds

      if (lastFetch > now.getTime() - oneMinuteInMs) {
        setError("You can only fetch words once per minute. Try again soon!");
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is missing in environment variables.");
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Provide 20 Polish-English-Spanish verbs related to the topic "${topic}". For each verb, include a short sentence using the verb and a short definition. Format the output as pipe-separated values: polish|english|spanish|polishSentence|englishSentence|spanishSentence|polishDefinition|englishDefinition|spanishDefinition. One verb per line.`,
                },
              ],
            },
          ],
        }),
      });

      const apiData = await response.json();

      if (response.ok && apiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rows: DictionaryEntry[] =
          apiData.candidates[0].content.parts[0].text
            .split("\n")
            .filter((line: string) => line.trim() !== "")
            .map((line: string) => {
              const [
                polish,
                english,
                spanish,
                polishSentence,
                englishSentence,
                spanishSentence,
                polishDefinition,
                englishDefinition,
                spanishDefinition,
              ] = line.split("|").map((item: string) => item.trim());
              return {
                category: topic,
                translations: { polish, english, spanish },
                sentences: {
                  polish: polishSentence,
                  english: englishSentence,
                  spanish: spanishSentence,
                },
                definitions: {
                  polish: polishDefinition,
                  english: englishDefinition,
                  spanish: spanishDefinition,
                },
              };
            });

        if (rows.length < 20) {
          throw new Error("API returned fewer than 20 verbs.");
        }

        setData(rows);

        const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
        rows.forEach((row) => {
          const newDictionaryEntry = {
            category: row.category,
            translations: row.translations,
            sentences: row.sentences,
            definitions: row.definitions,
          };
          push(dictionaryRef, newDictionaryEntry);
        });

        await set(lastFetchRef, now.getTime());
      } else {
        throw new Error(apiData.error?.message || "Failed to fetch words.");
      }
    } catch (err) {
      console.error("Error fetching words:", err);
      setError("Could not fetch the words. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setSelectedVerbIndex(null);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl mb-4">Learn Polish-English-Spanish Verbs</h1>

      <div className="mb-4">
        <label htmlFor="topic" className="block mb-2">
          Select a Topic:
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="p-2 border rounded bg-neutral-500/50"
        >
          <option value="">--Choose a Topic--</option>
          {topics.map((t, index) => (
            <option key={index} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleFetchWords}
        className="bg-[#b41212] text-white p-2 rounded disabled:bg-neutral-400"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get Words"}
      </button>

      {data.length > 0 && (
        <div className="mt-4 w-full max-w-4xl">
          <h2 className="text-xl mb-4">Your New Words</h2>
          <DictionaryTable
            entries={data}
            selectedEntryIndex={selectedVerbIndex}
            setSelectedEntryIndex={setSelectedVerbIndex}
            closePopup={closePopup}
          />
        </div>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default Learn;
