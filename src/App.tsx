import Footer from "./components/Footer";
import Header from "./components/shared/Header/page";

const App = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-between markazi-text">
      <Header />
      <div className="flex-1 bg-[#EEEEEE] h-full p-5">
        <p className="text-2xl">Whereas recognition of the</p>
        <p className="text-2xl">123123</p>
      </div>
      <Footer />
    </div>
  );
};

export default App;
