import ThemeToggle from "./ThemeToggle";
import MenuSheet from "./MenuSheet";

const MobileMenu = () => {
  return (
    <div className="w-full md:hidden flex items-center justify-end">
      <ThemeToggle />
      <MenuSheet />
    </div>
  );
};

export default MobileMenu;
