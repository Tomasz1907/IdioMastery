const Footer = () => {
  return (
    <footer
      style={{ fontFamily: "'Baloo 2', cursive" }}
      className="h-full py-6 flex flex-col md:flex-row gap-5 items-center justify-center text-base lg:text-lg  bg-gray-900 text-white drop-shadow-md"
    >
      <p>2025</p>
      <p className="hidden md:block">•</p>
      <div className="flex items-center justify-center gap-1">
        <div className="flex items-center gap-1">
          <img src="/favicon.svg" alt="logo" height={20} width={20} />
          <p className="text-[#F6BE2C]">IdioMastery</p>
        </div>
        <p>by Tomasz 1907</p>
      </div>
      <p className="hidden md:block">•</p>
      <p>All rights reserved.</p>
    </footer>
  );
};

export default Footer;
