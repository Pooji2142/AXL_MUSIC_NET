import { Router } from "express";
import { getAlbumById, getAllAlbums, searchAlbums } from "../controller/album.controller.js";

const router = Router();

router.get("/search", searchAlbums);
router.get("/:albumId", getAlbumById);
router.get("/", getAllAlbums);

export default router;
