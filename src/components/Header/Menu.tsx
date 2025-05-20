import { Button } from "@/components/ui/button";
import { auth } from "@/../FirebaseConfig";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import UserAvatar from "../UserAvatar";

const Menu = () => {
  const user = auth.currentUser;
  const userUID = user?.uid.slice(-6);
  return (
    <div className="w-full hidden md:flex justify-between">
      <div className="flex items-center gap-4">
        <Link to={`/${userUID}/learn`}>
          <Button variant="ghost" className="text-lg">
            Learn
          </Button>
        </Link>
        <Link to={`/${userUID}/dictionary`}>
          <Button variant="ghost" className="text-lg">
            Dictionary
          </Button>
        </Link>
        <Link to={`/${userUID}/quiz`}>
          <Button variant="ghost" className="text-lg">
            Quiz
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-5">
        <ThemeToggle />
        <Link to={`/${userUID}/profile`} className="flex items-center gap-4">
          <UserAvatar size="sm" className="drop-shadow-sm" />
        </Link>
      </div>
    </div>
  );
};

export default Menu;
