import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { Send, X, Smile } from "lucide-react";
import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useUser();
  const { selectedUser, sendMessage, replyTo, setReplyTo, sendReplyMessage } =
    useChatStore();

  const handleSend = () => {
    if (!selectedUser || !user || !newMessage) return;

    if (replyTo) {
      sendReplyMessage(selectedUser.clerkId, newMessage.trim(), replyTo._id);
    } else {
      sendMessage(selectedUser.clerkId, user.id, newMessage.trim());
    }

    setNewMessage("");
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 border-t border-zinc-800 bg-zinc-900 sticky bottom-0 relative">
      {replyTo && (
        <div className="mb-2 p-2 bg-zinc-800 rounded-lg border-l-4 border-blue-500 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-zinc-400">Replying to</p>
            <p className="text-sm text-zinc-300">
              {replyTo.content.length > 50
                ? `${replyTo.content.substring(0, 50)}...`
                : replyTo.content}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReplyTo(null)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder={replyTo ? "Type your reply..." : "Type a message"}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="bg-zinc-800 border-none resize-none flex-1 max-w-3/4"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <Button
          size={"icon"}
          variant="ghost"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-zinc-400 hover:text-zinc-200"
        >
          <Smile className="size-4" />
        </Button>

        <Button
          size={"icon"}
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          <Send className="size-4" />
        </Button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-50">
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
        </div>
      )}
    </div>
  );
};
export default MessageInput;
