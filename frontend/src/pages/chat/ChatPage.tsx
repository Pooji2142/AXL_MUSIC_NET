import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import MessageInput from "./components/MessageInput";

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatPage = () => {
  const { user } = useUser();
  const {
    messages,
    selectedUser,
    fetchUsers,
    fetchMessages,
    setReplyTo,
    unsendMessage,
  } = useChatStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    message: any;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (user) fetchUsers();
  }, [fetchUsers, user]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.clerkId);
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Auto scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollAreaRef.current!.scrollTop = scrollAreaRef.current!.scrollHeight;
      }, 100);
    }
  }, [messages]);

  console.log({ messages });

  return (
    <main className="h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 flex flex-col">
      <Topbar />

      <div className="grid lg:grid-cols-[320px_1fr] md:grid-cols-[120px_1fr] grid-cols-[80px_1fr] flex-1 overflow-hidden">
        <UsersList />

        {/* chat message */}
        <div className="flex flex-col h-full overflow-hidden">
          {selectedUser ? (
            <>
              <ChatHeader />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex items-start gap-3 ${
                        message.senderId === user?.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="size-8 flex-shrink-0">
                        <AvatarImage
                          src={
                            message.senderId === user?.id
                              ? user.imageUrl
                              : selectedUser.imageUrl
                          }
                        />
                      </Avatar>

                      <div
                        className="rounded-lg p-3 max-w-[40%] w-fit break-words shadow-sm cursor-pointer hover:opacity-90 transition-opacity relative bg-black border border-zinc-700"
                        onClick={() => setReplyTo(message)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            message,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }}
                      >
                        {message.replyTo && (
                          <div className="border-l-2 border-zinc-500 pl-2 mb-2 opacity-70">
                            <p className="text-xs text-zinc-400">
                              Replying to{" "}
                              {message.replyTo.senderId === user?.id
                                ? "yourself"
                                : "them"}
                            </p>
                            <p className="text-xs text-zinc-300 italic font-mono">
                              {message.replyTo.content.length > 50
                                ? `${message.replyTo.content.substring(
                                    0,
                                    50
                                  )}...`
                                : message.replyTo.content}
                            </p>
                          </div>
                        )}
                        <p className="text-base whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-zinc-300">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isRead && message.senderId === user?.id && (
                            <span className="text-xs text-blue-400">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <MessageInput />
            </>
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-2 min-w-[120px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700"
            onClick={() => {
              setReplyTo(contextMenu.message);
              setContextMenu(null);
            }}
          >
            <MessageSquare className="size-4 mr-2" />
            Reply
          </Button>
          {contextMenu.message.senderId === user?.id && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-zinc-700"
              onClick={() => {
                unsendMessage(contextMenu.message._id);
                setContextMenu(null);
              }}
            >
              <Trash2 className="size-4 mr-2" />
              Unsend
            </Button>
          )}
        </div>
      )}

      {/* Overlay to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        />
      )}
    </main>
  );
};
export default ChatPage;

const NoConversationPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-6">
    <img src="/spotify.png" alt="Spotify" className="size-16 animate-bounce" />
    <div className="text-center">
      <h3 className="text-zinc-300 text-lg font-medium mb-1">
        No conversation selected
      </h3>
      <p className="text-zinc-500 text-sm">Choose a friend to start chatting</p>
    </div>
  </div>
);
