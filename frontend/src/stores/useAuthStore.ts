import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface User {
	_id: string;
	fullName: string;
	imageUrl: string;
	clerkId: string;
}

interface AuthStore {
	isAdmin: boolean;
	isLoading: boolean;
	error: string | null;
	user: User | null;

	checkAdminStatus: () => Promise<void>;
	fetchProfile: () => Promise<void>;
	updateProfile: (data: FormData | { fullName: string; imageUrl: string }) => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isLoading: false,
	error: null,
	user: null,

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/check");
			set({ isAdmin: response.data.admin });
		} catch (error: any) {
			set({ isAdmin: false, error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchProfile: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users/profile");
			set({ user: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	updateProfile: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put("/users/profile", data, {
				headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
			});
			set({ user: response.data });
			// Emit socket event to notify other users of profile update
			const socket = (window as any).socket;
			if (socket) {
				socket.emit("profile_updated", response.data);
			}
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ isAdmin: false, isLoading: false, error: null, user: null });
	},
}));
