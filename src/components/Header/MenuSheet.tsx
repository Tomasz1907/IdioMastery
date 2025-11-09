import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { auth } from "@/../FirebaseConfig";
import {
  BookIcon,
  GraduationCapIcon,
  MenuIcon,
  TrophyIcon,
  UserIcon,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const MenuSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-xl h-10">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        style={{ fontFamily: "'Baloo 2', cursive" }}
        className="p-5 bg-slate-900 text-white backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle className="flex flex-row justify-between border-b pb-2 text-2xl text-white">
            <p>Menu</p>
            <div className="md:hidden block">
              <ThemeToggle />
            </div>
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <div className="flex flex-col gap-5 ml-2">
          {/* Navigation Links */}
          <SheetClose asChild>
            <Link to={`/learn`}>
              <Button variant="ghost" className="text-xl">
                <GraduationCapIcon className="size-6" />
                Learn
              </Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to={`/dictionary`}>
              <Button variant="ghost" className="text-xl">
                <BookIcon className="size-6" />
                Dictionary
              </Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to={`/quiz`}>
              <Button variant="ghost" className="text-xl">
                <TrophyIcon className="size-6" />
                Quiz
              </Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to={`/match`}>
              <Button variant="ghost" className="text-xl">
                <Zap className="size-6" />
                Match
              </Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to={`/profile`}>
              <Button variant="ghost" className="text-xl">
                <UserIcon className="size-6" />
                Profile
              </Button>
            </Link>
          </SheetClose>
        </div>
        {/* Logout Button */}
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={() => {
                auth.signOut();
              }}
              className="text-lg bg-red-900 hover:bg-red-950 text-white"
            >
              Logout
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MenuSheet;
