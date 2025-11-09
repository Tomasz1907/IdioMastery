import { database } from "@/../FirebaseConfig";
import { ref, get, set } from "firebase/database";
import { toast } from "sonner";

interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
}

export const updateStreak = async (uid: string) => {
  try {
    const streakRef = ref(database, `users/${uid}/streak`);
    const today = new Date().toISOString().split("T")[0];
    const streakSnapshot = await get(streakRef);
    let currentStreak = 0;

    if (streakSnapshot.exists()) {
      const streakData = streakSnapshot.val() as StreakData;
      const lastActive = streakData.lastActiveDate;

      if (lastActive === today) {
        return;
      }

      const lastActiveDate = new Date(lastActive);
      const todayDate = new Date(today);
      const timeDiff = todayDate.getTime() - lastActiveDate.getTime();
      const isConsecutive = timeDiff <= 24 * 60 * 60 * 1000;

      currentStreak = isConsecutive ? streakData.currentStreak + 1 : 1;
    } else {
      currentStreak = 1;
    }

    await set(streakRef, { currentStreak, lastActiveDate: today });
  } catch (error) {
    console.error("Error updating streak:", error);
    toast.error("Failed to update learning streak.");
  }
};
