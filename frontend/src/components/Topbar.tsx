import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, User } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import "./Topbar.css"; // 👈 Add this line for custom animation

const Topbar = () => {
  const { isAdmin, user } = useAuthStore();
  console.log({ isAdmin });

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
      {/* === Logo Section === */}
      <div className="flex gap-2 items-center group cursor-pointer select-none">
        <img
          src="/spotify.png"
          alt="Axolotl logo"
          className="size-12 transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-3 hover:logo-pop group-hover:drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]"
        />
        <span
          className="text-3xl font-bold tracking-widest transition-all duration-300 ease-in-out group-hover:text-cyan-400"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          AXOLOTL
        </span>
      </div>

      {/* === Right-side Buttons === */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.imageUrl}
              alt={user.fullName}
              className="size-8 rounded-full"
            />
            <span className="text-sm font-small">{user.fullName}</span>
          </div>
        )}

        {user && (
          <Link
            to={"/profile"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <User className="size-5 mr-0" />
          </Link>
        )}

        {isAdmin && (
          <Link
            to={"/admin"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LayoutDashboardIcon className="size-4 mr-0" />
          </Link>
        )}

        <SignedOut>
          <SignInOAuthButtons />
        </SignedOut>

        <UserButton />
      </div>
    </div>
  );
};

export default Topbar;
