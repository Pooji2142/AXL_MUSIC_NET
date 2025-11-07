import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
	timeout: 10000, // 10 second timeout
});

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Try to refresh token automatically
			try {
				// Import getToken dynamically to avoid circular dependency
				const { useAuth } = await import("@clerk/clerk-react");
				const { getToken } = useAuth();
				const newToken = await getToken();
				if (newToken) {
					axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
					// Retry the original request
					error.config.headers.Authorization = `Bearer ${newToken}`;
					console.log("Token refreshed and request retried");
					return axiosInstance(error.config);
				}
			} catch (refreshError) {
				console.log("Token refresh failed", refreshError);
			}

			// If refresh failed, clear token and show error
			delete axiosInstance.defaults.headers.common["Authorization"];
			console.error("Authentication failed. Please refresh the page.");
			// Don't show toast to avoid spam, just log to console
		}
		return Promise.reject(error);
	}
);
