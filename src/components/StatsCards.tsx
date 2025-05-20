import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { database } from "@/../FirebaseConfig";
import { ref, get } from "firebase/database";
import { toast } from "sonner";

interface DictionaryEntry {
  english: string;
  spanish: string;
  timestamp: number;
}

interface StreakData {
  currentStreak: number;
  lastActiveDate: string; // ISO date string, e.g., "2025-05-20"
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  timestamp: number;
}

const StatsCards = () => {
  const { user } = useAuth();
  const [totalWords, setTotalWords] = useState<number | null>(null);
  const [learningStreak, setLearningStreak] = useState<number | null>(null);
  const [quizPerformance, setQuizPerformance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user stats from Firebase
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setTotalWords(0);
        setLearningStreak(0);
        setQuizPerformance(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch Total Words
        const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
        const dictionarySnapshot = await get(dictionaryRef);
        if (dictionarySnapshot.exists()) {
          const data = Object.values(
            dictionarySnapshot.val()
          ) as DictionaryEntry[];
          setTotalWords(data.length);
        } else {
          setTotalWords(0);
        }

        // Fetch Learning Streak
        const streakRef = ref(database, `users/${user.uid}/streak`);
        const streakSnapshot = await get(streakRef);
        if (streakSnapshot.exists()) {
          const streakData = streakSnapshot.val() as StreakData;
          const today = new Date().toISOString().split("T")[0]; // e.g., "2025-05-20"
          const lastActive = streakData.lastActiveDate;
          const isConsecutive =
            new Date(today).getTime() - new Date(lastActive).getTime() <=
            24 * 60 * 60 * 1000; // Within 24 hours
          setLearningStreak(isConsecutive ? streakData.currentStreak : 0);
        } else {
          setLearningStreak(0);
        }

        // Fetch Quiz Performance
        const quizRef = ref(database, `users/${user.uid}/quizResults`);
        const quizSnapshot = await get(quizRef);
        if (quizSnapshot.exists()) {
          const quizData = Object.values(quizSnapshot.val()) as QuizResult[];
          const totalScore = quizData.reduce(
            (sum, result) => sum + result.score,
            0
          );
          const totalQuestions = quizData.reduce(
            (sum, result) => sum + result.totalQuestions,
            0
          );
          const averageScore =
            totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
          setQuizPerformance(Math.round(averageScore));
        } else {
          setQuizPerformance(0);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to fetch stats. Please try again.");
        setTotalWords(0);
        setLearningStreak(0);
        setQuizPerformance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Total Sentences Learned
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-16 bg-[var(--color-muted)] animate-pulse rounded-[var(--radius-sm)]" />
          ) : (
            <>
              <Star className="text-amber-500" />
              <span className="text-2xl font-semibold">{totalWords ?? 0}</span>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-24 bg-[var(--color-muted)] animate-pulse rounded-[var(--radius-sm)]" />
          ) : (
            <>
              <span className="text-2xl font-semibold">
                {learningStreak ?? 0} Days
              </span>
              <p className="text-sm text-muted-foreground">
                {learningStreak && learningStreak > 0
                  ? "Keep it up!"
                  : "Start learning!"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Quiz Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-24 bg-[var(--color-muted)] animate-pulse rounded-[var(--radius-sm)]" />
          ) : (
            <>
              <span className="text-2xl font-semibold">
                {quizPerformance ?? 0}%
              </span>
              <p className="text-sm text-muted-foreground">Average score</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
