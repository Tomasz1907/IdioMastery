import { DictionaryEntry } from "@/lib/types/DictionaryEntry";

export interface WordListProps {
  entries?: DictionaryEntry[];
  words?: DictionaryEntry[];
  error?: string;
  loading?: boolean;
  onSaveWord?: (word: DictionaryEntry, index: number) => Promise<void>;
  onRemoveWord: (word: DictionaryEntry, index: number) => Promise<void>;
}
