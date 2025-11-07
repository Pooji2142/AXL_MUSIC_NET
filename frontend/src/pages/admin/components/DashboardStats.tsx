import { useMusicStore } from "@/stores/useMusicStore";
import {
  Library,
  ListMusic,
  Users2,
  Users,
  UserPlus,
  UserCheck,
} from "lucide-react";
import StatsCard from "./StatsCard";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

const DashboardStats = () => {
  const { userStats, fetchUserStats } = useMusicStore();
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const fetchFollowers = async () => {
    try {
      const response = await axiosInstance.get("/users/followers");
      setFollowers(response.data);
    } catch {
      toast.error("Failed to fetch followers");
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axiosInstance.get("/users/following");
      setFollowing(response.data);
    } catch {
      toast.error("Failed to fetch following");
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await axiosInstance.delete(`/users/follow/${userId}`);
      toast.success("Unfollowed successfully");
      fetchFollowing();
      fetchUserStats();
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  const statsData = [
    {
      icon: ListMusic,
      label: "Your Songs",
      value: userStats.totalSongs.toString(),
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      icon: Library,
      label: "Your Albums",
      value: userStats.totalAlbums.toString(),
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      icon: Users2,
      label: "Your Artists",
      value: userStats.totalArtists.toString(),
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      icon: Users,
      label: "Total Users",
      value: userStats.totalUsers?.toString() || "0",
      bgColor: "bg-sky-500/10",
      iconColor: "text-sky-500",
    },
    {
      icon: UserPlus,
      label: "Followers",
      value: userStats.totalFollowers?.toString() || "0",
      bgColor: "bg-pink-500/10",
      iconColor: "text-pink-500",
    },
    {
      icon: UserCheck,
      label: "Following",
      value: userStats.totalFollowing?.toString() || "0",
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statsData.map((stat) => (
          <Dialog key={stat.label}>
            <DialogTrigger asChild>
              <div
                className="cursor-pointer"
                onClick={() => {
                  if (stat.label === "Followers") {
                    fetchFollowers();
                  } else if (stat.label === "Following") {
                    fetchFollowing();
                  }
                }}
              >
                <StatsCard
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  bgColor={stat.bgColor}
                  iconColor={stat.iconColor}
                />
              </div>
            </DialogTrigger>
            {stat.label === "Followers" && (
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Followers ({followers.length})</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {followers.length > 0 ? (
                      followers.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-2"
                        >
                          <img
                            src={user.imageUrl || "/default-avatar.png"}
                            alt={user.fullName}
                            className="size-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{user.fullName}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-zinc-400">
                        No followers yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            )}
            {stat.label === "Following" && (
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Following ({following.length})</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {following.length > 0 ? (
                      following.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-2"
                        >
                          <img
                            src={user.imageUrl || "/default-avatar.png"}
                            alt={user.fullName}
                            className="size-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{user.fullName}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnfollow(user._id)}
                            className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                          >
                            Unfollow
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-zinc-400">
                        Not following anyone yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            )}
          </Dialog>
        ))}
      </div>
    </>
  );
};
export default DashboardStats;
