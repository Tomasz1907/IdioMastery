import { useState } from "react";
import { auth, database } from "@/../FirebaseConfig"; // Adjust path for firebase.ts in root
import { ref, push, get, set } from "firebase/database";

const Learn = () => {
  const [topic, setTopic] = useState(""); // State for selected topic
  const [data, setData] = useState<
    {
      translations: { polish: string; english: string; spanish: string };
      sentences: { polish: string; english: string; spanish: string };
      definitions: { polish: string; english: string; spanish: string };
    }[]
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedVerbIndex, setSelectedVerbIndex] = useState<number | null>(
    null
  ); // State for popup

  const topics = [
    "food",
    "travel",
    "family",
    "emotions",
    "technology",
    "sports",
    "nature",
    "daily routine",
  ]; // List of available topics

  const handleFetchWords = async () => {
    setError("");
    setData([]);
    setLoading(true);

    // Check if user is authenticated
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
      // Check last fetch timestamp
      const lastFetchRef = ref(database, `users/${user.uid}/lastFetch`);
      const lastFetchSnapshot = await get(lastFetchRef);
      const lastFetch = lastFetchSnapshot.exists()
        ? lastFetchSnapshot.val()
        : 0;

      // Get current date boundaries (00:00 to 23:59)
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

      if (lastFetch >= todayStart && lastFetch <= todayEnd) {
        setError("You can only fetch words once per day. Try again tomorrow!");
        setLoading(false);
        return;
      }

      // Get API URL from environment variable
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is missing in environment variables.");
      }

      // Make a POST request to Gemini 1.5 Pro API
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
        // Parse the response text
        const rows = apiData.candidates[0].content.parts[0].text
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

        // Save to Firebase Realtime Database
        const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
        rows.forEach((row: any) => {
          const newDictionaryEntry = {
            category: topic,
            translations: row.translations,
            sentences: row.sentences,
            definitions: row.definitions,
          };
          push(dictionaryRef, newDictionaryEntry);
        });

        // Save the current timestamp
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

  // Close popup
  const closePopup = () => {
    setSelectedVerbIndex(null);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl mb-4">Learn Polish-English-Spanish Verbs</h1>

      {/* Topic Selection */}
      <div className="mb-4">
        <label htmlFor="topic" className="block mb-2">
          Select a Topic:
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">--Choose a Topic--</option>
          {topics.map((t, index) => (
            <option key={index} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Fetch Words Button */}
      <button
        onClick={handleFetchWords}
        className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get Words"}
      </button>

      {/* Display Words in Separate Tables */}
      {data.length > 0 && (
        <div className="mt-4 w-full max-w-4xl">
          <h2 className="text-xl mb-4">Your New Words</h2>
          {data.map((row, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Verb {index + 1}</h3>
              <table className="table-auto border-collapse border border-gray-300 w-full">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Word</th>
                    <th className="border px-4 py-2 sm:hidden">Details</th>
                    <th className="border px-4 py-2 hidden sm:table-cell">
                      Definition
                    </th>
                    <th className="border px-4 py-2 hidden sm:table-cell">
                      Sentence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2">
                      {row.translations.polish}
                    </td>
                    <td className="border px-4 py-2 sm:hidden">
                      <button onClick={() => setSelectedVerbIndex(index)}>
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell">
                      {row.definitions.polish}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell">
                      {row.sentences.polish}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-2">
                      {row.translations.english}
                    </td>
                    <td className="border px-4 py-2 sm:hidden">
                      <button onClick={() => setSelectedVerbIndex(index)}>
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell">
                      {row.definitions.english}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell">
                      {row.sentences.english}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2">
                      {row.translations.spanish}
                    </td>
                    <td className="border px-4 py-2 sm:hidden">
                      <button onClick={() => setSelectedVerbIndex(index)}>
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell">
                      {row.definitions.spanish}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell">
                      {row.sentences.spanish}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Popup for Mobile Details */}
      {selectedVerbIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">
              Verb {selectedVerbIndex + 1} Details
            </h3>
            <div className="mb-4">
              <h4 className="font-medium">Polish</h4>
              <p>
                <strong>Word:</strong>{" "}
                {data[selectedVerbIndex].translations.polish}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {data[selectedVerbIndex].definitions.polish}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {data[selectedVerbIndex].sentences.polish}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium">English</h4>
              <p>
                <strong>Word:</strong>{" "}
                {data[selectedVerbIndex].translations.english}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {data[selectedVerbIndex].definitions.english}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {data[selectedVerbIndex].sentences.english}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium">Spanish</h4>
              <p>
                <strong>Word:</strong>{" "}
                {data[selectedVerbIndex].translations.spanish}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {data[selectedVerbIndex].definitions.spanish}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {data[selectedVerbIndex].sentences.spanish}
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
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default Learn;
