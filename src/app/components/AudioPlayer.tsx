'use client'
import React, { useState, useRef } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(event.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
      
      <div className="text-lg font-semibold text-gray-800 mb-4">{title}</div>
      
      <div className="space-y-4">
        <button
          onClick={togglePlay}
          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <div className="space-y-2">
          <input
            type="range"
            value={currentTime}
            min={0}
            max={duration || 100}
            step={1}
            onChange={handleTimeSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;