import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle, Search, Bell } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
  const { albums, fetchAlbums, isLoading } = useMusicStore();
  const { unreadNotificationsCount } = useChatStore();

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  console.log({ albums });

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Navigation menu */}

      <div className="rounded-lg bg-zinc-900 p-4">
        <div className="space-y-2">
          <Link
            to={"/"}
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-start text-white hover:bg-zinc-800",
              })
            )}
          >
            <HomeIcon className="mr-2 size-5" />
            <span className="hidden md:inline">Home</span>
          </Link>

          <SignedIn>
            <Link
              to={"/chat"}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className:
                    "w-full justify-start text-white hover:bg-zinc-800",
                })
              )}
            >
              <MessageCircle className="mr-2 size-5" />
              <span className="hidden md:inline">Messages</span>
            </Link>

            <Link
              to={"/notifications"}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className:
                    "w-full justify-start text-white hover:bg-zinc-800 relative",
                })
              )}
            >
              <Bell className="mr-2 size-5" />
              <span className="hidden md:inline">Notifications</span>
              {/* Blue glowing indicator for unread notifications */}
              {unreadNotificationsCount > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
              )}
            </Link>
          </SignedIn>

          <Link
            to={"/search"}
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-start text-white hover:bg-zinc-800",
              })
            )}
          >
            <Search className="mr-2 size-5" />
            <span className="hidden md:inline">Search</span>
          </Link>
        </div>
      </div>

      {/* Library section */}
      <div className="flex-1 rounded-lg bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-white px-2">
            <Library className="size-5 mr-2" />
            <span className="hidden md:inline">Playlists</span>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-380px)] pb-8">
          <div className="space-y-2">
            {isLoading ? (
              <PlaylistSkeleton />
            ) : (
              albums.map((album) => (
                <Link
                  to={`/albums/${album._id}`}
                  key={album._id}
                  className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer"
                >
                  <img
                    src={album.imageUrl}
                    alt="Playlist img"
                    className="size-12 rounded-md flex-shrink-0 object-cover"
                  />

                  <div className="flex-1 min-w-0 hidden md:block">
                    <p className="font-medium truncate">{album.title}</p>
                    <p className="text-sm text-zinc-400 truncate">
                      Album • {album.artist}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
export default LeftSidebar;
