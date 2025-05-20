import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(inputValue, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  return (
    <div className="relative mb-6">
      <Input
        type="text"
        placeholder="Search by word..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full pr-10 focus:ring-2 focus:ring-[#b41212] border-neutral-300 bg-[var(--color-input)] text-[var(--color-foreground)] rounded-[var(--radius-md)]"
      />
      <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
    </div>
  );
};

export default SearchBar;
