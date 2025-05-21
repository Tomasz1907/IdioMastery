// Header.tsx
import Menu from "./Menu";
import MobileMenu from "./MobileMenu";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import { User } from "firebase/auth";

interface HeaderProps {
  user: User | null; // Type the user prop
}

const Header = ({ user }: HeaderProps) => {
  const userUID = user?.uid?.slice(-6);

  return (
    <nav className="h-[60px] w-full flex items-center px-5 bg-sky-700 text-white md:px-12">
      <Link to={user ? `/${userUID}` : "/"}>
        <Logo />
      </Link>
      {user && (
        <div className="w-full">
          <MobileMenu />
          <Menu />
        </div>
      )}
    </nav>
  );
};

export default Header;
