
import React, { useState, useRef, ChangeEvent } from 'react';
import { getAudioContext } from '../utils/audioContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Mic, Upload, Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const AudioControls: React.FC = () => {
  const [volume, setVolume] = useState(0.75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputType, setInputType] = useState<'file' | 'mic' | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioManager = getAudioContext();
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
  };
  
  const handlePlayPause = () => {
    if (inputType === 'file' && audioRef.current) {
      audioManager.togglePlay();
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const audioUrl = URL.createObjectURL(file);
    setAudioFile(audioUrl);
    setInputType('file');
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.onloadeddata = () => {
        audioManager.connectAudio(audioRef.current!);
        setIsPlaying(true);
        audioManager.playAudio();
        toast.success("Audio loaded successfully!");
      };
    }
  };
  
  const handleMicInput = async () => {
    try {
      const success = await audioManager.connectMicrophone();
      if (success) {
        setInputType('mic');
        toast.success("Microphone connected!");
      } else {
        toast.error("Failed to connect microphone");
      }
    } catch (error) {
      toast.error("Error accessing microphone");
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Volume icon based on current volume
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="glass-morphism fixed bottom-0 left-0 right-0 p-4 z-10">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={triggerFileUpload}
            className="bg-white/10 hover:bg-white/20 border-white/20"
          >
            <Upload size={20} />
            <span className="sr-only">Upload audio</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleMicInput}
            className={`${inputType === 'mic' ? 'bg-purple-500/30' : 'bg-white/10'} hover:bg-white/20 border-white/20`}
          >
            <Mic size={20} />
            <span className="sr-only">Use microphone</span>
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
        </div>
        
        {inputType === 'file' && (
          <div className="flex-1 max-w-sm mx-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              disabled={!audioFile}
              className="bg-white/10 hover:bg-white/20 border-white/20"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <VolumeIcon />
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24 md:w-32"
          />
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default AudioControls;
