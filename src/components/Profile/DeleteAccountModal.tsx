import { useState } from "react";
import { auth } from "@/../FirebaseConfig";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangleIcon } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DeleteAccountModal = ({ isOpen, setIsOpen }: DeleteAccountModalProps) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
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
        setIsOpen(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <Card className="w-[90%] max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangleIcon className="text-red-500" />
            <h2 className="text-red-500 text-lg font-bold">Warning!</h2>
          </div>
          <p className="mb-4 text-red-600">
            Deleting your account is irreversible. Please enter your password to
            confirm.
          </p>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 focus:ring-2 focus:ring-[#b41212]"
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <div className="flex gap-4 justify-end">
            <Button
              variant="default"
              className="bg-red-700 hover:bg-red-900 text-white"
              onClick={handleDeleteAccount}
            >
              Confirm Delete
            </Button>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteAccountModal;
