
import React, { useRef, useEffect } from 'react';
import { getAudioContext } from '../utils/audioContext';

interface FrequencyVisualizerProps {
  fillColor?: string;
  backgroundColor?: string;
  lineColor?: string;
  style?: React.CSSProperties;
}

const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({
  fillColor = 'rgba(226, 232, 240, 0.2)',
  backgroundColor = 'transparent',
  lineColor = 'rgba(226, 232, 240, 0.8)',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioManager = getAudioContext();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      
      // Scale the canvas to account for device pixel ratio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    // Initial resize
    resize();
    window.addEventListener('resize', resize);
    
    const drawVisualizer = () => {
      if (!ctx || !canvas) return;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      // Background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      // Get frequency data
      const frequencyData = audioManager.getFrequencyData();
      if (!frequencyData) return;
      
      const barCount = Math.min(frequencyData.length, 128);
      const barWidth = (canvas.width / window.devicePixelRatio) / barCount;
      
      // Draw frequency bars
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / window.devicePixelRatio);
      
      for (let i = 0; i < barCount; i++) {
        const percent = frequencyData[i] / 255;
        const barHeight = (canvas.height / window.devicePixelRatio) * percent * 0.8;
        const x = i * barWidth;
        const y = (canvas.height / window.devicePixelRatio) - barHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use a curved line for smoother appearance
          const prevX = (i - 1) * barWidth;
          const prevY = (canvas.height / window.devicePixelRatio) - (frequencyData[i - 1] / 255) * (canvas.height / window.devicePixelRatio) * 0.8;
          
          const cpX1 = prevX + barWidth / 2;
          const cpX2 = x - barWidth / 2;
          
          ctx.bezierCurveTo(cpX1, prevY, cpX2, y, x, y);
        }
      }
      
      ctx.lineTo(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw circle visualizers based on frequency
      const circleData = [
        { index: 1, size: 0.4, color: 'rgba(147, 51, 234, 0.5)' },   // Low frequency
        { index: 20, size: 0.3, color: 'rgba(236, 72, 153, 0.5)' },  // Mid-low frequency
        { index: 50, size: 0.2, color: 'rgba(14, 165, 233, 0.5)' },  // Mid frequency
        { index: 100, size: 0.15, color: 'rgba(34, 211, 238, 0.5)' } // High frequency
      ];
      
      const centerX = (canvas.width / window.devicePixelRatio) / 2;
      const centerY = (canvas.height / window.devicePixelRatio) / 2;
      
      circleData.forEach(({ index, size, color }) => {
        const frequencyValue = frequencyData[index] || 0;
        const percent = frequencyValue / 255;
        const radius = Math.max(30, (canvas.width / window.devicePixelRatio) * size * (0.5 + percent * 0.5));
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(drawVisualizer);
    };
    
    // Start the animation
    drawVisualizer();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [backgroundColor, fillColor, lineColor]);
  
  return (
    <canvas ref={canvasRef} className="visualizer-canvas" style={style} />
  );
};

export default FrequencyVisualizer;
