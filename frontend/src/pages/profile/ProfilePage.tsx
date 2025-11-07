import { useAuthStore } from "@/stores/useAuthStore";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader, Upload } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, fetchProfile, updateProfile, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPreviewUrl(user.imageUrl);
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      if (selectedFile) {
        formData.append("imageFile", selectedFile);
      }
      await updateProfile(formData);
      toast.success("Profile updated successfully");
      setSelectedFile(null);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-full transition-transform hover:-translate-x-1"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-zinc-700 border-zinc-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="size-20 rounded-full object-cover border-2 border-zinc-600"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="size-4" />
                      {selectedFile ? "Change Image" : "Upload Image"}
                    </Button>
                    {selectedFile && (
                      <p className="text-sm text-zinc-400 mt-1">
                        {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader className="size-4 animate-spin mr-2" />}
                  Update Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
