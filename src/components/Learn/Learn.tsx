import { useState } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push } from "firebase/database";

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
    const auth = getAuth();
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
      const OPENAI_API_KEY = "your-openai-api-key"; // Replace with your OpenAI API key

      // Make a POST request to OpenAI's Chat API
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a language expert that provides translations, sentences, and definitions.",
              },
              {
                role: "user",
                content: `Provide 10 Polish-English-Spanish verbs along with a short sentence and a short definition for each word related to the topic "${topic}".`,
              },
            ],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const rows = data.choices[0].message.content
          .split("\n")
          .filter((line: any) => line.trim() !== "") // Remove empty lines
          .map((line: any) => {
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
            ] = line.split("|").map((item: any) => item.trim());
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

        setData(rows);

        // Save to Firebase Realtime Database
        const db = getDatabase();
        const dictionaryRef = ref(db, `users/${user.uid}/dictionary`);
        rows.forEach((row: any) => {
          const newDictionaryEntry = {
            category: topic,
            translations: row.translations,
            sentences: row.sentences,
            definitions: row.definitions,
          };
          push(dictionaryRef, newDictionaryEntry);
        });
      } else {
        throw new Error(data.error?.message || "Failed to fetch words.");
      }
    } catch (err) {
      console.error("Error fetching words:", err);
      setError("Could not fetch the words. Please try again.");
    } finally {
      setLoading(false);
    }
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
        className="bg-green-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get Words"}
      </button>

      {/* Display Words in Table */}
      {data.length > 0 && (
        <div className="mt-4 w-full max-w-md">
          <h2 className="text-xl mb-2">Your New Words</h2>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr>
                <th className="border px-4 py-2">Word</th>
                <th className="border px-4 py-2">Sentence</th>
                <th className="border px-4 py-2">Definition</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    {row.translations.polish} - {row.translations.english} -{" "}
                    {row.translations.spanish}
                  </td>
                  <td className="border px-4 py-2">
                    {row.sentences.polish} - {row.sentences.english} -{" "}
                    {row.sentences.spanish}
                  </td>
                  <td className="border px-4 py-2">
                    {row.definitions.polish} - {row.definitions.english} -{" "}
                    {row.definitions.spanish}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default Learn;
