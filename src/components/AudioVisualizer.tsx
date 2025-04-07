
import React, { useEffect, useRef, useState } from 'react';
import FrequencyVisualizer from './FrequencyVisualizer';
import AudioControls from './AudioControls';
import { getAudioContext } from '../utils/audioContext';
import { toast } from 'sonner';

const AudioVisualizer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContext = getAudioContext();
  
  // Initialize audio context on first user interaction
  const initializeAudio = () => {
    if (initialized) return;
    
    audioContext.resumeContext();
    setInitialized(true);
    
    // Show welcome toast with instructions
    toast("Welcome to Audio Dreamscape Waves", {
      description: "Upload music or use your microphone to start visualizing!",
      duration: 5000,
    });
  };
  
  useEffect(() => {
    // Add event listeners to initialize audio context on first interaction
    const container = containerRef.current;
    if (!container) return;
    
    const handleInteraction = () => {
      initializeAudio();
    };
    
    container.addEventListener('click', handleInteraction);
    container.addEventListener('touchstart', handleInteraction);
    
    // Initial animation strength based on window size
    
    return () => {
      container.removeEventListener('click', handleInteraction);
      container.removeEventListener('touchstart', handleInteraction);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="visualizer-container animated-gradient"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl animate-wave"></div>
      </div>
      
      {/* Frequency Visualizer */}
      <FrequencyVisualizer 
        fillColor="rgba(255, 255, 255, 0.1)"
        lineColor="rgba(255, 255, 255, 0.6)"
      />
      
      {/* Title Section */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
          Audio Dreamscape
        </h1>
        <p className="text-xl md:text-2xl mt-2 text-white/80">
          Visualize your sound waves
        </p>
      </div>
      
      {/* Controls */}
      <AudioControls />
      
      {/* Instructions Circle */}
      {!initialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-full w-48 h-48 flex items-center justify-center text-center cursor-pointer animate-pulse" onClick={initializeAudio}>
            <p className="text-white font-medium">
              Click anywhere to start
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer;
