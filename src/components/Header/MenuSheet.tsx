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
  ShieldQuestionIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const MenuSheet = () => {
  const user = auth.currentUser;
  const userUID = user?.uid.slice(-6);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="text-xl h-10">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-5 bg-gray-800/80 text-white backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="border-b pb-2 text-center flex gap-2 text-lg">
            <UserIcon className="text-white rounded-full w-[50px] h-[50px] p-1" />
            <div className="flex items-center justify-center w-full min-w-0 max-w-full text-white break-words whitespace-normal font-serif text-base">
              <p className="break-all">
                Welcome,{" "}
                {`${auth.currentUser?.displayName || auth.currentUser?.email}`}
              </p>
            </div>
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>

        {/* Navigation Links */}
        <SheetClose asChild>
          <Link to={`/${userUID}/learn`}>
            <Button variant="ghost" className="text-lg">
              <GraduationCapIcon />
              Learn
            </Button>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link to={`/${userUID}/dictionary`}>
            <Button variant="ghost" className="text-lg">
              <BookIcon />
              Dictionary
            </Button>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link to={`/${userUID}/quiz`}>
            <Button variant="ghost" className="text-lg">
              <ShieldQuestionIcon />
              Quiz
            </Button>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link to={`/${userUID}/profile`}>
            <Button variant="ghost" className="text-lg">
              <UserIcon />
              Profile
            </Button>
          </Link>
        </SheetClose>

        {/* Logout Button */}
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={() => {
                auth.signOut();
              }}
              className="text-lg bg-red-700 hover:bg-red-800 text-white"
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
