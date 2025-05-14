import { StarIcon, Volume2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Define the type for dictionary entries
type DictionaryEntry = {
  id?: string;
  english: string;
  spanish: string;
  saved?: boolean;
  timestamp?: number;
};

interface DictionaryTableProps {
  entries: DictionaryEntry[];
  onSaveWord?: (word: DictionaryEntry, index: number) => void; // For Learn page
  onRemoveWord?: (word: DictionaryEntry, index: number) => void; // For Dictionary page
}

const DictionaryTable = ({
  entries,
  onSaveWord,
  onRemoveWord,
}: DictionaryTableProps) => {
  // Text-to-speech function
  const speakWord = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; // en-US for English, es-ES for Spanish
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {entries.length > 0 ? (
        <div className="w-full max-w-4xl">
          {entries.map((entry, index) => (
            <div
              key={entry.id || index}
              className="mb-6 rounded-lg p-4 sm:p-0 shadow-sm"
            >
              {/* Card view for small screens */}
              <div className="block md:hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Word {index + 1}</h3>
                  <StarIcon
                    onClick={() =>
                      entry.saved
                        ? onRemoveWord && onRemoveWord(entry, index)
                        : onSaveWord && onSaveWord(entry, index)
                    }
                    className={`w-6 h-6 cursor-pointer ${
                      entry.saved
                        ? "text-yellow-500 hover:text-yellow-400"
                        : "text-gray-400 hover:text-gray-500"
                    }`}
                    aria-label={
                      entry.saved
                        ? `Unsave Word ${index + 1}`
                        : `Save Word ${index + 1}`
                    }
                  />
                </div>
                <div className="mb-2">
                  <span className="font-bold">English:</span> {entry.english}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speakWord(entry.english, "en-US")}
                    className="ml-2 text-gray-500 hover:text-blue-500"
                    aria-label={`Speak ${entry.english}`}
                  >
                    <Volume2Icon className="w-5 h-5" />
                  </Button>
                </div>
                <div className="mb-2">
                  <span className="font-bold">Spanish:</span> {entry.spanish}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speakWord(entry.spanish, "es-ES")}
                    className="ml-2 text-gray-500 hover:text-blue-500"
                    aria-label={`Speak ${entry.spanish}`}
                  >
                    <Volume2Icon className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Table view for larger screens */}
              <div className="rounded-xl hidden md:block">
                <div className="bg-red-700 rounded-t-lg flex items-center justify-between p-4">
                  <h3 className="text-white text-lg">Word {index + 1}</h3>
                  <StarIcon
                    onClick={() =>
                      entry.saved
                        ? onRemoveWord && onRemoveWord(entry, index)
                        : onSaveWord && onSaveWord(entry, index)
                    }
                    className={`w-6 h-6 cursor-pointer ${
                      entry.saved
                        ? "text-yellow-500 hover:text-white"
                        : "text-white hover:text-yellow-500"
                    }`}
                    aria-label={
                      entry.saved
                        ? `Unsave Word ${index + 1}`
                        : `Save Word ${index + 1}`
                    }
                  />
                </div>
                <Table className="bg-neutral-300/10 table-auto w-full rounded-lg rounded-t-none">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2 p-2 text-center">
                        English
                      </TableHead>
                      <TableHead className="w-1/2 p-2 text-center">
                        Spanish
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center p-2">
                        <div className="flex items-center justify-center gap-2">
                          <span>{entry.english}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speakWord(entry.english, "en-US")}
                            className="text-neutral-500 hover:text-blue-500"
                            aria-label={`Speak ${entry.english}`}
                          >
                            <Volume2Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center p-2">
                        <div className="flex items-center justify-center gap-2">
                          <span>{entry.spanish}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speakWord(entry.spanish, "es-ES")}
                            className="text-gray-500 hover:text-blue-500"
                            aria-label={`Speak ${entry.spanish}`}
                          >
                            <Volume2Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm sm:text-xs">No words found.</p>
      )}
    </>
  );
};

export default DictionaryTable;
