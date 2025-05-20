import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/../FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { parseFirebaseError } from "@/lib/firebaseErrorParser";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
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

  const validateEmailInput = useCallback((value: string) => {
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }, []);

  const validatePasswordInput = useCallback(
    (pass: string, confirm: string) => {
      if (!hasInteractedWithPassword) return;

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
    },
    [hasInteractedWithPassword]
  );

  useEffect(() => {
    validateEmailInput(debouncedEmail);
  }, [debouncedEmail, validateEmailInput]);

  useEffect(() => {
    validatePasswordInput(debouncedPassword, debouncedConfirmPassword);
  }, [debouncedPassword, debouncedConfirmPassword, validatePasswordInput]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!hasInteractedWithPassword && value) setHasInteractedWithPassword(true);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (!hasInteractedWithPassword && value) setHasInteractedWithPassword(true);
  };

  const signUp = async () => {
    setLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      setPasswordErrors(passwordValidationErrors);
      setHasInteractedWithPassword(true);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setHasInteractedWithPassword(true);
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const userID = auth.currentUser?.uid.slice(-6);
      navigate(`/${userID}`);
    } catch (error: any) {
      setError(parseFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      const userID = auth.currentUser?.uid.slice(-6);
      navigate(`/${userID}`);
    } catch (error: any) {
      setError(parseFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="flex gap-2"
          onClick={signUpWithGoogle}
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
          Sign Up with Google
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
        {passwordErrors.length > 0 && (
          <div className="text-red-500 text-xs">
            {passwordErrors.map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
        )}
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
        <Button
          onClick={signUp}
          disabled={loading}
          className="bg-[#b41212] hover:bg-[#a01010] text-white"
        >
          {loading ? "Loading..." : "Sign Up"}
        </Button>
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
