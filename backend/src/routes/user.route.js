import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	getAllUsers,
	getMessages,
	getProfile,
	updateProfile,
	searchUsers,
	sendFollowRequest,
	acceptFollowRequest,
	rejectFollowRequest,
	unfollowUser,
	getFollowers,
	getFollowing,
	getFollowRequests,
	unsendMessage,
	sendReplyMessage
} from "../controller/user.controller.js";
const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);
router.get("/search", protectRoute, searchUsers);

// Follow system routes
router.post("/follow", protectRoute, sendFollowRequest);
router.post("/follow/accept", protectRoute, acceptFollowRequest);
router.post("/follow/reject", protectRoute, rejectFollowRequest);
router.delete("/follow/:targetUserId", protectRoute, unfollowUser);
router.get("/followers", protectRoute, getFollowers);
router.get("/following", protectRoute, getFollowing);
router.get("/follow-requests", protectRoute, getFollowRequests);

// Message actions
router.delete("/messages/:messageId", protectRoute, unsendMessage);
router.post("/messages/reply", protectRoute, sendReplyMessage);

export default router;
