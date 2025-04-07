
export class AudioContextManager {
  private static instance: AudioContextManager;
  public audioContext: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  public gainNode: GainNode | null = null;
  public source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  public isPlaying: boolean = false;
  public audioElement: HTMLAudioElement | null = null;
  
  private constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.gainNode = this.audioContext.createGain();
        
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
    }
  }
  
  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }
  
  public connectAudio(element: HTMLAudioElement): void {
    if (!this.audioContext) return;
    
    // Disconnect any previous source
    if (this.source) {
      this.source.disconnect();
    }
    
    this.audioElement = element;
    this.source = this.audioContext.createMediaElementSource(element);
    this.source.connect(this.gainNode!);
  }
  
  public async connectMicrophone(): Promise<boolean> {
    if (!this.audioContext) return false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Disconnect any previous source
      if (this.source) {
        this.source.disconnect();
      }
      
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.gainNode!);
      
      return true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      return false;
    }
  }
  
  public setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }
  
  public resumeContext(): void {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }
  
  public playAudio(): void {
    if (this.audioElement && this.audioContext) {
      this.resumeContext();
      this.audioElement.play();
      this.isPlaying = true;
    }
  }
  
  public pauseAudio(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }
  
  public togglePlay(): void {
    if (this.isPlaying) {
      this.pauseAudio();
    } else {
      this.playAudio();
    }
  }
  
  public getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
  
  public getTimeData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
}

export const getAudioContext = (): AudioContextManager => {
  return AudioContextManager.getInstance();
};
