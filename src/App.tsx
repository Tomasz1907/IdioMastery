import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header/Header";
import Dashboard from "./pages/Dashboard";
import Dictionary from "./pages/Dictionary";
import Quiz from "./pages/Quiz";
import Learn from "./pages/Learn";
import Profile from "./pages/Profile";
import NotFound from "./not-found";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";
import Match from "./pages/Match";
import LoadingSpinner from "./components/LoadingSpinner";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user && !loading && window.location.pathname !== "/sign-up") {
      navigate("/sign-in");
    }
    if (user && window.location.pathname === "/") {
      navigate(`/`);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-800 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  const authRoutes = ["/sign-in", "/sign-up"];
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen min-w-[300px]">
      {/* Header */}
      {!isAuthPage && (
        <header className="sticky top-0 z-50">
          <Header user={user} />
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 py-6">
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          {user && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/match" element={<Match />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </main>

      {/* Footer */}
      {!isAuthPage && (
        <footer className="mt-auto">
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default App;
