// Header.tsx
import Menu from "./Menu";
import MobileMenu from "./MobileMenu";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import { User } from "firebase/auth";

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  return (
    <nav
      style={{ fontFamily: "'Baloo 2', cursive" }}
      className="h-[65px] w-full flex items-center px-5 bg-gray-900 text-white md:px-12"
    >
      <Link to={"/"}>
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
