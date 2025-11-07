import { axiosInstance } from "@/lib/axios";
import { Message, User } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";

interface Notification {
	id: string;
	senderId: string;
	senderName: string;
	senderImageUrl: string;
	content: string;
	timestamp: string;
	isRead: boolean;
	type: 'message' | 'follow_request' | 'follow_accepted' | 'follow_rejected' | 'follow_back_request';
}

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	messages: Message[];
	selectedUser: User | null;
	notifications: Notification[];
	unreadNotificationsCount: number;
	lastMessageTime: Map<string, number>; // clerkId -> timestamp
	replyTo: Message | null; // Message being replied to

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, senderId: string, content: string) => void;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
	searchUsers: (query: string) => Promise<void>;
	markNotificationAsRead: (notificationId: string) => void;
	dismissNotification: (notificationId: string) => void;
	sendFollowRequest: (targetUserId: string) => Promise<void>;
	acceptFollowRequest: (requesterId: string) => Promise<void>;
	rejectFollowRequest: (requesterId: string) => Promise<void>;
	unfollowUser: (targetUserId: string) => Promise<void>;
	unsendMessage: (messageId: string) => Promise<void>;
	sendReplyMessage: (receiverId: string, content: string, replyToId?: string) => Promise<void>;
	setReplyTo: (message: Message | null) => void;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, {
	autoConnect: false, // only connect if user is authenticated
	withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket: socket,
	isConnected: false,
	onlineUsers: new Set(),
	userActivities: new Map(),
	messages: [],
	selectedUser: null,
	notifications: [],
	unreadNotificationsCount: 0,
	lastMessageTime: new Map(),
	replyTo: null,

	setSelectedUser: (user) => set({ selectedUser: user }),

	markNotificationAsRead: (notificationId: string) => set((state) => ({
		notifications: state.notifications.map(n =>
			n.id === notificationId ? { ...n, isRead: true } : n
		),
		unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
	})),

	dismissNotification: (notificationId: string) => set((state) => {
		const notification = state.notifications.find(n => n.id === notificationId);
		const wasUnread = notification && !notification.isRead;
		return {
			notifications: state.notifications.filter(n => n.id !== notificationId),
			unreadNotificationsCount: wasUnread
				? Math.max(0, state.unreadNotificationsCount - 1)
				: state.unreadNotificationsCount,
		};
	}),

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users");
			set({ users: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	refetchUsers: async () => {
		try {
			const response = await axiosInstance.get("/users");
			set({ users: response.data });
		} catch (error: any) {
			console.error("Error refetching users:", error);
		}
	},

	initSocket: (userId) => {
		if (!get().isConnected) {
			console.log('Initializing socket for userId:', userId);
			socket.auth = { userId };
			socket.connect();

			socket.emit("user_connected", userId);

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("activities", (activities: [string, string][]) => {
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					return { onlineUsers: newOnlineUsers };
				});
			});

			socket.on("receive_message", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
					lastMessageTime: new Map(state.lastMessageTime).set(message.senderId, new Date(message.createdAt).getTime()),
				}));

				// Add notification for new message
				const sender = get().users.find(u => u.clerkId === message.senderId);
				if (sender) {
					const notification: Notification = {
						id: message._id,
						senderId: message.senderId,
						senderName: sender.fullName,
						senderImageUrl: sender.imageUrl,
						content: message.content,
						timestamp: message.createdAt,
						isRead: false,
						type: 'message',
					};

					set((state) => ({
						notifications: [notification, ...state.notifications],
						unreadNotificationsCount: state.unreadNotificationsCount + 1,
					}));
				}
			});

			socket.on("message_unsent", ({ messageId }) => {
				set((state) => ({
					messages: state.messages.filter(msg => msg._id !== messageId)
				}));
			});

			socket.on("message_sent", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
					lastMessageTime: new Map(state.lastMessageTime).set(message.receiverId, new Date(message.createdAt).getTime()),
				}));
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			socket.on("profile_updated", (updatedUser) => {
				set((state) => ({
					users: state.users.map((user) =>
						user.clerkId === updatedUser.clerkId
							? { ...user, fullName: updatedUser.fullName, imageUrl: updatedUser.imageUrl }
							: user
					),
				}));
			});

			socket.on("follow_request", (data) => {
				console.log('Received follow_request socket event:', data);
				const notification: Notification = {
					id: `follow_${data.requesterId}_${Date.now()}`,
					senderId: data.requesterId,
					senderName: data.requesterName,
					senderImageUrl: data.requesterImageUrl,
					content: `${data.requesterName} sent you a follow request`,
					timestamp: new Date().toISOString(),
					isRead: false,
					type: 'follow_request',
				};

				console.log('Adding follow request notification:', notification);
				set((state) => ({
					notifications: [notification, ...state.notifications],
					unreadNotificationsCount: state.unreadNotificationsCount + 1,
				}));

				// Refetch users to update follow status
				get().fetchUsers();
			});

			socket.on("follow_accepted", (data) => {
				console.log('Received follow_accepted:', data);
				const notification: Notification = {
					id: `follow_accepted_${data.accepterId}_${Date.now()}`,
					senderId: data.accepterId,
					senderName: data.accepterName,
					senderImageUrl: data.accepterImageUrl,
					content: `${data.accepterName} accepted your follow request`,
					timestamp: new Date().toISOString(),
					isRead: false,
					type: 'follow_accepted',
				};

				set((state) => ({
					notifications: [notification, ...state.notifications],
					unreadNotificationsCount: state.unreadNotificationsCount + 1,
				}));

				// Refetch users to update follow status
				get().fetchUsers();
			});

			socket.on("follow_rejected", (data) => {
				console.log('Received follow_rejected:', data);
				const notification: Notification = {
					id: `follow_rejected_${data.rejecterId}_${Date.now()}`,
					senderId: data.rejecterId,
					senderName: data.rejecterName,
					senderImageUrl: '',
					content: `${data.rejecterName} rejected your follow request`,
					timestamp: new Date().toISOString(),
					isRead: false,
					type: 'follow_rejected',
				};

				set((state) => ({
					notifications: [notification, ...state.notifications],
					unreadNotificationsCount: state.unreadNotificationsCount + 1,
				}));

				// Refetch users to update follow status
				get().fetchUsers();
			});

			socket.on("follow_back_request", (data) => {
				console.log('Received follow_back_request:', data);
				const notification: Notification = {
					id: `follow_back_request_${data.requesterId}_${Date.now()}`,
					senderId: data.requesterId,
					senderName: data.requesterName,
					senderImageUrl: data.requesterImageUrl,
					content: `${data.requesterName} wants to follow you back!`,
					timestamp: new Date().toISOString(),
					isRead: false,
					type: 'follow_back_request',
				};

				set((state) => ({
					notifications: [notification, ...state.notifications],
					unreadNotificationsCount: state.unreadNotificationsCount + 1,
				}));

				// Refetch users to update follow status
				get().fetchUsers();
			});

			socket.on("follow_back_available", (data) => {
				console.log('Received follow_back_available:', data);
				const notification: Notification = {
					id: `follow_back_available_${data.userId}_${Date.now()}`,
					senderId: data.userId,
					senderName: data.userName,
					senderImageUrl: data.userImageUrl,
					content: `${data.userName} accepted your follow request. Follow back?`,
					timestamp: new Date().toISOString(),
					isRead: false,
					type: 'follow_back_request',
				};

				set((state) => ({
					notifications: [notification, ...state.notifications],
					unreadNotificationsCount: state.unreadNotificationsCount + 1,
				}));
			});

			set({ isConnected: true });
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			set({ isConnected: false });
		}
	},

	sendMessage: async (receiverId, senderId, content) => {
		const socket = get().socket;
		if (!socket) return;

		socket.emit("send_message", { receiverId, senderId, content });
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			set({ messages: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	searchUsers: async (query: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
			set({ users: response.data, error: null });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	// Add follow-related functions
	sendFollowRequest: async (targetUserId: string) => {
		try {
			await axiosInstance.post('/users/follow', { targetUserId });
		} catch (error: any) {
			throw new Error(error.response?.data?.message || 'Failed to send follow request');
		}
	},

	acceptFollowRequest: async (requesterId: string) => {
		try {
			await axiosInstance.post('/users/follow/accept', { requesterId });
			// Refetch users to update follow status after accepting
			await get().fetchUsers();
		} catch (error: any) {
			throw new Error(error.response?.data?.message || 'Failed to accept follow request');
		}
	},

	rejectFollowRequest: async (requesterId: string) => {
		try {
			await axiosInstance.post('/users/follow/reject', { requesterId });
			// Refetch users to update follow status after rejecting
			await get().fetchUsers();
		} catch (error: any) {
			throw new Error(error.response?.data?.message || 'Failed to reject follow request');
		}
	},

	unfollowUser: async (targetUserId: string) => {
		try {
			await axiosInstance.delete(`/users/follow/${targetUserId}`);
		} catch (error: any) {
			throw new Error(error.response?.data?.message || 'Failed to unfollow user');
		}
	},

	unsendMessage: async (messageId: string) => {
		try {
			await axiosInstance.delete(`/users/messages/${messageId}`);
			set((state) => ({
				messages: state.messages.filter(msg => msg._id !== messageId)
			}));
		} catch (error) {
			console.error("Error unsending message:", error);
		}
	},

	sendReplyMessage: async (receiverId: string, content: string, replyToId?: string) => {
		try {
			const response = await axiosInstance.post('/users/messages/reply', {
				receiverId,
				content,
				replyToId
			});
			const newMessage = response.data;

			set((state) => ({
				messages: [...state.messages, newMessage],
				replyTo: null // Clear reply state after sending
			}));
		} catch (error) {
			console.error("Error sending reply message:", error);
		}
	},

	setReplyTo: (message: Message | null) => set({ replyTo: message }),
}));
