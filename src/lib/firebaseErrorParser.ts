export const parseFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/too-many-requests":
      return "Too many attempts, please try again later";
    case "auth/email-already-in-use":
      return "This email is already in use";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with a different sign-in method";
    case "auth/invalid-credential":
      return "Invalid credentials provided";
    case "auth/weak-password":
      return "Password is too weak";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled";
    case "PERMISSION_DENIED":
      return "Access denied. Please check your permissions.";
    case "DATA_STALE":
      return "Data is stale. Please refresh and try again.";
    case "UNAVAILABLE":
      return "Service is currently unavailable. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};
