import ThemeToggle from "./ThemeToggle";
import MenuSheet from "./MenuSheet";

const MobileMenu = () => {
  return (
    <div className="w-full lg:hidden flex items-center justify-end gap-2">
      <div className="hidden md:block">
        <ThemeToggle />
      </div>
      <MenuSheet />
    </div>
  );
};

export default MobileMenu;
