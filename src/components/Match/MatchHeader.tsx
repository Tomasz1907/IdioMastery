import { Timer, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  timeLeft: number;
  correct: number;
  wrong: number;
  combo: number;
}

const MatchHeader: React.FC<Props> = ({ timeLeft, combo }) => {
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-lg font-semibold">
      <div className="flex items-center gap-2">
        <Timer className="w-6 h-6" />

        <p className={`${timeLeft < 30 && "text-red-500"}`}>
          {formatTime(timeLeft)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        combo: {combo}
        {combo > 10 && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <Flame className="w-6 h-6 text-orange-500" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MatchHeader;
