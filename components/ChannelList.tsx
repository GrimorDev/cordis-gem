
import React from 'react';
import { Hash, Volume2, Plus, Settings, Mic, Headphones, Lock, FolderPlus } from 'lucide-react';
import { Server, ChannelType, User, UserStatus } from '../types';
import { useAudioLevel } from './VideoGrid';
import { getUserRoleColor } from '../utils/helpers';

interface ChannelListProps {
  activeServer?: Server;
  activeChannelId: string | null;
  activeVoiceChannelId: string | null;
  currentUser: User;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (catId: string) => void;
  onOpenSettings: (type: any, data?: any) => void;
}

const VoiceParticipant: React.FC<{ user: User; server?: Server; isLocal: boolean; isTalking: boolean }> = ({ user, server, isLocal, isTalking }) => {
  const roleColor = getUserRoleColor(user, server);
  
  return (
    <div className="flex items-center gap-2 ml-7 py-1 animate-in fade-in slide-in-from-left-1 duration-200">
      <div className="relative">
        <img 
          src={user.avatar} 
          className={`w-5 h-5 rounded-full object-cover transition-all duration-150 ${
            isTalking 
            ? 'ring-2 ring-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] scale-110' 
            : 'ring-1 ring-white/10'
          }`} 
        />
        {isTalking && (
          <div className="absolute -inset-1 bg-emerald-500/20 rounded-full animate-pulse -z-10" />
        )}
      </div>
      <span 
        className={`text-[12px] font-medium truncate ${isTalking ? 'font-bold' : ''}`}
        style={{ color: roleColor || (isTalking ? 'rgb(16, 185, 129)' : 'var(--text-muted)') }}
      >
        {user.username}
      </span>
      {isLocal && <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 rounded uppercase font-black">Ty</span>}
    </div>
  );
};

export const ChannelList: React.FC<ChannelListProps> = ({ 
  activeServer, 
  activeChannelId, 
  activeVoiceChannelId,
  currentUser, 
  onSelectChannel, 
  onCreateChannel, 
  onOpenSettings 
}) => {
  if (!activeServer) return null;

  const localLevel = useAudioLevel(null, false);
  const isLocalTalking = localLevel > 20;

  return (
    <div className="flex flex-col h-full bg-[#080808]">
      <div className="p-4 shrink-0 overflow-y-auto no-scrollbar flex-1">
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between mb-4 px-3 group/header">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-60">Kategorie</span>
                    <button 
                        onClick={() => onOpenSettings('CREATE_CATEGORY')} 
                        className="text-slate-600 hover:text-white transition-colors p-1"
                        title="Dodaj kategorię"
                    >
                        <FolderPlus size={14} />
                    </button>
                </div>
                {activeServer.categories.map(cat => (
                    <div key={cat.id} className="mb-6">
                        <div className="flex items-center justify-between mb-2 px-3">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] truncate">{cat.name}</span>
                            <Plus 
                                size={14} 
                                className="text-slate-700 hover:text-white cursor-pointer transition-colors" 
                                onClick={() => onCreateChannel(cat.id)} 
                                title="Utwórz kanał"
                            />
                        </div>
                        <div className="space-y-0.5">
                            {cat.channels.map(ch => {
                                const isVoice = ch.type === ChannelType.VOICE;
                                const isActive = activeChannelId === ch.id || activeVoiceChannelId === ch.id;
                                const participants = ch.connectedUserIds.map(id => 
                                    activeServer.members.find(m => m.id === id) || (id === 'gemini' ? { id: 'gemini', username: 'Gemini AI', avatar: 'https://picsum.photos/201' } : null)
                                ).filter(Boolean) as User[];

                                return (
                                    <div key={ch.id} className="mb-1 group/item">
                                        <div className="relative">
                                            <button 
                                                onClick={() => onSelectChannel(ch.id)}
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all font-bold text-[13px] ${
                                                    isActive 
                                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-600/5' 
                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                                }`}
                                            >
                                                {isVoice ? <Volume2 size={16} /> : <Hash size={16} />}
                                                <span className="truncate flex-1 text-left">{ch.name}</span>
                                                
                                                {ch.isPrivate && <Lock size={12} className="text-slate-600" />}
                                                
                                                {isVoice && isActive && (
                                                    <div className="flex gap-0.5 items-end h-3">
                                                        <div className="w-0.5 h-full bg-indigo-500 animate-pulse" />
                                                        <div className="w-0.5 h-2/3 bg-indigo-500 animate-pulse delay-75" />
                                                        <div className="w-0.5 h-1/2 bg-indigo-500 animate-pulse delay-150" />
                                                    </div>
                                                )}
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenSettings('EDIT_CHANNEL', ch);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-white opacity-0 group-hover/item:opacity-100 transition-opacity"
                                            >
                                                <Settings size={14} />
                                            </button>
                                        </div>
                                        
                                        {isVoice && participants.length > 0 && (
                                            <div className="mt-1 flex flex-col gap-0.5">
                                                {participants.map(p => (
                                                    <VoiceParticipant 
                                                        key={p.id} 
                                                        user={p} 
                                                        server={activeServer}
                                                        isLocal={p.id === currentUser.id} 
                                                        isTalking={p.id === currentUser.id ? isLocalTalking : (p.id === 'gemini' && Math.random() > 0.8)} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="p-4 bg-[#0c0c0c] border-t border-white/10 flex items-center gap-3">
        <div className="relative shrink-0">
            <img src={currentUser.avatar} className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 shadow-lg shadow-black/50" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0c0c] ${currentUser.status === UserStatus.ONLINE ? 'bg-emerald-500' : 'bg-slate-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-white truncate tracking-tight">{currentUser.username}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Status: {activeVoiceChannelId ? 'W rozmowie' : 'Online'}</p>
        </div>
        <div className="flex items-center gap-0.5 text-slate-500">
            <button className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all" title="Wycisz"><Mic size={16}/></button>
            <button className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all" title="Ogłusz"><Headphones size={16}/></button>
            <button onClick={() => onOpenSettings('SETTINGS')} className="p-1.5 hover:bg-white/5 hover:text-white rounded-lg transition-all" title="Ustawienia użytkownika"><Settings size={16}/></button>
        </div>
      </div>
    </div>
  );
};
