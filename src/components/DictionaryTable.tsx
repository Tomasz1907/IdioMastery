import { EyeIcon } from "lucide-react";

// Define the type for dictionary entries
type DictionaryEntry = {
  id?: string; // Optional for Learn compatibility
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

interface DictionaryTableProps {
  entries: DictionaryEntry[];
  selectedEntryIndex: number | null;
  setSelectedEntryIndex: (index: number | null) => void;
  closePopup: () => void;
}

const DictionaryTable = ({
  entries,
  selectedEntryIndex,
  setSelectedEntryIndex,
  closePopup,
}: DictionaryTableProps) => {
  return (
    <>
      {entries.length > 0 ? (
        <div className="w-full max-w-4xl">
          {entries.map((entry, index) => (
            <div key={entry.id || index} className="mb-6">
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
                    <td className="border px-4 py-2 bg-neutral-500/20  text-center">
                      {entry.translations.polish}
                    </td>
                    <td
                      className="border px-4 py-2 sm:hidden w-[50px] bg-neutral-500/20 text-center"
                      style={{ width: "50px" }}
                    >
                      <button
                        onClick={() => setSelectedEntryIndex(index)}
                        className="w-full flex items-center justify-center"
                        aria-label="View details"
                      >
                        <EyeIcon className="text-blue-500 w-5 h-5" />
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20 text-center">
                      {entry.definitions.polish}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20  text-center">
                      {entry.sentences.polish}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 bg-neutral-500/20  text-center">
                      {entry.translations.english}
                    </td>
                    <td
                      className="border px-4 py-2 sm:hidden w-[50px] bg-neutral-500/20 text-center"
                      style={{ width: "50px" }}
                    >
                      <button
                        onClick={() => setSelectedEntryIndex(index)}
                        className="w-full flex items-center justify-center"
                        aria-label="View details"
                      >
                        <EyeIcon className="text-blue-500 w-5 h-5" />
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20 text-center">
                      {entry.definitions.english}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20 text-center">
                      {entry.sentences.english}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 bg-neutral-500/20 text-center">
                      {entry.translations.spanish}
                    </td>
                    <td
                      className="border px-4 py-2 sm:hidden w-[50px] bg-neutral-500/20 text-center"
                      style={{ width: "50px" }}
                    >
                      <button
                        onClick={() => setSelectedEntryIndex(index)}
                        className="w-full flex items-center justify-center"
                        aria-label="View details"
                      >
                        <EyeIcon className="text-blue-500 w-5 h-5" />
                      </button>
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20 text-center">
                      {entry.definitions.spanish}
                    </td>
                    <td className="border px-4 py-2 hidden sm:table-cell bg-neutral-500/20 text-center">
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
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50">
          <div className="bg-neutral-200/80 text-black backdrop-blur-lg p-6 rounded-lg max-w-lg w-full mx-5 drop-shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Verb {selectedEntryIndex + 1} Details (
              {entries[selectedEntryIndex].category})
            </h3>
            <div className="mb-4">
              <h4 className="font-medium">Polish</h4>
              <p>
                <strong>Word:</strong>{" "}
                {entries[selectedEntryIndex].translations.polish}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {entries[selectedEntryIndex].definitions.polish}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {entries[selectedEntryIndex].sentences.polish}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium">English</h4>
              <p>
                <strong>Word:</strong>{" "}
                {entries[selectedEntryIndex].translations.english}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {entries[selectedEntryIndex].definitions.english}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {entries[selectedEntryIndex].sentences.english}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium">Spanish</h4>
              <p>
                <strong>Word:</strong>{" "}
                {entries[selectedEntryIndex].translations.spanish}
              </p>
              <p>
                <strong>Definition:</strong>{" "}
                {entries[selectedEntryIndex].definitions.spanish}
              </p>
              <p>
                <strong>Sentence:</strong>{" "}
                {entries[selectedEntryIndex].sentences.spanish}
              </p>
            </div>
            <button
              onClick={closePopup}
              className="bg-red-500 text-white p-2 rounded w-full hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DictionaryTable;
