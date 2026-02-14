
import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff } from 'lucide-react';

interface MiniPlayerProps {
    stream: MediaStream | null;
    channelName?: string;
    isMicMuted: boolean;
    isDeafened: boolean;
    onExpand: () => void;
    onDisconnect: () => void;
    onToggleMic: () => void;
    onToggleDeafen: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ 
    stream, channelName, isMicMuted, isDeafened, onExpand, onDisconnect, onToggleMic, onToggleDeafen
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const hasVideo = stream && stream.getVideoTracks().length > 0;

    return (
        <div className="fixed bottom-4 right-4 w-72 bg-[#1e1f22] border border-white/10 rounded-2xl shadow-2xl z-[1000] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            {/* Video Area */}
            <div className="relative h-40 bg-black group cursor-pointer" onClick={onExpand}>
                {hasVideo ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-cordis-tertiary flex items-center justify-center mb-2">
                             <img src="https://picsum.photos/200" className="w-full h-full rounded-full opacity-50 object-cover" />
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-cordis-bg/60 px-3 py-1 rounded-full">Powiększ</span>
                </div>
                <div className="absolute top-2 left-2 bg-cordis-bg/80 px-2 py-0.5 rounded text-[10px] text-cordis-success font-bold flex items-center gap-1 border border-white/5">
                     <div className="w-1.5 h-1.5 bg-cordis-success rounded-full animate-pulse"/>
                     {channelName || "Kanał Głosowy"}
                </div>
            </div>

            {/* Mini Controls */}
            <div className="h-12 flex items-center justify-between px-3">
                <div className="flex gap-1">
                     <button onClick={(e) => { e.stopPropagation(); onToggleMic(); }} className={`p-2 rounded hover:bg-white/5 transition-colors ${isMicMuted ? 'text-cordis-danger' : 'text-white'}`}>{isMicMuted ? <MicOff size={18}/> : <Mic size={18}/>}</button>
                     <button onClick={(e) => { e.stopPropagation(); onToggleDeafen(); }} className={`p-2 rounded hover:bg-white/5 transition-colors ${isDeafened ? 'text-cordis-danger' : 'text-white'}`}>{isDeafened ? <HeadphoneOff size={18}/> : <Headphones size={18}/>}</button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDisconnect(); }} className="p-2 rounded bg-cordis-danger text-white hover:bg-red-600 transition-colors"><PhoneOff size={18}/></button>
            </div>
        </div>
    );
};
