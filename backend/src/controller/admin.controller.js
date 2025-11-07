import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUserSongs = async (req, res, next) => {
	try {
		console.log("getUserSongs called for userId:", req.auth.userId);
		const songs = await Song.find({ uploadedBy: req.auth.userId });
		console.log("Songs found:", songs.length);
		res.status(200).json(songs);
	} catch (error) {
		console.log("Error in getUserSongs", error);
		next(error);
	}
};

export const getUserAlbums = async (req, res, next) => {
	try {
		console.log("getUserAlbums called for userId:", req.auth.userId);
		const albums = await Album.find({ uploadedBy: req.auth.userId });
		console.log("Albums found:", albums.length);
		res.status(200).json(albums);
	} catch (error) {
		console.log("Error in getUserAlbums", error);
		next(error);
	}
};

export const getUserStats = async (req, res, next) => {
	try {
		console.log("getUserStats called for userId:", req.auth.userId);
		const [totalSongs, totalAlbums, uniqueArtists, user] = await Promise.all([
			Song.countDocuments({ uploadedBy: req.auth.userId }),
			Album.countDocuments({ uploadedBy: req.auth.userId }),
			Song.aggregate([
				{ $match: { uploadedBy: req.auth.userId } },
				{
					$unionWith: {
						coll: "albums",
						pipeline: [{ $match: { uploadedBy: req.auth.userId } }],
					},
				},
				{
					$group: {
						_id: "$artist",
					},
				},
				{
					$count: "count",
				},
			]),
			User.findOne({ clerkId: req.auth.userId }).populate('followers').populate('following')
		]);

		const stats = {
			totalAlbums,
			totalSongs,
			totalArtists: uniqueArtists[0]?.count || 0,
			totalUsers: await User.countDocuments(), // Total users in the system
			totalFollowers: user?.followers?.length || 0,
			totalFollowing: user?.following?.length || 0,
		};
		console.log("Stats calculated:", stats);
		res.status(200).json(stats);
	} catch (error) {
		console.log("Error in getUserStats", error);
		next(error);
	}
};

// helper function for cloudinary uploads
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

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist, albumId, duration } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await uploadToCloudinary(audioFile);
		const imageUrl = await uploadToCloudinary(imageFile);

		const song = new Song({
			title,
			artist,
			audioUrl,
			imageUrl,
			duration,
			albumId: albumId || null,
			uploadedBy: req.auth.userId,
		});

		await song.save();

		// if song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}
		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);

		// Check if the song belongs to the current user
		if (song.uploadedBy !== req.auth.userId) {
			return res.status(403).json({ message: "You can only delete your own songs" });
		}

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const createAlbum = async (req, res, next) => {
	try {
		const { title, artist, releaseYear } = req.body;
		const { imageFile } = req.files;

		const imageUrl = await uploadToCloudinary(imageFile);

		const album = new Album({
			title,
			artist,
			imageUrl,
			releaseYear,
			uploadedBy: req.auth.userId,
		});

		await album.save();

		res.status(201).json(album);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;

		const album = await Album.findById(id);

		// Check if the album belongs to the current user
		if (album.uploadedBy !== req.auth.userId) {
			return res.status(403).json({ message: "You can only delete your own albums" });
		}

		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	console.log("checkAdmin called for userId:", req.auth.userId);
	res.status(200).json({ admin: true });
};
