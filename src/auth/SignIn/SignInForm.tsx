import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/../FirebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { parseFirebaseError } from "@/lib/firebaseErrorParser";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [hasInteractedWithEmail, setHasInteractedWithEmail] = useState(false);
  const [hasInteractedWithPassword, setHasInteractedWithPassword] =
    useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const debouncedEmail = useDebounce(email, 500);
  const debouncedPassword = useDebounce(password, 500);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateInputs = useCallback(
    (emailVal: string, passwordVal: string) => {
      if (!hasInteractedWithEmail) {
        setEmailError("");
      } else if (!emailVal) {
        setEmailError("");
      } else if (!validateEmail(emailVal)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }

      if (!hasInteractedWithPassword) {
        setPasswordError("");
      } else if (!passwordVal) {
        setPasswordError("");
      } else {
        setPasswordError("");
      }
    },
    [hasInteractedWithEmail, hasInteractedWithPassword]
  );

  useEffect(() => {
    validateInputs(debouncedEmail, debouncedPassword);
  }, [debouncedEmail, debouncedPassword, validateInputs]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!hasInteractedWithEmail && value) setHasInteractedWithEmail(true);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!hasInteractedWithPassword && value) setHasInteractedWithPassword(true);
  };

  const signIn = async () => {
    setLoading(true);
    setError("");
    setResetMessage("");
    setHasInteractedWithEmail(true);
    setHasInteractedWithPassword(true);

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password) {
      setPasswordError("Please enter a password");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userUID = auth.currentUser?.uid.slice(-6);
      navigate(`/${userUID}`);
    } catch (error: any) {
      setError(parseFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    setResetMessage("");
    try {
      await signInWithPopup(auth, googleProvider);
      const userUID = auth.currentUser?.uid.slice(-6);
      navigate(`/${userUID}`);
    } catch (error: any) {
      setError(parseFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setError("");
    setResetMessage("");
    setHasInteractedWithEmail(true);

    if (!email) {
      setError("Please enter an email address to reset your password");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Please check your inbox.");
    } catch (error: any) {
      setError(parseFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="flex gap-2"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.32 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.48 7.72 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.72 1 4.01 3.52 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign In with Google
        </Button>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="focus:ring-2 focus:ring-[#b41212]"
        />
        {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className="focus:ring-2 focus:ring-[#b41212]"
        />
        {passwordError && (
          <p className="text-red-500 text-xs">{passwordError}</p>
        )}
        <Button
          onClick={signIn}
          disabled={loading}
          className="bg-[#b41212] hover:bg-[#a01010] text-white"
        >
          {loading ? "Loading..." : "Sign In"}
        </Button>
        <Button variant="link" onClick={handlePasswordReset} disabled={loading}>
          I don't remember my password
        </Button>
        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {resetMessage && (
          <p className="text-green-500 text-sm text-center">{resetMessage}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SignInForm;
