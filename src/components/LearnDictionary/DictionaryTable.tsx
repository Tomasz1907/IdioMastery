import { StarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DictionaryEntry } from "@/lib/types/DictionaryEntry";
import { motion } from "framer-motion";

interface DictionaryTableProps {
  entries: DictionaryEntry[];
  onSaveWord?: (word: DictionaryEntry, index: number) => void;
  onRemoveWord?: (word: DictionaryEntry, index: number) => void;
}

const DictionaryTable = ({
  entries,
  onSaveWord,
  onRemoveWord,
}: DictionaryTableProps) => {
  return (
    <>
      {entries.length > 0 ? (
        <div className="w-full max-w-4xl">
          {entries.map((entry, index) => (
            <div key={entry.id || index} className="mb-6 rounded-lg shadow-sm">
              {/* Card view for small screens */}
              <div className="block md:hidden bg-neutral-300/10 rounded-xl">
                <div className="bg-slate-700 p-4 rounded-t-xl flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#F6BE2C]">
                    Sentence {index + 1}
                  </h3>

                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <StarIcon
                      onClick={() =>
                        entry.saved
                          ? onRemoveWord && onRemoveWord(entry, index)
                          : onSaveWord && onSaveWord(entry, index)
                      }
                      fill={entry.saved ? "currentColor" : "none"}
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        entry.saved
                          ? "text-[#F6BE2C] hover:text-[#F6BE2C]"
                          : "text-white hover:text-[#F6BE2C]"
                      }`}
                      aria-label={
                        entry.saved
                          ? `Unsave Word ${index + 1}`
                          : `Save Word ${index + 1}`
                      }
                    />
                  </motion.div>
                </div>

                <div className="mb-2 p-4 border-b-2 border-neutral-300">
                  <span className="font-bold">English:</span> {entry.english}
                </div>

                <div className="mb-2 p-4">
                  <span className="font-bold">Spanish:</span> {entry.spanish}
                </div>
              </div>

              {/* Table view for larger screens */}
              <div className="rounded-xl hidden md:block font-serif">
                <div className="bg-slate-700 rounded-t-lg flex items-center justify-between p-4">
                  <h3 className="text-[#F6BE2C] text-lg">
                    Sentence {index + 1}
                  </h3>

                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 20 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <StarIcon
                      onClick={() =>
                        entry.saved
                          ? onRemoveWord && onRemoveWord(entry, index)
                          : onSaveWord && onSaveWord(entry, index)
                      }
                      fill={entry.saved ? "currentColor" : "none"}
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        entry.saved
                          ? "text-[#F6BE2C] hover:text-[#F6BE2C]"
                          : "text-white hover:text-[#F6BE2C]"
                      }`}
                      aria-label={
                        entry.saved
                          ? `Unsave Word ${index + 1}`
                          : `Save Word ${index + 1}`
                      }
                    />
                  </motion.div>
                </div>

                <Table className="bg-neutral-300/10 table-auto w-full rounded-lg rounded-t-none">
                  <TableHeader>
                    <TableRow className="border-b-2 border-neutral-300">
                      <TableHead className="w-1/2 p-2 text-center text-sky-600 text-lg">
                        English
                      </TableHead>
                      <TableHead className="w-1/2 p-2 text-center text-sky-600 text-lg">
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
                        <div className="flex items-center justify-center text-lg">
                          <span>{entry.english}</span>
                        </div>
                      </TableCell>

                      <TableCell
                        className="text-center p-2 break-words"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <div className="flex items-center justify-center text-lg">
                          <span>{entry.spanish}</span>
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
        <p className="text-center text-sm sm:text-xs">No sentences found.</p>
      )}
    </>
  );
};

export default DictionaryTable;
