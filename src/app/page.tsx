"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import AudioPlayer from "./components/AudioPlayer";

interface DownloadedAudio {
  url: string;
  title: string;
}

interface Song {
  url: string;
  title: string;
  date: string;
}

export default function Home() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const [downloadedAudio, setDownloadedAudio] =
    useState<DownloadedAudio | null>(null);

  // Initialize songs from localStorage
  const [songs, setSongs] = useState<Song[]>(() => {
    if (typeof window !== "undefined") {
      const savedSongs = localStorage.getItem("songs");
      return savedSongs ? JSON.parse(savedSongs) : [];
    }
    return [];
  });
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // Effect to load songs from localStorage on mountyo
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSongs = localStorage.getItem("songs");
      if (savedSongs) {
        setSongs(JSON.parse(savedSongs));
      }
    }
  }, []);

  // Effect to save songs to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("songs", JSON.stringify(songs));
    }
  }, [songs]);

  if (sessionStatus === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  if (sessionStatus === "loading") {
    return null;
  }

  const username = session?.user?.name;
  const image = session?.user?.image;

  async function sendURL(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Error with downloading Audio");
        setStatus(`Error: ${data.error || "Download failed"}`);
        return;
      }

      if (data.filename) {
        const newSong = {
          url: `/api/audio/${data.filename}`,
          title: data.filename.replace(".mp3", "").replace(/-|_/g, " "),
          date: new Date().toLocaleDateString(),
        };

        const isDuplicate = songs.some((song) => song.url === newSong.url);

        if (isDuplicate) {
          toast.error("You cannot add song with same URL!");
          return;
        }

        // Update songs in state and localStorage
        const updatedSongs = [newSong, ...songs];
        setSongs(updatedSongs);

        toast.success("Successfully added song");
        setDownloadedAudio({
          url: newSong.url,
          title: newSong.title,
        });
      }

      setValue("");
    } catch (error) {
      toast.error("Error with downloading Audio");
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Download failed"}`
      );
    }
  }

  // Add function to remove a song
  const removeSong = (songUrl: string) => {
    const updatedSongs = songs.filter((song) => song.url !== songUrl);
    setSongs(updatedSongs);
    toast.success("Song removed successfully");

    // If the removed song was playing, clear the audio player
    if (downloadedAudio?.url === songUrl) {
      setDownloadedAudio(null);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <Toaster position="top-center" />

      {/* Header Section */}
      <header className="fixed top-0 left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {image ? (
                <Image
                  src={image}
                  alt={`${username}'s profile`}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-lg">
                    {username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-semibold text-green-500">
                {username}
              </h1>
            </div>

            <form onSubmit={sendURL} className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Input YouTube URL"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-80 bg-zinc-800 text-white rounded-md px-4 py-2 border border-zinc-700 focus:border-green-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-black font-medium rounded-md hover:bg-green-400 transition-colors"
              >
                Download
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        {/* Status Message */}
        {status && (
          <div
            className={`mb-6 p-4 rounded-md ${
              status.startsWith("Error")
                ? "bg-red-900/20 text-red-500 border border-red-900"
                : "bg-green-900/20 text-green-500 border border-green-900"
            }`}
          >
            {status}
          </div>
        )}

        {/* Songs Section */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-green-500 mb-6">
            Your Songs ({songs.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {songs.map((song, index) => (
              <div
                key={index}
                className="bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800"
              >
                <div
                  className="w-full aspect-square bg-zinc-800 rounded-md mb-4 flex items-center justify-center cursor-pointer"
                  onClick={() => setDownloadedAudio(song)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-green-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                    />
                  </svg>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold text-sm truncate">
                      {song.title}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      Added {song.date}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSong(song.url)}
                    className="text-red-500 hover:text-red-400 p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {downloadedAudio && (
        <div className="fixed bottom-0 left-0 right-0">
          <AudioPlayer
            audioUrl={downloadedAudio.url}
            title={downloadedAudio.title}
          />
        </div>
      )}
    </main>
  );
}
