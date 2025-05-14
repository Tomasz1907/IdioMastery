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
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";

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
    utterance.lang = lang; // Set language (e.g., en-US for English, es-ES for Spanish)

    // Select a specific voice for the language
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(
      (voice) =>
        lang === "es-ES"
          ? voice.lang === "es-ES" || voice.lang.startsWith("es") // Match Spanish voices
          : voice.lang === "en-US" || voice.lang.startsWith("en") // Match English voices
    );

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      console.warn(`No suitable voice found for language: ${lang}`);
    }

    // Adjust pitch, rate, and volume for better pronunciation
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1; // Normal pitch
    utterance.volume = 1; // Full volume

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {entries.length > 0 ? (
        <div className="w-full max-w-4xl">
          {entries.map((entry, index) => (
            <div key={entry.id || index} className="mb-6 rounded-lg shadow-sm">
              {/* Card view for small screens */}
              <div className="block md:hidden bg-neutral-300/10 rounded-xl">
                <div className="bg-red-700 p-4 rounded-t-xl flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    Word {index + 1}
                  </h3>
                  <StarIcon
                    onClick={() =>
                      entry.saved
                        ? onRemoveWord && onRemoveWord(entry, index)
                        : onSaveWord && onSaveWord(entry, index)
                    }
                    className={`w-6 h-6 cursor-pointer ${
                      entry.saved
                        ? "text-amber-500 hover:text-white"
                        : "text-white hover:text-amber-500"
                    }`}
                    aria-label={
                      entry.saved
                        ? `Unsave Word ${index + 1}`
                        : `Save Word ${index + 1}`
                    }
                  />
                </div>
                <div className="mb-2 p-4 border-b-2 border-neutral-300">
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
                <div className="mb-2 p-4">
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
                  <h3 className="text-white text-base">Word {index + 1}</h3>
                  <StarIcon
                    onClick={() =>
                      entry.saved
                        ? onRemoveWord && onRemoveWord(entry, index)
                        : onSaveWord && onSaveWord(entry, index)
                    }
                    className={`w-6 h-6 cursor-pointer ${
                      entry.saved
                        ? "text-amber-500 hover:text-white"
                        : "text-white hover:text-amber-500"
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
                    <TableRow className="border-b-2 border-neutral-300">
                      <TableHead className="w-1/2 p-2 text-center text-red-700">
                        English
                      </TableHead>
                      <TableHead className="w-1/2 p-2 text-center text-red-700">
                        Spanish
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="text-center p-2 break-words"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{entry.english}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speakWord(entry.english, "en-US")}
                            className="hover:text-blue-500"
                            aria-label={`Speak ${entry.english}`}
                          >
                            <Volume2Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-center p-2 break-words"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{entry.spanish}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speakWord(entry.spanish, "es-ES")}
                            className="hover:text-blue-500"
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
