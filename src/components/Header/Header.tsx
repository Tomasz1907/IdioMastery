import Menu from "./Menu";
import MobileMenu from "./MobileMenu";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import { auth } from "@/FirebaseConfig";
import { Button } from "../ui/button";

const Header = () => {
  const user = auth.currentUser;
  const userUID = user?.uid.slice(-6);
  return (
    <nav className="h-[65px] w-full flex items-center px-5 md:px-16 bg-[#b41212] text-white text-xl">
      <Link to={`/${userUID}`}>
        <Logo />
      </Link>
      {user ? (
        <div className="w-full">
          <MobileMenu />
          <Menu />
        </div>
      ) : (
        <div className="flex items-center justify-end w-full">
          <Link to={`/sign-in`}>
            <Button variant="ghost" className="text-xl">
              Sign In
            </Button>
          </Link>
          <Link to={`/sign-up`}>
            <Button variant="ghost" className="text-xl">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
