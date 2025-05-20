import { auth } from "@/../FirebaseConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils"; // Assuming you have a utility for className merging

interface UserAvatarProps {
  user?: typeof auth.currentUser; // Firebase user type
  className?: string; // For custom styling
  size?: "sm" | "md" | "lg"; // Control avatar size
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user = auth.currentUser,
  className,
  size = "md",
}) => {
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

  // Define size classes
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-2xl",
  };

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        "bg-[var(--color-card)] transition-[var(--transition-theme)]",
        className
      )}
    >
      <AvatarImage src={user?.photoURL || undefined} alt="User avatar" />
      <AvatarFallback className="font-semibold text-[var(--color-card-foreground)]">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
