import { auth } from "@/../FirebaseConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: typeof auth.currentUser;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user = auth.currentUser,
  className,
  size = "md",
}) => {
  const getInitials = () => {
    if (user?.displayName) {
      const names = user.displayName.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : user.displayName[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "?";
  };

  const sizeClasses = {
    sm: "w-9 h-9 text-lg ring-3 ring-white hover:ring-[#F6BE2C]",
    md: "w-16 h-16 text-2xl ring-2 ring-white",
    lg: "w-24 h-24 text-4xl",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className, "overflow-hidden")}>
      <div className="">
        <AvatarImage
          src={user?.photoURL || undefined}
          alt="User avatar"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      <AvatarFallback className="bg-gray-800 text-white font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
