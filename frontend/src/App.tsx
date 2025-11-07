import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SearchPage from "./pages/search/SearchPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import AudioPlayer from "./layout/components/AudioPlayer";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";

function App() {
  return (
    <>
      <AudioPlayer />
      <Routes>
        <Route
          path="/sso-callback"
          element={
            <AuthenticateWithRedirectCallback
              signUpForceRedirectUrl={"/auth-callback"}
            />
          }
        />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/albums/:albumId" element={<AlbumPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
