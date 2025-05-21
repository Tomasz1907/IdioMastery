const Logo = () => {
  return (
    <div className="flex items-center font-semibold text-xl drop-shadow-md mr-12 font-serif gap-2">
      <img src="/favicon.svg" alt="logo" height={20} width={20} />
      <div className="flex">
        <p className="text-white">Idio</p>
        <p className="text-yellow-400">mastery</p>
      </div>
    </div>
  );
};

export default Logo;
