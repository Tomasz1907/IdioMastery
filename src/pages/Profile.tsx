import { useState, useEffect } from "react";
import { auth } from "@/../FirebaseConfig";
import { signOut, updateProfile } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeleteAccountModal from "@/components/Profile/DeleteAccountModal";
import UserAvatar from "@/components/Profile/UserAvatar";
import { Pencil, Camera, LockIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const user = auth.currentUser;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [tempPhotoURL, setTempPhotoURL] = useState(user?.photoURL || "");
  const [error, setError] = useState("");

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      setTempPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) {
      setError("You must be signed in to update your profile.");
      return;
    }
    try {
      await updateProfile(user, { displayName, photoURL: tempPhotoURL });
      setPhotoURL(tempPhotoURL);
      setIsEditingName(false);
      setIsEditingAvatar(false);
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center gap-6 pt-8">
              <p className="text-lg text-gray-600">
                Please sign in to view your profile.
              </p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => (window.location.href = "/login")}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-lg border ">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle
              style={{ fontFamily: "'Baloo 2', cursive" }}
              className="text-2xl lg:text-4xl font-bold "
            >
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 px-8 pb-8">
            {/* Avatar - Click to Edit */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="relative cursor-pointer group"
              onClick={() => setIsEditingAvatar(true)}
            >
              <UserAvatar
                user={{
                  ...user,
                  photoURL: photoURL || user?.photoURL || null,
                  displayName: displayName || user?.displayName || null,
                }}
                size="lg"
                className="w-32 h-32 border-4 border-white shadow-md"
              />
              <div className="absolute inset-0 hover:bg-gray-900 bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center">
                <Camera className="w-8 h-8 text-[#F6BE2C] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>

            {/* Name + Edit Icon */}
            <div className="flex items-center gap-2 w-full justify-center">
              {isEditingName ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="text-xl font-semibold text-center max-w-xs"
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-bold ">
                  {user.displayName || "Anonymous User"}
                </h2>
              )}
              {!isEditingName && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                  className=" hover:text-[#F6BE2C] transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Email */}
            <div className="flex gap-1 items-center">
              <p className="text-lg ">Email: {user.email}</p>
              <LockIcon className="size-4" />
            </div>

            {/* Editing Avatar Form */}
            <AnimatePresence>
              {isEditingAvatar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full flex flex-col gap-3 overflow-hidden"
                >
                  <Label htmlFor="avatar-url">Avatar URL</Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    value={tempPhotoURL}
                    onChange={(e) => setTempPhotoURL(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full"
                  />
                  {tempPhotoURL && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center"
                    >
                      {/* CENTER-CROPPED PREVIEW */}
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
                        <img
                          src={tempPhotoURL}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover object-center"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                          onLoad={(e) =>
                            (e.currentTarget.style.display = "block")
                          }
                        />
                      </div>
                    </motion.div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProfile}
                      className="flex-1"
                      size="sm"
                    >
                      Save Avatar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingAvatar(false);
                        setTempPhotoURL(photoURL);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Editing Name Buttons */}
            <AnimatePresence>
              {isEditingName && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full flex gap-2 overflow-hidden"
                >
                  <Button
                    onClick={handleUpdateProfile}
                    className="flex-1"
                    size="sm"
                  >
                    Save Name
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingName(false);
                      setDisplayName(user.displayName || "");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons - Always Visible */}
            <div className="w-full flex flex-col gap-3 mt-4">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="destructive"
                className="w-full"
              >
                Delete Account
              </Button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-sm text-center mt-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <DeleteAccountModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
};

export default Profile;
