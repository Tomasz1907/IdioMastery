import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { database } from "@/../FirebaseConfig";
import { ref, get } from "firebase/database";

interface DictionaryEntry {
  timestamp: number;
}

interface ChartData {
  name: string;
  value: number;
}

const LearningProgress = () => {
  const { user } = useAuth();
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "week"
  );
  const [chartData, setChartData] = useState<ChartData[]>([]);

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
        } else {
          setDictionary([]);
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
    );

    if (timeRange === "day") {
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 23, 0, 0, 0);

      filteredData = filteredData.filter(
        (entry) => entry.timestamp >= last24Hours.getTime()
      );

      const groupedData = filteredData.reduce((acc, entry) => {
        const hour = new Date(entry.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

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

      const groupedData = filteredData.reduce((acc, entry) => {
        const day = new Date(entry.timestamp).toLocaleDateString("en-US", {
          weekday: "long",
        });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

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

      const groupedData = filteredData.reduce((acc, entry) => {
        const week = Math.ceil(new Date(entry.timestamp).getDate() / 7);
        acc[week] = (acc[week] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

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

      const groupedData = filteredData.reduce((acc, entry) => {
        const month = new Date(entry.timestamp).toLocaleDateString("en-US", {
          month: "long",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

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
    }
  }, [dictionary, timeRange]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between items-center justify-center md:justify-between md:px-8">
          <CardTitle>Learning Progress</CardTitle>
          <Tabs defaultValue="week" className="mt-4 md:mt-0">
            <TabsList>
              <TabsTrigger value="day" onClick={() => setTimeRange("day")}>
                Day
              </TabsTrigger>
              <TabsTrigger value="week" onClick={() => setTimeRange("week")}>
                Week
              </TabsTrigger>
              <TabsTrigger value="month" onClick={() => setTimeRange("month")}>
                Month
              </TabsTrigger>
              <TabsTrigger value="year" onClick={() => setTimeRange("year")}>
                Year
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartData.length > 0 ? (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 40, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeOpacity={0.5}
                strokeWidth={0.5}
                stroke="#d1d5db"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#b41212"
                strokeWidth={3}
                dot={false}
              />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
            </LineChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">Learn words to track your progress</p>
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LearningProgress;
