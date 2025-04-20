// App.tsx
import { Route, Routes, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header/Header";
import SignInPage from "./auth/sign-in";
import SignUpPage from "./auth/sign-up";
import Dashboard from "./user/Dashboard";
import Profile from "./user/Profile";
import Dictionary from "./components/Dictionary/Dictionary";
import Quiz from "./components/Quiz/Quiz";
import Learn from "./components/Learn/Learn";
import NotFound from "./not-found";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

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
        <p className="text-xl">Loading...</p>
      </div>
    ); // Prevent rendering until auth resolves
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-neutral-900/10">
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
