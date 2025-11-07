import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const updateApiToken = (token: string | null) => {
  if (token)
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const { checkAdminStatus, fetchProfile } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        tokenRef.current = token;
        updateApiToken(token);
        if (token) {
          await checkAdminStatus();
          await fetchProfile();
          // init socket
          if (userId) initSocket(userId);
        }
      } catch (error: any) {
        tokenRef.current = null;
        updateApiToken(null);
        console.log("Error in auth provider", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up token refresh interval - very frequent refresh
    const tokenRefreshInterval = setInterval(async () => {
      try {
        const token = await getToken();
        if (token && token !== tokenRef.current) {
          tokenRef.current = token;
          updateApiToken(token);
          console.log(
            "Token refreshed automatically at",
            new Date().toLocaleTimeString()
          );
        }
      } catch (error) {
        console.log("Error refreshing token", error);
        tokenRef.current = null;
        updateApiToken(null);
      }
    }, 15 * 1000); // Refresh every 15 seconds

    // clean up
    return () => {
      clearInterval(tokenRefreshInterval);
      disconnectSocket();
    };
  }, [
    getToken,
    userId,
    checkAdminStatus,
    fetchProfile,
    initSocket,
    disconnectSocket,
  ]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );

  return <>{children}</>;
};
export default AuthProvider;
