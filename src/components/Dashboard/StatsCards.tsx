import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Flame, Trophy, Zap } from "lucide-react";
import { database } from "@/../FirebaseConfig";
import { ref, get } from "firebase/database";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
}
interface QuizResult {
  score: number;
  totalQuestions: number;
  timestamp: number;
}
interface MatchResult {
  correct: number;
  wrong: number;
  highestCombo: number;
  timestamp: number;
}

const StatsCards = () => {
  const { user } = useAuth();
  const [totalWords, setTotalWords] = useState<number | null>(null);
  const [learningStreak, setLearningStreak] = useState<number | null>(null);
  const [quizPerformance, setQuizPerformance] = useState<number | null>(null);
  const [bestCombo, setBestCombo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setTotalWords(0);
        setLearningStreak(0);
        setQuizPerformance(0);
        setBestCombo(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // 1. Dictionary
        const dictSnap = await get(
          ref(database, `users/${user.uid}/dictionary`)
        );
        setTotalWords(
          dictSnap.exists() ? Object.keys(dictSnap.val()).length : 0
        );

        // 2. Streak
        const streakSnap = await get(ref(database, `users/${user.uid}/streak`));
        if (streakSnap.exists()) {
          const data = streakSnap.val() as StreakData;
          const today = new Date().toISOString().split("T")[0];
          const diff =
            (new Date(today).getTime() -
              new Date(data.lastActiveDate).getTime()) /
            (1000 * 3600 * 24);
          setLearningStreak(diff <= 1 ? data.currentStreak : 0);
        } else {
          setLearningStreak(0);
        }

        // 3. Quiz
        const quizSnap = await get(
          ref(database, `users/${user.uid}/quizResults`)
        );
        if (quizSnap.exists()) {
          const results = Object.values(quizSnap.val()) as QuizResult[];
          const totalScore = results.reduce((s, r) => s + r.score, 0);
          const totalQ = results.reduce((s, r) => s + r.totalQuestions, 0);
          setQuizPerformance(
            totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0
          );
        } else {
          setQuizPerformance(0);
        }

        // 4. Match Game — Highest Combo
        const matchSnap = await get(
          ref(database, `users/${user.uid}/matchResults`)
        );
        if (matchSnap.exists()) {
          const results = Object.values(matchSnap.val()) as MatchResult[];
          const maxCombo = Math.max(...results.map((r) => r.highestCombo), 0);
          setBestCombo(maxCombo);
        } else {
          setBestCombo(0);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to fetch stats.");
        setTotalWords(0);
        setLearningStreak(0);
        setQuizPerformance(0);
        setBestCombo(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const cards = [
    {
      title: "Total Sentences Learned",
      value: totalWords,
      icon: <BookOpen className="w-6 h-6 text-[#F6BE2C]" />,
      suffix: "Saved",
      message: "Check your dictionary",
    },
    {
      title: "Learning Streak",
      value: learningStreak,
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      suffix: " Days",
      message:
        learningStreak && learningStreak > 0
          ? "Keep it up!"
          : "Start learning!",
    },
    {
      title: "Quiz Performance",
      value: quizPerformance,
      icon: <Trophy className="w-6 h-6 text-[#F6BE2C]" />,
      suffix: "%",
      message: "Average score",
    },
    {
      title: "Match Master",
      value: bestCombo,
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      suffix: "",
      message:
        bestCombo && bestCombo > 0 ? "Best combo!" : "Play to set record!",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              delay: i * 0.15,
              type: "spring",
              stiffness: 300,
              damping: 20,
            },
          }}
          className="h-full"
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {card.title}
                </CardTitle>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-10 w-24 bg-[var(--color-muted)] animate-pulse rounded-md" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                        delay: 0.1,
                      },
                    }}
                    className="text-3xl font-bold"
                  >
                    {card.value ?? 0}
                  </motion.span>
                  {card.suffix && (
                    <span className="text-lg font-medium text-muted-foreground">
                      {card.suffix}
                    </span>
                  )}
                </div>
              )}
              {card.message && !loading && (
                <p className="text-sm text-muted-foreground mt-1">
                  {card.message}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
