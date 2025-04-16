import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/FirebaseConfig";

const Profile = () => {
  const user = auth.currentUser;
  const avatarSrc = user?.photoURL || undefined;

  return (
    <div className="flex items-center justify-center text-xl">
      <div className="flex flex-col items-center gap-5 bg-neutral-500/20 rounded w-[300px] md:w-[600px] px-2 pb-5 pt-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-16 h-16 text-[#b41212] text-3xl">
            <AvatarImage src={avatarSrc} alt="avatar" />
            <AvatarFallback>
              {user?.email?.slice(0, 1).toUpperCase()}
              {user?.email?.slice(1, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {user?.displayName && (
          <p className="text-2xl font-bold">{user?.displayName}</p>
        )}
        <p>{user?.email}</p>
      </div>
    </div>
  );
};

export default Profile;
