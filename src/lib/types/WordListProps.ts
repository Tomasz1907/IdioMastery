import { DictionaryEntry } from "@/lib/types/DictionaryEntry";

export interface WordListProps {
  entries?: DictionaryEntry[]; // Optional for Learn.tsx (uses 'words')
  words?: DictionaryEntry[]; // Optional for Learn.tsx
  error?: string; // Optional for Learn.tsx
  loading?: boolean; // Optional for Learn.tsx
  onSaveWord?: (word: DictionaryEntry, index: number) => Promise<void>; // Optional for Learn.tsx
  onRemoveWord: (word: DictionaryEntry, index: number) => Promise<void>; // Required for both
}
