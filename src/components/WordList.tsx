import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DictionaryTable from "@/components/DictionaryTable";
import ErrorDisplay from "@/components/ErrorDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import { WordListProps } from "@/lib/types/WordListProps";

const WordList: React.FC<WordListProps> = ({
  entries,
  words,
  error,
  loading,
  onSaveWord,
  onRemoveWord,
}) => {
  const displayWords = words || entries || []; // Use words if provided, fallback to entries, then empty array

  return (
    <>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {displayWords.length > 0 ? (
        <DictionaryTable
          entries={displayWords}
          onSaveWord={onSaveWord || (() => Promise.resolve())}
          onRemoveWord={onRemoveWord}
        />
      ) : (
        !loading && <p>No saved words found.</p>
      )}
    </>
  );
};

export default WordList;
