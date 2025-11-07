import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	stats: Stats;
	userSongs: Song[];
	userAlbums: Album[];
	userStats: Stats;

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	fetchUserSongs: () => Promise<void>;
	fetchUserAlbums: () => Promise<void>;
	fetchUserStats: () => Promise<void>;
	searchSongs: (query: string) => Promise<void>;
	searchAlbums: (query: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
	albums: [],
	songs: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},
	userSongs: [],
	userAlbums: [],
	userStats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
		totalFollowers: 0,
		totalFollowing: 0,
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchUserSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			console.log("Fetching user songs...");
			const response = await axiosInstance.get("/admin/songs");
			console.log("User songs fetched:", response.data);
			set({ userSongs: response.data });
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message;
			console.error("Error fetching user songs:", errorMessage);
			set({ error: errorMessage });
			throw new Error(errorMessage);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchUserAlbums: async () => {
		set({ isLoading: true, error: null });
		try {
			console.log("Fetching user albums...");
			const response = await axiosInstance.get("/admin/albums");
			console.log("User albums fetched:", response.data);
			set({ userAlbums: response.data });
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message;
			console.error("Error fetching user albums:", errorMessage);
			set({ error: errorMessage });
			throw new Error(errorMessage);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchUserStats: async () => {
		set({ isLoading: true, error: null });
		try {
			console.log("Fetching user stats...");
			const response = await axiosInstance.get("/admin/stats");
			console.log("User stats fetched:", response.data);
			set({ userStats: response.data });
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message;
			console.error("Error fetching user stats:", errorMessage);
			set({ error: errorMessage });
			throw new Error(errorMessage);
		} finally {
			set({ isLoading: false });
		}
	},

	searchSongs: async (query: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`);
			set({ songs: response.data, error: null });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	searchAlbums: async (query: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/search?q=${encodeURIComponent(query)}`);
			set({ albums: response.data, error: null });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));
