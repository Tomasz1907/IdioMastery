// filepath: c:\Krupa - praktykant\Idiomastery\src\types\DictionaryEntry.ts
export type DictionaryEntry = {
  id?: string | null; // Allow null for id
  english: string;
  spanish: string;
  saved?: boolean;
  timestamp?: number;
};
