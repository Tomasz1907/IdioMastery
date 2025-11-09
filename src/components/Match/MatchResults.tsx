import { Button } from "@/components/ui/button";
import { Trophy, XCircle, Flame, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  results: { correct: number; wrong: number; highestCombo: number };
  onReset: () => void;
}

const MatchResults: React.FC<Props> = ({ results, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-6 w-full"
    >
      <h2 className="text-3xl font-bold ">Time's Up!</h2>

      <div className="grid grid-cols-3 gap-4 text-lg">
        {/* CORRECT */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="p-5 bg-green-100 rounded-xl shadow-sm border border-green-200"
        >
          <Trophy className="w-9 h-9 mx-auto text-green-600 mb-2" />
          <p className="text-2xl font-bold text-green-700">{results.correct}</p>
          <p className="text-sm text-green-600">Correct</p>
        </motion.div>

        {/* WRONG */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="p-5 bg-red-100 rounded-xl shadow-sm border border-red-200"
        >
          <XCircle className="w-9 h-9 mx-auto text-red-600 mb-2" />
          <p className="text-2xl font-bold text-red-700">{results.wrong}</p>
          <p className="text-sm text-red-600">Wrong</p>
        </motion.div>

        {/* BEST COMBO */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="p-5 bg-orange-100 rounded-xl shadow-sm border border-orange-200"
        >
          <Flame
            className={`w-9 h-9 mx-auto mb-2 ${
              results.highestCombo >= 5 ? "text-orange-600" : "text-orange-400"
            }`}
          />
          <p className="text-2xl font-bold text-orange-700">
            {results.highestCombo}
          </p>
          <p className="text-sm text-orange-600">Best Combo</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button onClick={onReset} size="lg" className="w-full mt-4">
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default MatchResults;
