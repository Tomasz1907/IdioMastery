import { motion } from "framer-motion";

interface Props {
  text: string;
  isSelected: boolean;
  onClick: () => void;
  correct: boolean;
  wrong: boolean;
}

const MatchCard: React.FC<Props> = ({
  text,
  isSelected,
  onClick,
  correct,
  wrong,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.9,
        backgroundColor: "#f0fdf4",
        borderColor: "#22c55e",
        transition: { duration: 0.3 },
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`shadow-md relative p-2 md:p-6 rounded-md h-full flex items-center justify-center md:rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? correct
            ? "border-green-500 bg-green-500/20"
            : wrong
            ? "border-red-500 bg-red-500/20"
            : "border-blue-500 bg-blue-500/20"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      {/* RED FLASH on wrong */}
      {wrong && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.3, times: [0, 0.15, 1] }}
          className="absolute inset-0 bg-red-500/50 rounded-xl pointer-events-none"
        />
      )}

      {/* SHAKE on wrong */}
      {wrong && (
        <motion.div
          animate={{ x: [-16, 16, -16, 16, -8, 8, 0] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {/* GREEN FADE on correct */}
      {correct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute inset-0 bg-green-500/30 rounded-xl pointer-events-none"
        />
      )}

      <p className="text-sm md:text-lg font-medium text-center break-words">
        {text}
      </p>
    </motion.div>
  );
};

export default MatchCard;
