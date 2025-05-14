import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const userUID = user?.uid?.slice(-6);
  return (
    <div className="flex flex-col items-center text-center gap-5">
      <p className="text-lg md:text-xl ">
        Welcome {user?.displayName ? user?.displayName : user?.email} !
      </p>
      <p className="mt-5">Ready to learn something new?</p>
      <Link to={`/${userUID}/learn`}>
        <Button className="w-[300px] text-lg bg-[#b41212]">
          Learn New Words
        </Button>
      </Link>
      <p className="mt-5">You can always check your saved words here</p>
      <Link to={`/${userUID}/dictionary`}>
        <Button className="w-[300px] text-lg bg-amber-500">
          Your Dictionary
        </Button>
      </Link>
      <p className="mt-5">Lets test your knowledge!</p>
      <Link to={`/${userUID}/quiz`}>
        <Button className="w-[300px] text-lg bg-[#b41212]" variant="default">
          Vocabulary Quiz
        </Button>
      </Link>
    </div>
  );
};

export default Dashboard;
