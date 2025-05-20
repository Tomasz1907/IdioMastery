import { database } from "@/../FirebaseConfig";
import { ref, get, set } from "firebase/database";
import { toast } from "sonner";

interface StreakData {
  currentStreak: number;
  lastActiveDate: string; // ISO date string, e.g., "2025-05-20"
}

export const updateStreak = async (uid: string) => {
  try {
    const streakRef = ref(database, `users/${uid}/streak`);
    const today = new Date().toISOString().split("T")[0]; // e.g., "2025-05-20"
    const streakSnapshot = await get(streakRef);
    let currentStreak = 0;

    if (streakSnapshot.exists()) {
      const streakData = streakSnapshot.val() as StreakData;
      const lastActive = streakData.lastActiveDate;

      if (lastActive === today) {
        // Already updated today, no change
        return;
      }

      const lastActiveDate = new Date(lastActive);
      const todayDate = new Date(today);
      const timeDiff = todayDate.getTime() - lastActiveDate.getTime();
      const isConsecutive = timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours

      currentStreak = isConsecutive ? streakData.currentStreak + 1 : 1;
    } else {
      currentStreak = 1; // First activity
    }

    await set(streakRef, { currentStreak, lastActiveDate: today });
  } catch (error) {
    console.error("Error updating streak:", error);
    toast.error("Failed to update learning streak.");
  }
};
