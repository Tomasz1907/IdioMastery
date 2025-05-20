import { Route, Routes, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header/Header";
import SignInPage from "./auth/SignIn/SignInPage";
import SignUpPage from "./auth/SignUp/SignUpPage";
import Dashboard from "./pages/Dashboard";
import Dictionary from "./pages/Dictionary";
import Quiz from "./pages/Quiz";
import Learn from "./pages/Learn";
import Profile from "./pages/Profile";
import NotFound from "./not-found";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

const App = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const userUID = user?.uid?.slice(-6);
    if (!user && !loading && window.location.pathname !== "/sign-up") {
      navigate("/sign-in");
    }
    if (user && window.location.pathname === "/") {
      navigate(`/${userUID}`);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-800 text-white">
        <Loader className="animate-spin size-16" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen min-w-[350px] flex flex-col justify-between">
      <Header user={user} />
      <div className="flex-1 h-full p-5 md:px-16 text-lg">
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/:userUID" element={<Dashboard />} />
          <Route path="/:userUID/profile" element={<Profile />} />
          <Route path="/:userUID/dictionary" element={<Dictionary />} />
          <Route path="/:userUID/quiz" element={<Quiz />} />
          <Route path="/:userUID/learn" element={<Learn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
