import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		clerkId: {
			type: String,
			required: true,
			unique: true,
		},
		followers: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
		following: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
		followRequests: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
	},
	{ timestamps: true } //  createdAt, updatedAt
);

export const User = mongoose.model("User", userSchema);
