'use client'
import Image from "next/image";
import { useState } from "react";
import { handleSignOut } from '@/app/actions/actions';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import AudioPlayer from './components/AudioPlayer';

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
  const [downloadedAudio, setDownloadedAudio] = useState<DownloadedAudio | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  if (sessionStatus === "unauthenticated") {
    router.replace('/login');
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: value })
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error('Error with downloading Audio');
        setStatus(`Error: ${data.error || 'Download failed'}`);
        return;
      }
      
      if (data.filename) {
        const newSong = {
          url: `/api/audio/${data.filename}`,
          title: data.filename.replace('.mp3', '').replace(/-|_/g, ' '),
          date: new Date().toLocaleDateString()
        };
        
        // Check for duplicates before updating state
        const isDuplicate = songs.some(song => song.url === newSong.url);
        
        if (isDuplicate) {
          toast.error("You cannot add song with same URL!");
          return;
        }

        // Add new song if it's not a duplicate
        toast.success("Successfully added song");
        setSongs(prev => [newSong, ...prev]);
        
        // Set as currently playing
        setDownloadedAudio({
          url: newSong.url,
          title: newSong.title
        });
      }
      
      setValue("");
    } catch (error) {
      toast.error("Error with downloading Audio");
      setStatus(`Error: ${error instanceof Error ? error.message : 'Download failed'}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {image ? (
              <Image
                src={image}
                alt={`${username}'s profile`}
                width={50}
                height={50}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-lg">
                  {username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <h1 className="text-xl font-semibold text-white">{username}</h1>
          </div>
          
          <form onSubmit={sendURL} className="flex gap-4">
            <input 
              className="text-black rounded-md px-4 py-2" 
              type="text" 
              placeholder="Input YouTube URL"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#1DB954] rounded-md hover:bg-[#1ed760] transition-colors"
            >
              Download
            </button>
          </form>

          <form action={handleSignOut}>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`m-4 p-4 rounded-md ${
          status.startsWith('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </div>
      )}

      {/* Songs Grid */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Songs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {songs.map((song, index) => (
            <div 
              key={index}
              className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer"
              onClick={() => setDownloadedAudio(song)}
            >
              <div className="w-full aspect-square bg-[#282828] rounded-md mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-sm truncate">{song.title}</h3>
              <p className="text-gray-400 text-xs mt-1">Added {song.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Player */}
      {downloadedAudio && (
        <AudioPlayer 
          audioUrl={downloadedAudio.url}
          title={downloadedAudio.title}
        />
      )}
    </div>
  );
};