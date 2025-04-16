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
import { auth } from "@/FirebaseConfig";
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
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-5 bg-neutral-500/20 text-white backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="border-b pb-2 text-center flex gap-2 text-lg">
            <UserIcon className="text-white rounded-full w-[50px] h-[50px] p-1" />
            <div className="flex flex-col items-center justify-center w-full text-white">
              <p>Welcome!</p>
              {`${auth.currentUser?.email}`}
            </div>
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <Link to={`/${userUID}/dictionary`}>
          <Button variant="ghost" className="text-xl">
            <BookIcon />
            Dictionary
          </Button>
        </Link>
        <Link to={`/${userUID}/quiz`}>
          <Button variant="ghost" className="text-xl">
            <ShieldQuestionIcon />
            Quiz
          </Button>
        </Link>
        <Link to={`/${userUID}/learn`}>
          <Button variant="ghost" className="text-xl">
            <GraduationCapIcon />
            Learn
          </Button>
        </Link>
        <Link to={`/${userUID}/profile`}>
          <Button variant="ghost" className="text-xl">
            <UserIcon />
            Profile
          </Button>
        </Link>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={() => {
                auth.signOut();
              }}
              variant="destructive"
              className="text-lg"
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
