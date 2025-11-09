import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import UserAvatar from "../Profile/UserAvatar";

const Menu = () => {
  return (
    <div className="w-full hidden lg:flex justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="text-2xl hover:text-[#F6BE2C] hover:bg-transparent dark:hover:bg-transparent"
          asChild
        >
          <Link to={`/learn`}>Learn</Link>
        </Button>
        <Button
          variant="ghost"
          className="text-2xl hover:text-[#F6BE2C] hover:bg-transparent dark:hover:bg-transparent"
          asChild
        >
          <Link to={`/dictionary`}>Dictionary</Link>
        </Button>
        <Button
          variant="ghost"
          className="text-2xl hover:text-[#F6BE2C] hover:bg-transparent dark:hover:bg-transparent"
          asChild
        >
          <Link to={`/quiz`}>Quiz</Link>
        </Button>
        <Button
          variant="ghost"
          className="text-2xl hover:text-[#F6BE2C] hover:bg-transparent dark:hover:bg-transparent"
          asChild
        >
          <Link to={`/match`}>Match</Link>
        </Button>
      </div>
      <div className="flex items-center gap-5">
        <ThemeToggle />
        <Link to={`/profile`} className="flex items-center gap-4">
          <UserAvatar size="sm" className="drop-shadow-sm" />
        </Link>
      </div>
    </div>
  );
};

export default Menu;
