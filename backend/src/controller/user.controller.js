import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const currentUser = await User.findOne({ clerkId: currentUserId });

		const users = await User.find({ clerkId: { $ne: currentUserId } });

		// Add follow status for each user
		const usersWithFollowStatus = users.map(user => {
			const isFollowing = currentUser.following.includes(user._id);
			const hasRequested = user.followRequests.includes(currentUser._id);
			const isFollower = currentUser.followers.includes(user._id);
			const hasSentRequest = currentUser.followRequests.includes(user._id);

			let followStatus = 'none';
			if (isFollowing) followStatus = 'following';
			else if (hasRequested) followStatus = 'requested';
			else if (hasSentRequest) followStatus = 'follow_request_pending';
			else if (isFollower) followStatus = 'follows_you';

			return {
				...user.toObject(),
				followStatus
			};
		});

		res.status(200).json(usersWithFollowStatus);
	} catch (error) {
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.auth.userId;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: myId },
				{ senderId: myId, receiverId: userId },
			],
			isDeleted: false, // Only show non-deleted messages
		}).populate('replyTo', 'content senderId').sort({ createdAt: 1 });

		// Mark messages as read when fetching (for the receiver)
		await Message.updateMany(
			{
				senderId: userId,
				receiverId: myId,
				isRead: false,
				isDeleted: false,
			},
			{ isRead: true }
		);

		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

