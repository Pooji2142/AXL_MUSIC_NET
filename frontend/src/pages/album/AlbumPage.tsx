import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
  const { albumId } = useParams();
  const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  useEffect(() => {
    if (albumId) fetchAlbumById(albumId);
  }, [fetchAlbumById, albumId]);

  if (isLoading) return null;

  const handlePlayAlbum = () => {
    if (!currentAlbum) return;

    const isCurrentAlbumPlaying = currentAlbum?.songs.some(
      (song) => song._id === currentSong?._id
    );
    if (isCurrentAlbumPlaying) togglePlay();
    else playAlbum(currentAlbum?.songs, 0);
  };

  const handlePlaySong = (index: number) => {
    if (!currentAlbum) return;
    playAlbum(currentAlbum?.songs, index);
  };

  return (
    <div className="h-full">
      {/* Increased the visible height of scroll area */}
      <ScrollArea className="h-[calc(100vh-100px)] rounded-md">
        <div className="relative min-h-full">
          {/* Background gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-sky-800/70 via-zinc-900/80 to-zinc-950 pointer-events-none"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Album header */}
            <div className="flex p-8 gap-6">
              <img
                src={currentAlbum?.imageUrl}
                alt={currentAlbum?.title}
                className="w-[260px] h-[260px] shadow-xl rounded-lg shadow-cyan-500/30"
              />
              <div className="flex flex-col justify-end">
                <p className="text-sm font-medium text-sky-300">Album</p>
                <h1 className="text-7xl font-bold my-4 bg-gradient-to-r from-sky-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                  {currentAlbum?.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-zinc-200">
                  <span className="font-medium text-sky-200">
                    {currentAlbum?.artist}
                  </span>
                  <span>• {currentAlbum?.songs.length} songs</span>
                  <span>• {currentAlbum?.releaseYear}</span>
                </div>
              </div>
            </div>

            {/* Play button */}
            <div className="px-8 pb-10 flex items-center gap-6">
              <Button
                onClick={handlePlayAlbum}
                size="icon"
                className="w-14 h-14 rounded-full 
                bg-gradient-to-br from-sky-400 to-cyan-500 
                hover:from-sky-300 hover:to-cyan-400 
                hover:scale-110 transition-all 
                shadow-lg shadow-sky-400/40 border border-sky-300/30"
              >
                {isPlaying &&
                currentAlbum?.songs.some(
                  (song) => song._id === currentSong?._id
                ) ? (
                  <Pause className="h-7 w-7 text-sky-50 drop-shadow-[0_0_8px_#38bdf8]" />
                ) : (
                  <Play className="h-7 w-7 text-sky-50 drop-shadow-[0_0_8px_#38bdf8]" />
                )}
              </Button>
            </div>

            {/* Table Section */}
            <div className="bg-sky-950/20 backdrop-blur-sm rounded-t-lg border-t border-cyan-500/20">
              <div
                className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-10 py-2 text-sm 
                text-sky-300 border-b border-cyan-500/20"
              >
                <div>#</div>
                <div>Title</div>
                <div>Released Date</div>
                <div>
                  <Clock className="h-4 w-4 text-sky-300" />
                </div>
              </div>

              <div className="px-6">
                <div className="space-y-2 py-8">
                  {currentAlbum?.songs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;
                    return (
                      <div
                        key={song._id}
                        onClick={() => handlePlaySong(index)}
                        className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 text-sm 
                          ${
                            isCurrentSong
                              ? "bg-cyan-900/30 text-white"
                              : "text-sky-200 hover:bg-sky-800/30"
                          } 
                          rounded-md group cursor-pointer transition-all`}
                      >
                        <div className="flex items-center justify-center">
                          {isCurrentSong && isPlaying ? (
                            <div className="size-4 text-sky-400 animate-pulse drop-shadow-[0_0_6px_#38bdf8]">
                              ♫
                            </div>
                          ) : (
                            <span className="group-hover:hidden">
                              {index + 1}
                            </span>
                          )}
                          {!isCurrentSong && (
                            <Play className="h-4 w-4 hidden group-hover:block text-sky-300" />
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="size-10 rounded-sm shadow-md shadow-sky-400/20"
                          />
                          <div>
                            <div
                              className={`font-medium ${
                                isCurrentSong ? "text-sky-300" : "text-white"
                              }`}
                            >
                              {song.title}
                            </div>
                            <div className="text-sky-400/80">{song.artist}</div>
                          </div>
                        </div>

                        <div className="flex items-center text-sky-300/80">
                          {song.createdAt.split("T")[0]}
                        </div>

                        <div className="flex items-center text-sky-300/80">
                          {formatDuration(song.duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;
