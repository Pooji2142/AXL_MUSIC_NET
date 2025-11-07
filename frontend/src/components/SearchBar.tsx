import { useState, useEffect, useRef } from "react";
import { Search, Music, Users, UserPlus, Clock } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("music");
  const { songs, albums, searchSongs, searchAlbums, isLoading } =
    useMusicStore();
  const {
    users,
    searchUsers,
    setSelectedUser,
    sendFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
    unfollowUser,
  } = useChatStore();
  const { setCurrentSong } = usePlayerStore();
  const navigate = useNavigate();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFollowAction = async (
    user: any,
    action: "follow" | "accept" | "reject" | "unfollow",
    currentStatus?: string
  ) => {
    try {
      switch (action) {
        case "follow":
          await sendFollowRequest(user._id);
          break;
        case "accept":
          await acceptFollowRequest(user.clerkId);
          break;
        case "reject":
          await rejectFollowRequest(user.clerkId);
          break;
        case "unfollow":
          await unfollowUser(user._id);
          break;
      }

      toast.success(
        action === "follow" && currentStatus === "requested"
          ? "Follow request cancelled"
          : `${action.charAt(0).toUpperCase() + action.slice(1)} successful`
      );

      // Refresh search results to update follow status
      if (query.trim()) {
        await searchUsers(query);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action}`);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    if (activeTab === "music") {
      await searchSongs(searchQuery);
      await searchAlbums(searchQuery);
    } else if (activeTab === "people") {
      await searchUsers(searchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Search className="size-5 text-zinc-400" />
        <Input
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
          <TabsTrigger
            value="music"
            className="data-[state=active]:bg-zinc-700"
          >
            <Music className="mr-2 size-4" />
            Music
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="data-[state=active]:bg-zinc-700"
          >
            <Users className="mr-2 size-4" />
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center text-zinc-400">Searching...</div>
              ) : songs.length > 0 ? (
                <>
                  <div className="text-sm font-medium text-zinc-400 mb-2">
                    Songs
                  </div>
                  {songs.map((song) => (
                    <div
                      key={song._id}
                      onClick={() => setCurrentSong(song)}
                      className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-md cursor-pointer"
                    >
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="size-10 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-zinc-400 truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                  {albums.length === 0 &&
                    songs.length === 0 &&
                    query &&
                    !isLoading && (
                      <div className="text-center text-zinc-400">
                        No music found
                      </div>
                    )}
                </>
              ) : query && !isLoading ? (
                <div className="text-center text-zinc-400">No songs found</div>
              ) : null}

              {albums.length > 0 && (
                <>
                  <div className="text-sm font-medium text-zinc-400 mt-4 mb-2">
                    Albums
                  </div>
                  {albums.map((album) => (
                    <Link
                      to={`/albums/${album._id}`}
                      key={album._id}
                      className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-md"
                    >
                      <img
                        src={album.imageUrl}
                        alt={album.title}
                        className="size-10 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{album.title}</p>
                        <p className="text-sm text-zinc-400 truncate">
                          {album.artist}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="people" className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center text-zinc-400">Searching...</div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.clerkId}
                    className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-md"
                  >
                    <img
                      src={user.imageUrl || "/default-avatar.png"}
                      alt={user.fullName}
                      className="size-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.fullName}</p>
                      {user.followStatus && (
                        <p className="text-xs text-zinc-400">
                          {user.followStatus === "following" && "Following"}
                          {user.followStatus === "requested" && "Requested"}
                          {user.followStatus === "follow_request_pending" &&
                            "Follow request pending"}
                          {user.followStatus === "follows_you" && "Follows you"}
                          {user.followStatus === "none" && ""}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {user.followStatus === "none" && (
                        <Button
                          size="sm"
                          onClick={() => handleFollowAction(user, "follow")}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow
                        </Button>
                      )}
                      {user.followStatus === "requested" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleFollowAction(
                              user,
                              "follow",
                              user.followStatus
                            )
                          }
                          className="text-yellow-500 border-yellow-500 hover:bg-yellow-500 hover:text-white"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Requested
                        </Button>
                      )}
                      {user.followStatus === "follow_request_pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollowAction(user, "accept")}
                          className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                        >
                          Accept Request
                        </Button>
                      )}
                      {user.followStatus === "following" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            navigate("/chat");
                          }}
                        >
                          Message
                        </Button>
                      )}
                      {user.followStatus === "follows_you" && (
                        <Button
                          size="sm"
                          onClick={() => handleFollowAction(user, "follow")}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow Back
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : query && !isLoading ? (
                <div className="text-center text-zinc-400">No users found</div>
              ) : null}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchBar;
