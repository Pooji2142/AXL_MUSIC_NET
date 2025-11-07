import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, UserCheck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";

const NotificationsPage = () => {
  const { user } = useUser();
  const {
    fetchUsers,
    notifications,
    markNotificationAsRead,
    dismissNotification,
    acceptFollowRequest,
    rejectFollowRequest,
  } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchUsers();
  }, [fetchUsers, user]);

  // Fetch follow requests on component mount to persist notifications
  useEffect(() => {
    const fetchFollowRequests = async () => {
      try {
        const response = await axiosInstance.get("/users/follow-requests");
        const followRequests = response.data;
        console.log("Fetched follow requests:", followRequests);

        // Clear existing follow request notifications first
        const existingFollowRequests = notifications.filter(
          (n) => n.type === "follow_request"
        );
        existingFollowRequests.forEach((n) => {
          useChatStore.getState().dismissNotification(n.id);
        });

        // Add persistent follow request notifications
        followRequests.forEach((requester: any) => {
          const notification = {
            id: `follow_request_${requester.clerkId}_${Date.now()}`,
            senderId: requester.clerkId,
            senderName: requester.fullName,
            senderImageUrl: requester.imageUrl,
            content: `${requester.fullName} sent you a follow request`,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: "follow_request" as const,
          };
          useChatStore.getState().notifications.unshift(notification);
          useChatStore.getState().unreadNotificationsCount++;
        });
      } catch (error) {
        console.error("Failed to fetch follow requests:", error);
      }
    };

    if (user) {
      fetchFollowRequests();
    }
  }, [user]); // Remove notifications dependency to prevent re-runs

  // Notifications are now managed by the chat store

  const handleNotificationClick = async (notification: any) => {
    if (notification.type === "follow_request") {
      // Don't navigate for follow requests - handle them in place
      return;
    }

    // Clear all notifications from this sender
    const notificationsToClear = notifications.filter(
      (n) => n.senderId === notification.senderId
    );
    notificationsToClear.forEach((n) => {
      markNotificationAsRead(n.id);
    });

    // Find the user and set as selected user, then navigate to chat
    const sender = useChatStore
      .getState()
      .users.find((u) => u.clerkId === notification.senderId);
    if (sender) {
      useChatStore.getState().setSelectedUser(sender);
    }

    // Navigate to chat
    navigate("/chat");
  };

  const handleDismissNotification = (notificationId: string) => {
    dismissNotification(notificationId);
  };

  const [processingNotifications, setProcessingNotifications] = useState<
    Set<string>
  >(new Set());

  const handleAcceptFollow = async (notification: any) => {
    if (processingNotifications.has(notification.id)) return;

    setProcessingNotifications((prev) => new Set(prev).add(notification.id));
    try {
      await acceptFollowRequest(notification.senderId);
      dismissNotification(notification.id);
      toast.success("Follow request accepted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to accept follow request");
    } finally {
      setProcessingNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleRejectFollow = async (notification: any) => {
    if (processingNotifications.has(notification.id)) return;

    setProcessingNotifications((prev) => new Set(prev).add(notification.id));
    try {
      await rejectFollowRequest(notification.senderId);
      dismissNotification(notification.id);
      toast.success("Follow request rejected!");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject follow request");
    } finally {
      setProcessingNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleFollowBack = async (notification: any) => {
    if (processingNotifications.has(notification.id)) return;

    setProcessingNotifications((prev) => new Set(prev).add(notification.id));
    try {
      // Find the user to get the _id
      const user = useChatStore
        .getState()
        .users.find((u) => u.clerkId === notification.senderId);
      if (!user) {
        throw new Error("User not found");
      }
      await axiosInstance.post("/users/follow", {
        targetUserId: user._id,
      });
      dismissNotification(notification.id);
      toast.success("Follow request sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send follow request");
    } finally {
      setProcessingNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden">
      <Topbar />

      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-zinc-400">
                You have {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="size-12 text-zinc-400 mb-4" />
                  <h3 className="text-zinc-300 text-lg font-medium mb-2">
                    No notifications yet
                  </h3>
                  <p className="text-zinc-500 text-center">
                    When someone sends you a message, you'll see it here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`bg-zinc-800/50 border-zinc-700 cursor-pointer transition-all duration-200 hover:bg-zinc-800/70 ${
                    !notification.isRead ? "ring-2 ring-blue-500/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={notification.senderImageUrl} />
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-white truncate">
                            {notification.senderName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400">
                              {formatTime(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissNotification(notification.id);
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-zinc-300 line-clamp-2">
                          {notification.content}
                        </p>

                        {notification.type === "follow_request" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              disabled={processingNotifications.has(
                                notification.id
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptFollow(notification);
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              {processingNotifications.has(notification.id)
                                ? "Processing..."
                                : "Accept"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={processingNotifications.has(
                                notification.id
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectFollow(notification);
                              }}
                              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {processingNotifications.has(notification.id)
                                ? "Processing..."
                                : "Reject"}
                            </Button>
                          </div>
                        )}

                        {notification.type === "follow_back_request" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              disabled={processingNotifications.has(
                                notification.id
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollowBack(notification);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              {processingNotifications.has(notification.id)
                                ? "Sending..."
                                : "Follow Back"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default NotificationsPage;
