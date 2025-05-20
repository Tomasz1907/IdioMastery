import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/StatsCards";
import LearningProgress from "@/components/LearningProgress";

const Dashboard = () => {
  const { user } = useAuth();
  const userUID = user?.uid?.slice(-6);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button
          asChild
          className="h-20 text-lg bg-red-700 hover:bg-red-900 text-white"
        >
          <Link to={`/${userUID}/learn`}>Learn New Words</Link>
        </Button>
        <Button
          asChild
          className="h-20 text-lg bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Link to={`/${userUID}/dictionary`}>Your Dictionary</Link>
        </Button>
        <Button
          asChild
          className="h-20 text-lg bg-red-700 hover:bg-red-900 text-white"
        >
          <Link to={`/${userUID}/quiz`}>Vocabulary Quiz</Link>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
