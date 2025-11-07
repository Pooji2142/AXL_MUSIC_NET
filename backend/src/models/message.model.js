import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: { type: String, required: true }, // Clerk user ID
		receiverId: { type: String, required: true }, // Clerk user ID
		content: { type: String, required: true },
		isRead: { type: Boolean, default: false }, // Message read status
		replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }, // Reply reference
		isDeleted: { type: Boolean, default: false }, // Soft delete for unsend
		deletedAt: { type: Date, default: null }, // Deletion timestamp
	},
	{ timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
