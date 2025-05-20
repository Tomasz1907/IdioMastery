import { useState } from "react";
import { auth } from "@/../FirebaseConfig";
import { signOut, updateProfile } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import UserAvatar from "@/components/UserAvatar";
import ThemeToggle from "@/components/Header/ThemeToggle";

const Profile = () => {
  const user = auth.currentUser;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [error, setError] = useState("");

  // Compute initials for AvatarFallback
  const getInitials = () => {
    if (user?.displayName) {
      const names = user.displayName.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : user.displayName[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "?";
  };

  const handleUpdateProfile = async () => {
    if (!user) {
      setError("You must be signed in to update your profile.");
      return;
    }
    try {
      await updateProfile(user, { displayName });
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            <p className="text-lg text-gray-600">
              Please sign in to view your profile.
            </p>
            <Button
              variant="default"
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => (window.location.href = "/login")} // Adjust redirect path as needed
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center p-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-serif">
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <UserAvatar size="lg" />
          {isEditing ? (
            <div className="w-full flex flex-col gap-4">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="w-full"
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleUpdateProfile}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsEditing(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {user.displayName && (
                <p className="text-2xl font-semibold">{user.displayName}</p>
              )}
              <p className="text-lg ">{user.email}</p>
              <div className="w-full flex flex-col gap-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={handleSignOut}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Sign Out
                </Button>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-red-600 hover:bg-red-800 text-white"
                >
                  Delete Account
                </Button>
              </div>
            </>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>
      <DeleteAccountModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
};

export default Profile;
