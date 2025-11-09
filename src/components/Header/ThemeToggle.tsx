import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/button";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      className="relative w-16 h-8 p-0 overflow-hidden rounded-full bg-gray-800 px-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          x: theme === "dark" ? "-50%" : "50%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-full h-full bg-[#F6BE2C] rounded-full" />
      </motion.div>

      <div className="relative z-10 flex items-center justify-between w-full px-2">
        <motion.div
          animate={{
            opacity: theme === "dark" ? 1 : 0.5,
            scale: theme === "dark" ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Moon className="size-4 text-gray-800 dark:text-white" />
        </motion.div>

        <motion.div
          animate={{
            opacity: theme === "light" ? 1 : 0.5,
            scale: theme === "light" ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Sun className="size-4 text-gray-800 dark:text-white" />
        </motion.div>
      </div>

      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-gray-800 rounded-full shadow-md z-20 flex items-center justify-center"
        initial={false}
        animate={{
          x: theme === "light" ? 32 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {theme === "dark" ? (
          <Moon className="size-4 text-[#F6BE2C]" />
        ) : (
          <Sun className="size-4 text-[#F6BE2C]" />
        )}
      </motion.div>
    </Button>
  );
};

export default ThemeToggle;
