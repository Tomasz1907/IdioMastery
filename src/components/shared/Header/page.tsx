import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <nav className="h-[65px] flex items-center px-5 md:px-16 bg-[#b41212] text-white text-xl">
      <div className="flex items-center font-semibold text-2xl drop-shadow-md mr-8">
        <p className="text-white">Idio</p>
        <p className="text-yellow-400">mastery</p>
      </div>
      <div className="w-full md:hidden flex items-center justify-end">
        <Button variant="ghost" className="text-xl">
          Menu
        </Button>
      </div>
      <div className="w-full hidden md:flex justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-xl">
            <a href="/dictionary">Dictionary</a>
          </Button>
          <Button variant="ghost" className="text-xl">
            Quiz
          </Button>
          <Button variant="ghost" className="text-xl">
            Learn
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-xl">
            Profile
          </Button>
          <Button variant="ghost" className="text-xl">
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
