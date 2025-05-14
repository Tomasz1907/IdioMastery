import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth, database } from "@/../FirebaseConfig";
import { ref, get } from "firebase/database";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Star } from "lucide-react";

interface DictionaryEntry {
  timestamp: number;
}

interface ChartData {
  name: string;
  value: number;
}

const Profile = () => {
  const user = auth.currentUser;
  const avatarSrc = user?.photoURL || undefined;

  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [timeRange, setTimeRange] = useState<
    "day" | "week" | "month" | "year" | "all"
  >("day");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch user dictionary from Firebase
  useEffect(() => {
    const fetchDictionary = async () => {
      if (!user) return;

      try {
        const dictionaryRef = ref(database, `users/${user.uid}/dictionary`);
        const snapshot = await get(dictionaryRef);

        if (snapshot.exists()) {
          const data = Object.values(snapshot.val()) as DictionaryEntry[];
          setDictionary(data);
          setTotalWords(data.length);
        } else {
          setDictionary([]);
          setTotalWords(0);
        }
      } catch (error) {
        console.error("Error fetching dictionary:", error);
        toast.error("Failed to fetch dictionary.");
      }
    };

    fetchDictionary();
  }, [user]);

  // Process data for the chart
  useEffect(() => {
    if (!dictionary.length) return;

    const now = new Date();
    let filteredData = dictionary.filter(
      (entry) => entry.timestamp <= now.getTime()
    ); // Exclude future data

    if (timeRange === "day") {
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 23, 0, 0, 0);

      filteredData = filteredData.filter(
        (entry) => entry.timestamp >= last24Hours.getTime()
      );

      // Group data by hour
      const groupedData = filteredData.reduce((acc, entry) => {
        const hour = new Date(entry.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Prepare data for the chart
      const labels = Array.from({ length: 24 }, (_, i) => {
        const hour = (last24Hours.getHours() + i) % 24;
        return `${hour}:00`;
      });
      const data = labels.map((label, i) => ({
        name: label,
        value: groupedData[(last24Hours.getHours() + i) % 24] || 0,
      }));

      setChartData(data);
    } else if (timeRange === "week") {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 6);

      filteredData = filteredData.filter(
        (entry) => entry.timestamp >= last7Days.getTime()
      );

      // Group data by day
      const groupedData = filteredData.reduce((acc, entry) => {
        const day = new Date(entry.timestamp).toLocaleDateString("en-US", {
          weekday: "long",
        });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Prepare data for the chart
      const labels = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(last7Days);
        day.setDate(last7Days.getDate() + i);
        return day.toLocaleDateString("en-US", { weekday: "long" });
      });
      const data = labels.map((day) => ({
        name: day,
        value: groupedData[day] || 0,
      }));

      setChartData(data);
    } else if (timeRange === "month") {
      const last4Weeks = new Date();
      last4Weeks.setDate(last4Weeks.getDate() - 27);

      filteredData = filteredData.filter(
        (entry) => entry.timestamp >= last4Weeks.getTime()
      );

      // Group data by week
      const groupedData = filteredData.reduce((acc, entry) => {
        const week = Math.ceil(new Date(entry.timestamp).getDate() / 7); // Week of the month
        acc[week] = (acc[week] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Prepare data for the chart
      const labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      const data = labels.map((week, index) => ({
        name: week,
        value: groupedData[index + 1] || 0,
      }));

      setChartData(data);
    } else if (timeRange === "year") {
      const currentYear = now.getFullYear();
      filteredData = filteredData.filter(
        (entry) => new Date(entry.timestamp).getFullYear() === currentYear
      );

      // Group data by month
      const groupedData = filteredData.reduce((acc, entry) => {
        const month = new Date(entry.timestamp).toLocaleDateString("en-US", {
          month: "long",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Prepare data for the chart
      const labels = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].slice(0, now.getMonth() + 1);
      const data = labels.map((month) => ({
        name: month,
        value: groupedData[month] || 0,
      }));

      setChartData(data);
    } else {
      // All time data
      const groupedData = filteredData.reduce((acc, entry) => {
        const monthYear = new Date(entry.timestamp).toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        );
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Prepare data for the chart
      const labels = Object.keys(groupedData).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      const data = labels.map((monthYear) => ({
        name: monthYear,
        value: groupedData[monthYear] || 0,
      }));

      setChartData(data);
    }
  }, [dictionary, timeRange]);

  const handleDeleteAccount = async () => {
    if (user && password) {
      try {
        setErrorMessage("");
        const credential = EmailAuthProvider.credential(
          String(user.email),
          password
        );
        await reauthenticateWithCredential(user, credential);
        await user.delete();
        toast.success("Your account has been deleted successfully.");
      } catch (error) {
        console.error("Error deleting account:", error);
        setErrorMessage(
          "Failed to delete account. Please check your password and try again."
        );
      }
    } else {
      setErrorMessage("Please enter your password.");
    }
  };

  return (
    <div className="flex items-center justify-center text-xl">
      <div className="flex flex-col items-center gap-5 bg-neutral-500/10 rounded w-[300px] md:w-[600px] px-5 pb-5 pt-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-16 h-16 text-[#b41212] text-3xl">
            <AvatarImage src={avatarSrc} alt="avatar" />
            <AvatarFallback>
              {user?.email?.slice(0, 1)?.toUpperCase()}
              {user?.email?.slice(1, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {user?.displayName && (
          <p className="text-2xl font-bold">{user?.displayName}</p>
        )}
        <p>{user?.email}</p>
        <div className="flex gap-2">
          <p>Total Words: {totalWords}</p>
          <Star className="text-amber-500" />
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setTimeRange("day")}>
            Day
          </Button>
          <Button variant="secondary" onClick={() => setTimeRange("week")}>
            Week
          </Button>
          <Button variant="secondary" onClick={() => setTimeRange("month")}>
            Month
          </Button>
          <Button variant="secondary" onClick={() => setTimeRange("year")}>
            Year
          </Button>
          <Button variant="secondary" onClick={() => setTimeRange("all")}>
            All
          </Button>
        </div>
        <ResponsiveContainer
          width="100%"
          height={300}
          className="bg-neutral-500/20 py-5 pr-8 rounded-xl my-2"
        >
          <LineChart data={chartData}>
            <CartesianGrid
              strokeOpacity={0.5}
              strokeWidth={0.5}
              stroke="#121212"
              enableBackground="true"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#B41212"
              strokeWidth={3}
              dot={false}
            />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
        <Button
          variant="destructive"
          className="text-xl"
          onClick={() => setIsModalOpen(true)}
        >
          Delete Account
        </Button>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-neutral-500/40 backdrop-blur-lg rounded-lg p-6 w-[90%] max-w-[400px]">
              <h2 className="text-red-500 text-lg font-bold mb-4">Warning!</h2>
              <p className="mb-4">
                Deleting your account is irreversible. Please enter your
                password to confirm.
              </p>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-2 border rounded mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
              )}
              <div className="flex gap-4 justify-end">
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Confirm Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
