import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkAdmin, createAlbum, createSong, deleteAlbum, deleteSong, getUserSongs, getUserAlbums, getUserStats } from "../controller/admin.controller.js";

const router = Router();

router.get("/check", protectRoute, checkAdmin);

router.get("/songs", protectRoute, getUserSongs);
router.post("/songs", protectRoute, createSong);
router.delete("/songs/:id", protectRoute, deleteSong);

router.get("/albums", protectRoute, getUserAlbums);
router.post("/albums", protectRoute, createAlbum);
router.delete("/albums/:id", protectRoute, deleteAlbum);

router.get("/stats", protectRoute, getUserStats);

export default router;
