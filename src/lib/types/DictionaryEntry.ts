export type DictionaryEntry = {
  id?: string | null;
  english: string;
  spanish: string;
  saved?: boolean;
  timestamp?: number;
};

export type QuizQuestion = {
  word: string;
  correctTranslation: string;
  options: string[];
  sourceLang: "english" | "spanish";
  targetLang: "english" | "spanish";
  userAnswer: string | null;
};
