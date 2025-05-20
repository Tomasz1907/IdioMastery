import { DictionaryEntry } from "@/lib/types/DictionaryEntry";

export interface DictionaryTableProps {
  entries: DictionaryEntry[];
  onSaveWord?: (word: DictionaryEntry, index: number) => void;
  onRemoveWord: (word: DictionaryEntry, index: number) => Promise<void>;
}
