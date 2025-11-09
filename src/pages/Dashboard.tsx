import { useAuth } from "@/context/AuthContext";
import StatsCards from "@/components/Dashboard/StatsCards";
import LearningProgress from "@/components/Dashboard/LearningProgress";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      <header className="mb-8">
        <h1
          style={{ fontFamily: "'Baloo 2', cursive" }}
          className="text-2xl lg:text-4xl font-bold font-serif text-center"
        >
          Welcome, {user?.displayName || user?.email}!
        </h1>
        <p className="mt-2 text-center text-base lg:text-lg">
          Ready to boost your vocabulary today?
        </p>
      </header>
      <StatsCards />
      <LearningProgress />
    </div>
  );
};

export default Dashboard;
