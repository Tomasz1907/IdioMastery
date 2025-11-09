const Logo = () => {
  return (
    <div
      style={{ fontFamily: "'Baloo 2', cursive" }}
      className="text-white text-2xl flex items-center justify-center font-semibold drop-shadow-md mr-12 lg:mr-24 font-serif gap-2 hover:text-[#F6BE2C] w-full"
    >
      <img src="/favicon.svg" alt="Logo" className="w-8 h-8 mb-1 " />
      <p>IdioMastery</p>
    </div>
  );
};

export default Logo;
