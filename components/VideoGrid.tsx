
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, User, Monitor, MonitorOff, PhoneOff, Video, VideoOff, Headphones, HeadphoneOff, Volume2, Volume1, VolumeX, Settings, ChevronDown, Maximize2, Minimize2, X } from 'lucide-react';

interface VideoGridProps {
    localStream: MediaStream | null;
    screenStream: MediaStream | null;
    isMicMuted: boolean;
    isDeafened: boolean;
    isCameraOn: boolean;
    onToggleMic: () => void;
    onToggleDeafen: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
    onDisconnect: () => void;
    onOpenSettings: () => void;
    onMinimize?: () => void;
}

// Hook to detect audio levels from a MediaStream
export const useAudioLevel = (stream: MediaStream | null, isMuted: boolean, isDeafened: boolean = false) => {
    const [level, setLevel] = useState(0);
    // Providing initial value to useRef to satisfy strict TypeScript checks
    const requestRef = useRef<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        if (!stream || isMuted || isDeafened) {
            setLevel(0);
            return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            setLevel(average);
            requestRef.current = requestAnimationFrame(update);
        };

        update();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            audioContext.close();
        };
    }, [stream, isMuted, isDeafened]);

    return level;
};

export const VideoGrid: React.FC<VideoGridProps> = ({ 
    localStream, 
    screenStream, 
    isMicMuted, 
    isDeafened,
    isCameraOn,
    onToggleMic,
    onToggleDeafen,
    onToggleCamera,
    onToggleScreenShare,
    onDisconnect,
    onOpenSettings,
    onMinimize
}) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const [masterVolume, setMasterVolume] = useState(100);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const localLevel = useAudioLevel(localStream, isMicMuted, isDeafened);
    
    // Simulate remote user talking
    const [remoteTalking, setRemoteTalking] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setRemoteTalking(Math.random() > 0.7);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isCameraOn]);

    useEffect(() => {
        if (screenVideoRef.current && screenStream) {
            screenVideoRef.current.srcObject = screenStream;
        }
    }, [screenStream]);

    const toggleFullScreen = () => {
        if (!screenVideoRef.current) return;
        if (!document.fullscreenElement) {
            screenVideoRef.current.parentElement?.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    useEffect(() => {
        const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const hasScreenShare = !!screenStream;
    const isSpeaking = localLevel > 15;
    const isActuallyMuted = isDeafened || masterVolume === 0;

    return (
        <div className="absolute inset-0 bg-[#0a0a0c] z-40 flex flex-col p-4 overflow-hidden animate-in fade-in duration-500">
            {/* Minimalization Button Top-Right */}
            <button 
                onClick={onMinimize}
                className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all z-50 shadow-xl backdrop-blur-md"
                title="Zminimalizuj"
            >
                <ChevronDown size={18} />
            </button>

            {/* Content Area */}
            <div className={`flex-1 flex flex-col gap-3 w-full max-w-[1400px] mx-auto items-center overflow-hidden transition-all duration-500`}>
                
                {/* Screen Share Section */}
                {hasScreenShare && (
                     <div className="relative flex-[4] w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-indigo-500/40 group ring-1 ring-white/5">
                        <video ref={screenVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                        
                        {/* Overlay Information */}
                        <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                            <div className="bg-emerald-500/90 backdrop-blur px-4 py-2 rounded-xl text-white text-[10px] font-black flex items-center shadow-lg uppercase tracking-[0.2em] ring-1 ring-white/20">
                                <Monitor size={14} className="mr-2" /> Udostępniasz ekran
                            </div>
                            <button 
                                onClick={onToggleScreenShare}
                                className="bg-rose-600/90 hover:bg-rose-500 backdrop-blur p-2 rounded-xl text-white shadow-lg ring-1 ring-white/20 transition-all"
                                title="Zatrzymaj udostępnianie"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Fullscreen Button */}
                        <button 
                            onClick={toggleFullScreen}
                            className="absolute bottom-6 right-6 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10"
                        >
                            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                    </div>
                )}

                {/* Participant Row */}
                <div className={`flex items-center justify-center gap-3 w-full px-2 ${hasScreenShare ? 'h-32 md:h-36 shrink-0' : 'flex-1'}`}>
                    
                    {/* Local User Card */}
                    <div className={`relative bg-[#1e1e22] rounded-[2rem] overflow-hidden shadow-xl border-2 transition-all duration-300 flex items-center justify-center ${
                        hasScreenShare ? 'h-full aspect-video' : 'h-full max-h-[500px] flex-1 max-w-[450px]'
                    } ${
                        isSpeaking 
                        ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                        : 'border-white/5'
                    }`}>
                        {isCameraOn && localStream ? (
                             <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform scale-x-[-1]`} />
                        ) : (
                             <div className="flex flex-col items-center justify-center">
                                 <div className={`rounded-full bg-white/5 flex items-center justify-center relative transition-all duration-300 border-2 ${
                                     hasScreenShare ? 'w-12 h-12' : 'w-28 h-28'
                                 } ${
                                     isSpeaking 
                                     ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-105' 
                                     : 'border-white/10'
                                 }`}>
                                     <img src="https://picsum.photos/200" alt="Avatar" className="w-full h-full rounded-full opacity-80 object-cover" />
                                 </div>
                             </div>
                        )}
                        <div className="absolute bottom-2.5 left-2.5 bg-black/60 px-2.5 py-1 rounded-lg text-white text-[8px] font-black uppercase tracking-wider flex items-center backdrop-blur-md border border-white/5">
                            TY {(isMicMuted || isDeafened) && <MicOff size={10} className="ml-1.5 text-rose-500" />}
                        </div>
                    </div>

                    {/* Remote User Card (AI) */}
                    <div className={`relative bg-[#1e1e22] rounded-[2rem] overflow-hidden shadow-xl border-2 transition-all duration-300 flex items-center justify-center ${
                         hasScreenShare ? 'h-full aspect-video' : 'h-full max-h-[500px] flex-1 max-w-[450px]'
                    } ${
                         remoteTalking && !isActuallyMuted 
                         ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                         : 'border-white/5'
                    }`}>
                        <div className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg border-2 transition-all duration-300 ${
                            hasScreenShare ? 'w-12 h-12 text-sm' : 'w-28 h-28 text-3xl'
                        } ${
                            remoteTalking && !isActuallyMuted 
                            ? 'border-emerald-400 scale-105' 
                            : 'border-white/10'
                        }`}>AI</div>
                        
                        <div className="absolute bottom-2.5 left-2.5 bg-black/60 px-2.5 py-1 rounded-lg text-white text-[8px] font-black uppercase tracking-wider flex items-center backdrop-blur-md border border-white/5">
                            GEMINI AI
                        </div>
                    </div>
                </div>
            </div>

            {/* Smaller & Cleaner Controls Bar */}
            <div className="h-20 flex items-center justify-center shrink-0 mt-3 z-50">
                <div className="bg-[#1a1b1e]/90 backdrop-blur-3xl px-6 py-2.5 rounded-[2rem] flex items-center gap-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                    
                    {/* Compact Volume Control */}
                    <div className="flex items-center gap-2.5 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
                         <button onClick={() => setMasterVolume(v => v === 0 ? 100 : 0)} className={`transition-colors ${masterVolume === 0 || isDeafened ? 'text-rose-500' : 'text-slate-400 hover:text-white'}`}>
                             {masterVolume === 0 || isDeafened ? <VolumeX size={16} /> : masterVolume < 50 ? <Volume1 size={16} /> : <Volume2 size={16} />}
                         </button>
                         <input type="range" min="0" max="100" value={isDeafened ? 0 : masterVolume} disabled={isDeafened} onChange={(e) => setMasterVolume(parseInt(e.target.value))} className="w-16 md:w-24 accent-indigo-500 h-1 bg-white/10 rounded-full cursor-pointer" />
                    </div>
                    
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onToggleMic} 
                            className={`p-3 rounded-xl transition-all active:scale-95 ${isMicMuted ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                        
                        <button 
                            onClick={onToggleDeafen} 
                            className={`p-3 rounded-xl transition-all active:scale-95 ${isDeafened ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {isDeafened ? <HeadphoneOff size={20} /> : <Headphones size={20} />}
                        </button>
                        
                        <button 
                            onClick={onToggleCamera} 
                            className={`p-3 rounded-xl transition-all active:scale-95 ${isCameraOn ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                        </button>
                        
                        <button 
                            onClick={onToggleScreenShare} 
                            className={`p-3 rounded-xl transition-all active:scale-95 ${hasScreenShare ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {hasScreenShare ? <MonitorOff size={20} /> : <Monitor size={20} />}
                        </button>
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1" />
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onOpenSettings} 
                            className="p-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                        >
                            <Settings size={20} />
                        </button>
                        
                        <button 
                            onClick={onDisconnect} 
                            className="p-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg"
                        >
                            <PhoneOff size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
