import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/../FirebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Star, Trophy, Volume2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { parseFirebaseError } from "@/lib/firebaseErrorParser";

interface AuthCardProps {
  isSignUp?: boolean;
}

const AuthCard: React.FC<AuthCardProps> = ({ isSignUp = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [hasInteractedWithEmail, setHasInteractedWithEmail] = useState(false);
  const [hasInteractedWithPassword, setHasInteractedWithPassword] =
    useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const debouncedEmail = useDebounce(email, 500);
  const debouncedPassword = useDebounce(password, 500);
  const debouncedConfirmPassword = useDebounce(confirmPassword, 500);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Must be at least 8 characters long");
    if (!/[A-Z]/.test(password))
      errors.push("Must contain at least one uppercase letter");
    if (!/[!@#$%^&*]/.test(password))
      errors.push("Must contain at least one special character");
    return errors;
  };

  const validateEmailInput = useCallback(
    (value: string) => {
      if (hasInteractedWithEmail && value && !validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    },
    [hasInteractedWithEmail]
  );

  const validatePasswordInput = useCallback(
    (pass: string, confirm: string) => {
      if (!hasInteractedWithPassword) return;

      if (isSignUp) {
        if (!pass) {
          setPasswordErrors([]);
        } else {
          const errors = validatePassword(pass);
          setPasswordErrors(errors);
        }

        if (!confirm) {
          setConfirmPasswordError("");
        } else if (pass && confirm && pass !== confirm) {
          setConfirmPasswordError("Passwords do not match");
        } else {
          setConfirmPasswordError("");
        }
      } else {
        if (!pass) {
          setPasswordErrors(["Please enter a password"]);
        } else {
          setPasswordErrors([]);
        }
      }
    },
    [hasInteractedWithPassword, isSignUp]
  );

  useEffect(() => {
    validateEmailInput(debouncedEmail);
  }, [debouncedEmail, validateEmailInput]);

  useEffect(() => {
    validatePasswordInput(debouncedPassword, debouncedConfirmPassword);
  }, [debouncedPassword, debouncedConfirmPassword, validatePasswordInput]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!hasInteractedWithEmail && value) setHasInteractedWithEmail(true);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!hasInteractedWithPassword && value) setHasInteractedWithPassword(true);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (!hasInteractedWithPassword && value) setHasInteractedWithPassword(true);
  };

  const handleAuth = async () => {
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
      setPasswordErrors(["Please enter a password"]);
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const passwordValidationErrors = validatePassword(password);
      if (passwordValidationErrors.length > 0) {
        setPasswordErrors(passwordValidationErrors);
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      const userUID = auth.currentUser?.uid.slice(-6);
      navigate(`/${userUID}`);
    } catch (error: any) {
      setError(parseFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
    if (isSignUp) return;
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
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold font-serif">
          Learn Spanish with Ease
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-4 text-base">
          <li className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <span>Engaging quizzes to test your skills</span>
          </li>
          <li className="flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <span>Save words with a vibrant dictionary</span>
          </li>
          <li className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <span>Practice pronunciation with text-to-speech</span>
          </li>
          <li className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <span>Track progress with daily streaks</span>
          </li>
        </ul>
        <div className="flex flex-col items-center justify-center w-full space-y-4">
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
          {passwordErrors.length > 0 && (
            <div className="text-red-500 text-xs">
              {passwordErrors.map((err, index) => (
                <p key={index}>{err}</p>
              ))}
            </div>
          )}
          {isSignUp && (
            <>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className="focus:ring-2 focus:ring-[#b41212]"
              />
              {confirmPasswordError && (
                <p className="text-red-500 text-xs">{confirmPasswordError}</p>
              )}
            </>
          )}
          <Button
            onClick={handleAuth}
            disabled={loading}
            className="bg-[#b41212] hover:bg-[#a01010] text-white"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          {!isSignUp && (
            <Button
              variant="link"
              onClick={handlePasswordReset}
              disabled={loading}
            >
              I don't remember my password
            </Button>
          )}
          <p className="text-sm text-center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              to={isSignUp ? "/sign-in" : "/sign-up"}
              className="text-blue-500 hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Link>
          </p>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {resetMessage && (
            <p className="text-green-500 text-sm text-center">{resetMessage}</p>
          )}
          <div className="border-t w-full flex items-center justify-center pt-4">
            <Button
              variant="outline"
              className="flex gap-2"
              onClick={handleGoogleAuth}
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
              {isSignUp ? "Sign Up with Google" : "Sign In with Google"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthCard;
