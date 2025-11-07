import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const Header = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="rounded-lg">
          <img src="/spotify.png" className="size-10 text-black" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Music Manager</h1>
          <p className="text-zinc-400 mt-1">Manage your music catalog</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.imageUrl}
              alt="Profile"
              className="size-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{user.fullName}</span>
          </div>
        )}
        <UserButton />
      </div>
    </div>
  );
};
export default Header;
