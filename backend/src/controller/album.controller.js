import { Album } from "../models/album.model.js";

export const getAllAlbums = async (req, res, next) => {
	try {
		const albums = await Album.find();
		res.status(200).json(albums);
	} catch (error) {
		next(error);
	}
};

export const getAlbumById = async (req, res, next) => {
	try {
		const { albumId } = req.params;

		const album = await Album.findById(albumId).populate("songs");

		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};

export const searchAlbums = async (req, res, next) => {
	try {
		const { q } = req.query;
		if (!q) {
			return res.status(400).json({ message: "Query parameter 'q' is required" });
		}

		const albums = await Album.find({
			$or: [
				{ title: { $regex: q, $options: "i" } },
				{ artist: { $regex: q, $options: "i" } }
			]
		}).limit(10);

		res.status(200).json(albums);
	} catch (error) {
		next(error);
	}
};