export const getProfile = async (req, res, next) => {
	try {
		let user = await User.findOne({ clerkId: req.auth.userId });
		if (!user) {
			// Create user if not exists
			user = new User({
				clerkId: req.auth.userId,
				fullName: "User", // Default name
				imageUrl: "", // Default empty image
			});
			await user.save();
		}
		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};

const uploadToCloudinary = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

export const updateProfile = async (req, res, next) => {
	try {
		const { fullName } = req.body;
		let imageUrl;

		if (req.files && req.files.imageFile) {
			const imageFile = req.files.imageFile;
			imageUrl = await uploadToCloudinary(imageFile);
		}

		let user = await User.findOne({ clerkId: req.auth.userId });
		if (!user) {
			// Create user if not exists
			user = new User({
				clerkId: req.auth.userId,
				fullName: fullName || "User",
				imageUrl: imageUrl || "",
			});
			await user.save();
		} else {
			// Update existing user
			const updateData = {};
			if (fullName !== undefined) updateData.fullName = fullName;
			if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

			user = await User.findOneAndUpdate(
				{ clerkId: req.auth.userId },
				updateData,
				{ new: true }
			);
		}

		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};

export const searchUsers = async (req, res, next) => {
	try {
		const { q } = req.query;
		if (!q) {
			return res.status(400).json({ message: "Query parameter 'q' is required" });
		}

		const currentUser = await User.findOne({ clerkId: req.auth.userId });

		const users = await User.find({
			clerkId: { $ne: req.auth.userId },
			fullName: { $regex: q, $options: "i" }
		}).limit(10);

		// Add follow status for each user
		const usersWithFollowStatus = users.map(user => {
			const isFollowing = currentUser.following.includes(user._id);
			const hasRequested = user.followRequests.includes(currentUser._id);
			const isFollower = currentUser.followers.includes(user._id);
			const hasSentRequest = currentUser.followRequests.includes(user._id);

			let followStatus = 'none';
			if (isFollowing) followStatus = 'following';
			else if (hasRequested) followStatus = 'requested';
			else if (hasSentRequest) followStatus = 'follow_request_pending';
			else if (isFollower) followStatus = 'follows_you';

			return {
				...user.toObject(),
				followStatus
			};
		});

		res.status(200).json(usersWithFollowStatus);
	} catch (error) {
		next(error);
	}
};

export const sendFollowRequest = async (req, res, next) => {
	try {
		const { targetUserId } = req.body;
		const currentUserId = req.auth.userId;

		const currentUser = await User.findOne({ clerkId: currentUserId });
		const targetUser = await User.findById(targetUserId);

		if (!targetUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if already following
		if (currentUser.following.includes(targetUserId)) {
			return res.status(400).json({ message: "Already following this user" });
		}

		// Check if request already sent to target user - if so, cancel it
		if (targetUser.followRequests.includes(currentUser._id)) {
			targetUser.followRequests = targetUser.followRequests.filter(id => id.toString() !== currentUser._id.toString());
			await targetUser.save();
			return res.status(200).json({ message: "Follow request cancelled" });
		}

		// Add to target's follow requests (not current user's)
		targetUser.followRequests.push(currentUser._id);
		await targetUser.save();

		// Emit socket event for real-time notification
		const io = req.app.get('io');
		if (io) {
			console.log('Emitting follow_request to targetUserId:', targetUserId);
			console.log('Target user clerkId:', targetUser.clerkId);

			// Emit directly to the target user's socket
			const userSockets = io.sockets.sockets;
			let targetSocket = null;
			for (let [socketId, socket] of userSockets) {
				if (socket.handshake?.auth?.userId === targetUser.clerkId) {
					targetSocket = socket;
					break;
				}
			}

			if (targetSocket) {
				console.log('Found target socket, emitting follow_request');
				targetSocket.emit('follow_request', {
					requesterId: currentUserId,
					requesterName: currentUser.fullName,
					requesterImageUrl: currentUser.imageUrl,
				});
			} else {
				console.log('Target user socket not found for clerkId:', targetUser.clerkId);
			}
		}

		res.status(200).json({ message: "Follow request sent" });
	} catch (error) {
		next(error);
	}
};

export const acceptFollowRequest = async (req, res, next) => {
	try {
		const { requesterId } = req.body;
		const currentUserId = req.auth.userId;

		const currentUser = await User.findOne({ clerkId: currentUserId });
		const requester = await User.findOne({ clerkId: requesterId });

		if (!requester) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if request exists (compare ObjectId)
		console.log('Current user followRequests:', currentUser.followRequests);
		console.log('Requester _id:', requester._id.toString());
		const requestExists = currentUser.followRequests.some(id => id.toString() === requester._id.toString());
		console.log('Request exists:', requestExists);
		if (!requestExists) {
			return res.status(400).json({ message: "No follow request from this user" });
		}

		// Remove from requests and add to followers/following
		currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== requester._id.toString());
		currentUser.followers.push(requester._id);
		await currentUser.save();

		requester.following.push(currentUser._id);
		await requester.save();

		// Emit socket event for real-time notification to requester
		const io = req.app.get('io');
		if (io) {
			// Find the requester's socket and emit directly to them
			const userSockets = io.sockets.sockets;
			for (let [socketId, socket] of userSockets) {
				if (socket.handshake?.auth?.userId === requester.clerkId) {
					socket.emit('follow_accepted', {
						accepterId: currentUserId,
						accepterName: currentUser.fullName,
						accepterImageUrl: currentUser.imageUrl,
					});
					break;
				}
			}

		// Also emit to accepter (current user) to show "Follow Back" option
		// Only if accepter is not already following the requester
		if (!currentUser.following.includes(requester._id)) {
			for (let [socketId, socket] of userSockets) {
				if (socket.handshake?.auth?.userId === currentUser.clerkId) {
					socket.emit('follow_back_available', {
						userId: requester.clerkId,
						userName: requester.fullName,
						userImageUrl: requester.imageUrl,
					});
					break;
				}
			}
		}
		}

		res.status(200).json({ message: "Follow request accepted" });
	} catch (error) {
		next(error);
	}
};

export const rejectFollowRequest = async (req, res, next) => {
	try {
		const { requesterId } = req.body;
		const currentUserId = req.auth.userId;

		const currentUser = await User.findOne({ clerkId: currentUserId });
		const requester = await User.findOne({ clerkId: requesterId });

		if (!requester) {
			return res.status(404).json({ message: "User not found" });
		}

		// Remove from requests
		currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== requester._id.toString());
		await currentUser.save();

		// Emit socket event to notify requester of rejection
		const io = req.app.get('io');
		if (io) {
			const userSockets = io.sockets.sockets;
			for (let [socketId, socket] of userSockets) {
				if (socket.handshake?.auth?.userId === requester.clerkId) {
					socket.emit('follow_rejected', {
						rejecterId: currentUserId,
						rejecterName: currentUser.fullName,
					});
					break;
				}
			}
		}

		res.status(200).json({ message: "Follow request rejected" });
	} catch (error) {
		next(error);
	}
};

export const unfollowUser = async (req, res, next) => {
	try {
		const { targetUserId } = req.params;
		const currentUserId = req.auth.userId;

		const currentUser = await User.findOne({ clerkId: currentUserId });
		const targetUser = await User.findById(targetUserId);

		if (!targetUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Remove from following
		currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
		await currentUser.save();

		// Remove from target's followers
		targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
		await targetUser.save();

		res.status(200).json({ message: "Unfollowed successfully" });
	} catch (error) {
		next(error);
	}
};

export const getFollowers = async (req, res, next) => {
	try {
		const currentUser = await User.findOne({ clerkId: req.auth.userId }).populate('followers', 'fullName imageUrl clerkId');
		res.status(200).json(currentUser.followers);
	} catch (error) {
		next(error);
	}
};

export const getFollowing = async (req, res, next) => {
	try {
		const currentUser = await User.findOne({ clerkId: req.auth.userId }).populate('following', 'fullName imageUrl clerkId');
		res.status(200).json(currentUser.following);
	} catch (error) {
		next(error);
	}
};

export const getFollowRequests = async (req, res, next) => {
	try {
		const currentUser = await User.findOne({ clerkId: req.auth.userId }).populate('followRequests', 'fullName imageUrl clerkId');
		res.status(200).json(currentUser.followRequests);
	} catch (error) {
		next(error);
	}
};

export const unsendMessage = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const userId = req.auth.userId;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		// Only sender can unsend their message
		if (message.senderId !== userId) {
			return res.status(403).json({ message: "You can only unsend your own messages" });
		}

		// Soft delete the message
		message.isDeleted = true;
		message.deletedAt = new Date();
		await message.save();

		// Emit socket event to both sender and receiver
		const io = req.app.get('io');
		if (io) {
			const userSockets = io.sockets.sockets;
			const targetUsers = [message.senderId, message.receiverId];

			for (let [socketId, socket] of userSockets) {
				if (targetUsers.includes(socket.handshake?.auth?.userId)) {
					socket.emit('message_unsent', { messageId });
				}
			}
		}

		res.status(200).json({ message: "Message unsent successfully" });
	} catch (error) {
		next(error);
	}
};

