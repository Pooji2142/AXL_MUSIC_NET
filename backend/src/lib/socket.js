import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (io) => {
	const userSockets = new Map(); // { userId: socketId}
	const userActivities = new Map(); // {userId: activity}

	io.on("connection", (socket) => {
		socket.on("user_connected", (userId) => {
			socket.handshake.auth = { userId }; // Store userId in socket auth
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle");

			console.log('User connected:', userId, 'socket:', socket.id);

			// broadcast to all connected sockets that this user just logged in
			io.emit("user_connected", userId);

			socket.emit("users_online", Array.from(userSockets.keys()));

			io.emit("activities", Array.from(userActivities.entries()));
		});

		socket.on("update_activity", ({ userId, activity }) => {
			console.log("activity updated", userId, activity);
			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		socket.on("profile_updated", (updatedUser) => {
			console.log("profile updated", updatedUser.clerkId);
			io.emit("profile_updated", updatedUser);
		});

		socket.on("follow_request", (data) => {
			const { targetUserId, requesterId, requesterName, requesterImageUrl } = data;
			console.log('Socket received follow_request:', data);
			const targetSocketId = userSockets.get(targetUserId);
			console.log('Target socket ID for', targetUserId, ':', targetSocketId);
			if (targetSocketId) {
				console.log('Emitting follow_request to target socket');
				io.to(targetSocketId).emit("follow_request", {
					requesterId,
					requesterName,
					requesterImageUrl,
				});
			} else {
				console.log('No target socket found for user:', targetUserId);
			}
		});

		socket.on("follow_accepted", (data) => {
			const { requesterId, accepterId, accepterName, accepterImageUrl } = data;
			const requesterSocketId = userSockets.get(requesterId);
			if (requesterSocketId) {
				io.to(requesterSocketId).emit("follow_accepted", {
					accepterId,
					accepterName,
					accepterImageUrl,
				});
			}
		});

		socket.on("follow_back_request", (data) => {
			const { targetUserId, requesterId, requesterName, requesterImageUrl } = data;
			const targetSocketId = userSockets.get(targetUserId);
			if (targetSocketId) {
				io.to(targetSocketId).emit("follow_back_request", {
					requesterId,
					requesterName,
					requesterImageUrl,
				});
			}
		});

		socket.on("follow_back_available", (data) => {
			const { userId, userName, userImageUrl } = data;
			const socketId = userSockets.get(socket.handshake?.auth?.userId);
			if (socketId) {
				io.to(socketId).emit("follow_back_available", {
					userId,
					userName,
					userImageUrl,
				});
			}
		});

		socket.on("send_message", async (data) => {
			try {
				const { senderId, receiverId, content } = data;

				const message = await Message.create({
					senderId,
					receiverId,
					content,
				});

				// send to receiver in realtime, if they're online
				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", () => {
			let disconnectedUserId;
			for (const [userId, socketId] of userSockets.entries()) {
				// find disconnected user
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			if (disconnectedUserId) {
				io.emit("user_disconnected", disconnectedUserId);
			}
		});
	});
};
