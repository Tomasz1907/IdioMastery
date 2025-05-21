import { useAuth } from "@/context/AuthContext";
import StatsCards from "@/components/StatsCards";
import LearningProgress from "@/components/LearningProgress";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-serif">
          Welcome, {user?.displayName || user?.email}!
        </h1>
        <p className="mt-2">Ready to boost your vocabulary today?</p>
      </header>

      <StatsCards />

      <LearningProgress />
    </div>
  );
};

export default Dashboard;
