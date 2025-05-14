// Header.tsx
import Menu from "./Menu";
import MobileMenu from "./MobileMenu";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { User } from "firebase/auth";

interface HeaderProps {
  user: User | null; // Type the user prop
}

const Header = ({ user }: HeaderProps) => {
  const userUID = user?.uid?.slice(-6);

  return (
    <nav className="h-[65px] w-full flex items-center px-5 bg-[#b41212] text-white">
      <Link to={user ? `/${userUID}` : "/"}>
        <Logo />
      </Link>
      {user ? (
        <div className="w-full">
          <MobileMenu />
          <Menu />
        </div>
      ) : (
        <div className="flex items-center justify-end w-full">
          <Link to="/sign-in">
            <Button variant="ghost" className="text-lg">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
