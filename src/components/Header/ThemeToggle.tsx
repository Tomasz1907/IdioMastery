import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/button";
import { Sun, Moon } from "lucide-react";
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} variant="ghost" className="text-xl">
      {theme === "light" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
