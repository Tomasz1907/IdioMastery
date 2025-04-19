import { Button } from "@/components/ui/button";
import { auth } from "@/../FirebaseConfig";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Menu = () => {
  const user = auth.currentUser;
  const userUID = user?.uid.slice(-6);
  return (
    <div className="w-full hidden md:flex justify-between">
      <div className="flex items-center gap-4">
        <Link to={`/${userUID}/dictionary`}>
          <Button variant="ghost" className="text-lg">
            Dictionary
          </Button>
        </Link>
        <Link to={`/${userUID}/quiz`}>
          <Button variant="ghost" className="text-xl">
            Quiz
          </Button>
        </Link>
        <Link to={`/${userUID}/learn`}>
          <Button variant="ghost" className="text-xl">
            Learn
          </Button>
        </Link>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
        <Link to={`/${userUID}/profile`}>
          <Button variant="ghost" className="text-xl">
            Profile
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="text-xl"
          onClick={() => auth.signOut()}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Menu;
