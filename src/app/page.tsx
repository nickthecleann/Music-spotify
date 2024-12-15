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

export default function Home() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const [downloadedAudio, setDownloadedAudio] = useState<DownloadedAudio | null>(null);
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

      setStatus(data.message);
      // Set the downloaded audio information
      setDownloadedAudio({
        url: `/api/audio/${data.filename}`, // Assuming you've set up this API route
        title: data.filename.replace('.mp3', '')
      });
      setValue("");
    } catch (error) {
      toast.error("Error with downloading Audio");
      setStatus(`Error: ${error instanceof Error ? error.message : 'Download failed'}`);
    }
  }

  return (
    <div className="p-4 space-y-6">
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
          <h1 className="text-xl font-semibold">{username}</h1>
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download
          </button>
        </form>

        <form action={handleSignOut}>
          <button 
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </form>
      </div>

      {status && (
        <div className={`mt-4 p-4 rounded-md ${
          status.startsWith('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </div>
      )}

      {downloadedAudio && (
        <div className="mt-6">
          <AudioPlayer 
            audioUrl={downloadedAudio.url}
            title={downloadedAudio.title}
          />
        </div>
      )}
    </div>
  );
}