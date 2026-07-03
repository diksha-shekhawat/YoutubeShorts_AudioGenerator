import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  RotateCcw, 
  Download, 
  Sparkles, 
  FileText, 
  Wand2, 
  Clock, 
  Check, 
  Trash2, 
  HelpCircle,
  TrendingUp,
  VolumeX,
  Share2,
  Copy,
  Sliders,
  Maximize2,
  ExternalLink
} from "lucide-react";
import { VOICE_OPTIONS, SCRIPT_PRESETS } from "./presets";
import { GeneratedAudio, GenerationConfig } from "./types";

export default function App() {
  // Preset selection: Default to the DSA script
  const [selectedPresetId, setSelectedPresetId] = useState<string>("dsa-bounds");
  const [scriptText, setScriptText] = useState<string>("");
  
  // Generation Settings
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");
  const [voiceStyle, setVoiceStyle] = useState<string>(
    "Young, confident, and energetic. Sound like you're explaining something exciting to a friend, not reading from a textbook. Sound enthusiastic and engaging from the very first sentence. Do not sound robotic or overly dramatic."
  );
  const [pace, setPace] = useState<string>("Fast but clear pace suitable for a 60-second YouTube Short");
  const [emphasis, setEmphasis] = useState<string>("Lower Bound, Upper Bound, Floor, Ceil, greater than, greater than or equal to");
  const [pauses, setPauses] = useState<string>("Add natural brief pauses after important points");

  // App UI & Loading states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudio | null>(null);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Custom Audio Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Audio elements ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize with the default DSA script preset
  useEffect(() => {
    const dsaPreset = SCRIPT_PRESETS.find(p => p.id === "dsa-bounds");
    if (dsaPreset) {
      setScriptText(dsaPreset.text);
    }
    
    // Load history from localStorage
    try {
      const stored = localStorage.getItem("yt_shorts_audio_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  // Update script text when preset changes
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = SCRIPT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setScriptText(preset.text);
    }
  };

  // Word count and Reading Time estimation
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  // Dynamic average words per minute (YouTube Shorts are fast-paced, ~150-165 WPM)
  const estimatedSeconds = Math.round((wordCount / 160) * 60);

  // Handle TTS Generation call
  const generateSpeech = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    
    // Auto-pause existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: scriptText,
          voice: selectedVoice,
          voiceStyle,
          pace,
          emphasis,
          pauses
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate narration audio.");
      }

      const data = await response.json();
      
      const newAudio: GeneratedAudio = {
        id: Math.random().toString(36).substring(2, 9),
        title: SCRIPT_PRESETS.find(p => p.text === scriptText)?.title || `Custom Script (${wordCount} words)`,
        text: scriptText,
        audioUrl: data.audioUrl,
        voice: data.voice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        config: {
          voice: selectedVoice,
          voiceStyle,
          pace,
          emphasis,
          pauses
        }
      };

      setCurrentAudio(newAudio);
      
      // Prepend to history & save to localStorage
      const updatedHistory = [newAudio, ...history].slice(0, 10); // Keep last 10
      setHistory(updatedHistory);
      localStorage.setItem("yt_shorts_audio_history", JSON.stringify(updatedHistory));

      // Auto load the audio element
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.log("Auto-play blocked or failed:", err));
        }
      }, 100);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong during narration generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio playback controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Play failed:", err));
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(err => console.error("Restart failed:", err));
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

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const loadFromHistory = (item: GeneratedAudio) => {
    setCurrentAudio(item);
    setScriptText(item.text);
    setSelectedVoice(item.config.voice);
    setVoiceStyle(item.config.voiceStyle);
    setPace(item.config.pace);
    setEmphasis(item.config.emphasis);
    setPauses(item.config.pauses);
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log("Auto-play loaded item failed:", err));
      }
    }, 100);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("yt_shorts_audio_history", JSON.stringify(updated));
    if (currentAudio?.id === id) {
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyToClipboardHistory = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Generate simulated bar heights for the visualizer effect
  const visualizerBars = [
    12, 24, 18, 36, 48, 30, 20, 28, 42, 54, 40, 24, 16, 32, 44, 50, 38, 22, 14, 28, 
    34, 46, 28, 18, 24, 38, 48, 36, 24, 16, 30, 42, 52, 38, 22, 12, 18, 32, 46, 30
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500/30 selection:text-pink-200">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Primary Header banner */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 rounded-xl shadow-lg shadow-pink-500/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  YouTube Shorts Narrator
                </h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
                  Creator Tool
                </span>
              </div>
              <p className="text-xs text-slate-400">Generate high-energy, confident voiceovers tailored for rapid 60s shorts.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini TTS Engine Active
            </span>
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              className="hover:text-pink-400 transition flex items-center gap-1"
            >
              AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Script Composer & Presets (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Quick Script presets */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-pink-500" />
                Select script preset to begin
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">3 presets available</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SCRIPT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`p-3 text-left rounded-xl transition border text-xs flex flex-col justify-between h-20 ${
                    selectedPresetId === preset.id
                      ? "bg-slate-850 border-pink-500/50 text-white ring-1 ring-pink-500/20"
                      : "bg-slate-950/45 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-semibold block truncate w-full">{preset.title}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 self-start">
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Script Editor panel */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex-1 flex flex-col gap-4 backdrop-blur-sm shadow-xl shadow-slate-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-pink-500 animate-spin" style={{ animationDuration: "3s" }} />
                <h3 className="text-sm font-bold text-slate-200">Shorts Script Composer</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyScriptToClipboard}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 flex items-center gap-1.5 transition active:scale-95"
                  title="Copy full script"
                >
                  {copiedScript ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Script Editor Input */}
            <div className="relative flex-1 min-h-[320px] flex flex-col">
              <textarea
                value={scriptText}
                onChange={(e) => {
                  setScriptText(e.target.value);
                  setSelectedPresetId(""); // Clear preset highlight if they manually edit
                }}
                placeholder="Paste or write your YouTube Shorts script here..."
                className="w-full flex-1 bg-slate-950/85 border border-slate-800 rounded-xl p-4 font-mono text-sm leading-relaxed text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500/45 focus:border-pink-500/50 resize-none"
              />
              
              {/* Floating stats banner inside the editor */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur">
                  <Clock className="h-3 w-3 text-pink-500" />
                  <span className={estimatedSeconds > 59 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    ~{estimatedSeconds}s
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">{wordCount} words</span>
                </div>
              </div>
            </div>

            {/* Word Limits Advice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                estimatedSeconds > 60 
                  ? "bg-rose-500/5 border-rose-500/20 text-rose-300" 
                  : "bg-slate-950/60 border-slate-800"
              }`}>
                <span className="text-base">⏱️</span>
                <div>
                  <span className="font-semibold block mb-0.5">Shorts 60-Second Bound</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {estimatedSeconds > 60 
                      ? `Your script is currently ~${estimatedSeconds}s! It may exceed the 60-second limit. We recommend shortening it below 160 words.` 
                      : "Awesome! Your script easily fits inside the standard 60-second YouTube Shorts limits."}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <span className="text-base">📢</span>
                <div>
                  <span className="font-semibold block mb-0.5">Narrator Tip</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Use capitals or single quotes on key concepts like 'Floor' or 'Ceil' to signal natural emphasis to the model.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Voice Picker, Tuning & Audio Player (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Audio Player and Visualization - dynamically highlights when audio is loaded */}
          <div className={`border rounded-2xl p-5 shadow-2xl transition duration-300 ${
            currentAudio 
              ? "bg-slate-900/95 border-pink-500/30 ring-1 ring-pink-500/10 shadow-pink-500/5" 
              : "bg-slate-900/60 border-slate-800/80 opacity-90"
          }`}>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {isPlaying && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? "bg-pink-500" : "bg-slate-600"}`}></span>
                </span>
                Active Narration Track
              </span>
              {currentAudio && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                  Voice: {currentAudio.voice}
                </span>
              )}
            </h3>

            {/* Audio waveform container */}
            <div className="bg-slate-950 rounded-xl p-4 mb-4 border border-slate-850 flex flex-col items-center justify-center min-h-[100px] relative overflow-hidden">
              {currentAudio ? (
                <div className="w-full flex flex-col items-center">
                  {/* Virtual visualizer bar container */}
                  <div className="flex items-end justify-center gap-[3px] h-14 w-full px-2">
                    {visualizerBars.map((barHeight, idx) => {
                      // Determine height scaling based on state
                      let activeScale = 0.15;
                      if (isPlaying) {
                        // Make bars react to time or just dynamic jitter
                        const phase = (currentTime * 4 + idx) % 10;
                        activeScale = 0.4 + (phase / 10) * 0.6;
                      } else if (currentTime > 0) {
                        activeScale = 0.25;
                      }
                      
                      const heightPx = Math.max(4, barHeight * activeScale);
                      const isPlayed = (idx / visualizerBars.length) < (currentTime / (duration || 1));

                      return (
                        <span
                          key={idx}
                          style={{ height: `${heightPx}px` }}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            isPlayed
                              ? "bg-gradient-to-t from-pink-500 to-rose-400"
                              : "bg-slate-800"
                          }`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Title & Stats */}
                  <div className="text-center mt-3 w-full">
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[260px] mx-auto">
                      {currentAudio.title}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Completed at {currentAudio.timestamp}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 px-6">
                  <Volume2 className="h-8 w-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-400">No Narration Generated Yet</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Set up your script, select an energetic voice style, and hit generate to spawn your short audio track.
                  </p>
                </div>
              )}
            </div>

            {/* Hidden native HTML5 Audio element */}
            {currentAudio && (
              <audio
                ref={audioRef}
                src={currentAudio.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />
            )}

            {/* Progress Bar & Seek */}
            {currentAudio && (
              <div className="space-y-1 mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Player Controls Panel */}
            {currentAudio && (
              <div className="flex items-center justify-between gap-2 border-t border-slate-850 pt-4">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={restartAudio}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
                    title="Restart Track"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg shadow-pink-500/20 transition active:scale-90"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                  </button>

                  {/* Playback speed buttons */}
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 ml-1">
                    {[1, 1.25, 1.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`px-1.5 py-1 rounded text-[9px] font-mono font-bold transition ${
                          playbackRate === rate
                            ? "bg-pink-500 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mute and volume */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-slate-400 hover:text-white transition">
                    {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  
                  {/* Download button */}
                  <a
                    href={currentAudio.audioUrl}
                    download={`yt_shorts_narration_${currentAudio.id}.wav`}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center active:scale-95 ml-1"
                    title="Download WAV File"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Configuration Panel: Voice Style Tuning */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-4">
            
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-pink-500" />
                Select Voice Model
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Pick an expressive voice profile from the prebuilt dataset.</p>
            </div>

            {/* Voice Cards list */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-2 gap-2">
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-95 ${
                    selectedVoice === voice.id
                      ? "bg-slate-850 border-pink-500/50 ring-1 ring-pink-500/20 text-white"
                      : "bg-slate-950/50 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-300"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${voice.avatarColor} flex-shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold truncate">{voice.name}</span>
                      <span className="text-[9px] text-slate-500 uppercase">{voice.gender[0]}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-850 my-1" />

            {/* Tuning sliders or options details */}
            <div className="space-y-3.5 text-xs">
              
              <div>
                <label className="text-slate-300 font-bold block mb-1">Voice Style & Tone Instruction</label>
                <textarea
                  value={voiceStyle}
                  onChange={(e) => setVoiceStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-pink-500/35 h-16 resize-none"
                  placeholder="Set conversational energy or character profile..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pace Style</label>
                  <input
                    type="text"
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-pink-500/35"
                    placeholder="Short duration pace guidelines"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pauses Setup</label>
                  <input
                    type="text"
                    value={pauses}
                    onChange={(e) => setPauses(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-pink-500/35"
                    placeholder="Pause style rules"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Emphasize Target Words</label>
                <input
                  type="text"
                  value={emphasis}
                  onChange={(e) => setEmphasis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-pink-500/35"
                  placeholder="Key words separated by commas"
                />
              </div>

            </div>

            {/* Error prompt container */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-normal">
                ⚠️ <span className="font-semibold">Error:</span> {errorMessage}
              </div>
            )}

            {/* Big Energetic Generate CTA */}
            <button
              onClick={generateSpeech}
              disabled={isGenerating || !scriptText.trim()}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-lg ${
                !scriptText.trim()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : isGenerating
                  ? "bg-slate-800 text-slate-300 cursor-wait"
                  : "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white shadow-pink-500/10 active:scale-[0.98]"
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                  Generating Short Speech...
                </>
              ) : (
                <>
                  <Wand2 className="h-4.5 w-4.5" />
                  Generate High-Energy Audio
                </>
              )}
            </button>

          </div>

        </div>

      </main>

      {/* Footer Area with Generation History panel & Quick Notes */}
      <footer className="border-t border-slate-900 bg-slate-950/60 p-4 mt-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Recent generations list */}
          <div className="md:col-span-8 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-pink-500" />
              Creator Session Library ({history.length} generated files)
            </h4>
            
            {history.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className={`p-3 bg-slate-900 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition group hover:border-slate-700 ${
                      currentAudio?.id === item.id ? "border-pink-500/40 bg-slate-850" : "border-slate-850"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 truncate group-hover:text-pink-400 transition">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-mono">
                        <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-850 font-sans">
                          {item.voice}
                        </span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboardHistory(item.text, idx);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-950 text-slate-500 hover:text-slate-300 transition"
                        title="Copy script"
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-950 text-slate-500 hover:text-rose-400 transition"
                        title="Delete track"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/20 text-center text-xs text-slate-500">
                Any tracks you generate during this session will show up here for fast recall.
              </div>
            )}
          </div>

          {/* Quick FAQ / Info block */}
          <div className="md:col-span-4 space-y-2 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-6 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-extrabold text-slate-300 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <HelpCircle className="h-3 w-3 text-indigo-400" /> FAQ & PRO TIPS
            </span>
            <p>
              <strong>Why use Gemini 3.1 TTS?</strong> Standard speech utilities sound flat. Gemini TTS reads with high natural cadence, adjusting energy, emphasis, and context according to structural instructions.
            </p>
            <p>
              <strong>WAV downloads:</strong> All output tracks are wrapped as standard 24kHz mono WAV files, fully compatible with Adobe Premiere, CapCut, or DaVinci Resolve.
            </p>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto text-center text-[10px] text-slate-600 border-t border-slate-900/60 mt-4 pt-4">
          YouTube Shorts Narrator Tool • Created with the Google Gemini Developer Ecosystem.
        </div>
      </footer>

    </div>
  );
}
