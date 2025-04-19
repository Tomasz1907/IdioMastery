import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth } from "@/../FirebaseConfig";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { toast } from "sonner";

const Profile = () => {
  const user = auth.currentUser;
  const avatarSrc = user?.photoURL || undefined;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDeleteAccount = async () => {
    if (user && password) {
      try {
        setErrorMessage("");
        const credential = EmailAuthProvider.credential(
          String(user.email),
          password
        );
        await reauthenticateWithCredential(user, credential);
        await user.delete();
        toast.success("Your account has been deleted successfully.");
      } catch (error) {
        console.error("Error deleting account:", error);
        setErrorMessage(
          "Failed to delete account. Please check your password and try again."
        );
      }
    } else {
      setErrorMessage("Please enter your password.");
    }
  };

  return (
    <div className="flex items-center justify-center text-xl">
      <div className="flex flex-col items-center gap-5 bg-neutral-500/20 rounded w-[300px] md:w-[600px] px-2 pb-5 pt-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-16 h-16 text-[#b41212] text-3xl">
            <AvatarImage src={avatarSrc} alt="avatar" />
            <AvatarFallback>
              {user?.email?.slice(0, 1)?.toUpperCase()}
              {user?.email?.slice(1, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {user?.displayName && (
          <p className="text-2xl font-bold">{user?.displayName}</p>
        )}
        <p>{user?.email}</p>
        <Button
          variant="destructive"
          className="text-xl"
          onClick={() => setIsModalOpen(true)}
        >
          Delete Account
        </Button>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-neutral-500/40 backdrop-blur-lg rounded-lg p-6 w-[90%] max-w-[400px]">
              <h2 className="text-red-500 text-lg font-bold mb-4">Warning!</h2>
              <p className="mb-4">
                Deleting your account is irreversible. Please enter your
                password to confirm.
              </p>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-2 border rounded mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
              )}
              <div className="flex gap-4 justify-end">
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Confirm Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