export const sendReplyMessage = async (req, res, next) => {
	try {
		const { receiverId, content, replyToId } = req.body;
		const senderId = req.auth.userId;

		// Verify replyTo message exists and belongs to the conversation
		if (replyToId) {
			const replyToMessage = await Message.findById(replyToId);
			if (!replyToMessage) {
				return res.status(404).json({ message: "Reply-to message not found" });
			}

			// Ensure reply-to message is part of this conversation
			const isValidReply = (
				(replyToMessage.senderId === senderId && replyToMessage.receiverId === receiverId) ||
				(replyToMessage.senderId === receiverId && replyToMessage.receiverId === senderId)
			);

			if (!isValidReply) {
				return res.status(400).json({ message: "Invalid reply-to message" });
			}
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			content,
			replyTo: replyToId || null,
		});

		await newMessage.save();

		// Populate replyTo for response
		await newMessage.populate('replyTo', 'content senderId');

		// Emit socket event
		const io = req.app.get('io');
		if (io) {
			const userSockets = io.sockets.sockets;
			for (let [socketId, socket] of userSockets) {
				if (socket.handshake?.auth?.userId === receiverId) {
					socket.emit('receive_message', newMessage);
					break;
				}
			}
		}

		res.status(201).json(newMessage);
	} catch (error) {
		next(error);
	}
};
