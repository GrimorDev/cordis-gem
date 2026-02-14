
import React, { useState } from 'react';
import { Hash, Volume2, Plus, Settings, Mic, Headphones, Lock, FolderPlus, Circle, ChevronDown, UserPlus } from 'lucide-react';
import { Server, ChannelType, User, UserStatus, ModalType } from '../types';
import { useAudioLevel } from './VideoGrid';
import { getUserRoleColor } from '../utils/helpers';

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

const StatusOption: React.FC<{ status: UserStatus, label: string, desc: string, active: boolean, onClick: () => void }> = ({ status, label, desc, active, onClick }) => {
  const getDotColor = () => {
    switch(status) {
      case UserStatus.ONLINE: return 'bg-emerald-500';
      case UserStatus.IDLE: return 'bg-amber-400';
      case UserStatus.DND: return 'bg-rose-500';
      case UserStatus.OFFLINE: return 'bg-slate-500';
      case UserStatus.IN_CALL: return 'bg-indigo-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all group ${active ? 'bg-indigo-600/20' : 'hover:bg-white/5'}`}
    >
      <div className={`w-3 h-3 rounded-full shrink-0 ${getDotColor()} ${active ? 'ring-2 ring-white/20' : ''}`} />
      <div className="flex-1 text-left min-w-0">
        <p className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-slate-200'}`}>{label}</p>
        <p className="text-[10px] text-slate-500 font-medium leading-tight truncate">{desc}</p>
      </div>
    </button>
  );
};

export const ChannelList: React.FC<ChannelListProps> = ({ 
  activeServer, 
  activeChannelId, 
  activeVoiceChannelId,
  currentUser, 
  onSelectChannel, 
  onCreateChannel, 
  onOpenSettings,
  onStatusChange
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  
  if (!activeServer) return null;

  // Passing all arguments to useAudioLevel to avoid potential inference issues
  const localLevel = useAudioLevel(null, false, false);
  const isLocalTalking = localLevel > 20;

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
        case UserStatus.ONLINE: return 'bg-emerald-500';
        case UserStatus.IDLE: return 'bg-amber-400';
        case UserStatus.DND: return 'bg-rose-500';
        case UserStatus.OFFLINE: return 'bg-slate-500';
        case UserStatus.IN_CALL: return 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] animate-pulse';
        default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ONLINE: return 'Online';
      case UserStatus.IDLE: return 'Zaraz wracam';
      case UserStatus.DND: return 'Nie przeszkadzać';
      case UserStatus.OFFLINE: return 'Niewidoczny';
      case UserStatus.IN_CALL: return 'W trakcie rozmowy';
      default: return 'Online';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080808] relative">
      {/* Server Header */}
      <div className="relative shrink-0 z-20">
        <button 
          onClick={() => setShowServerMenu(!showServerMenu)}
          className="h-[64px] w-full px-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-all outline-none"
        >
          <h2 className="font-black text-white text-sm truncate tracking-tight">{activeServer.name}</h2>
          <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${showServerMenu ? 'rotate-180' : ''}`} />
        </button>

        {showServerMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowServerMenu(false)} />
            <div className="absolute top-[58px] left-2 right-2 bg-[#111214] border border-white/5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
               <button 
                onClick={() => { onOpenSettings('SERVER_SETTINGS', activeServer); setShowServerMenu(false); }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-sm font-bold group"
               >
                  Ustawienia serwera
                  <Settings size={16} />
               </button>
               <button 
                onClick={() => { onOpenSettings('INVITE', activeServer); setShowServerMenu(false); }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-sm font-bold mt-1 group"
               >
                  Zaproś znajomych
                  <UserPlus size={16} />
               </button>
               <div className="h-px bg-white/5 my-1" />
               <button 
                onClick={() => { onOpenSettings('CREATE_CHANNEL'); setShowServerMenu(false); }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-all text-sm font-bold"
               >
                  Utwórz kanał
                  <Plus size={16} />
               </button>
            </div>
          </>
        )}
      </div>

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
                            {/* Fixed title prop error by wrapping Plus icon in a button */}
                            <button 
                                onClick={() => onCreateChannel(cat.id)} 
                                className="text-slate-700 hover:text-white transition-colors p-1"
                                title="Utwórz kanał"
                            >
                                <Plus size={14} />
                            </button>
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

      {/* User Status Popover */}
      {showStatusMenu && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
            <div className="absolute bottom-[72px] left-4 w-60 bg-[#111214] border border-white/5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 p-2 animate-in slide-in-from-bottom-2 duration-200">
                <StatusOption 
                    status={UserStatus.ONLINE} 
                    label="Dostępny" 
                    desc="Będziesz widoczny jako dostępny." 
                    active={currentUser.status === UserStatus.ONLINE}
                    onClick={() => { onStatusChange?.(UserStatus.ONLINE); setShowStatusMenu(false); }}
                />
                <StatusOption 
                    status={UserStatus.IDLE} 
                    label="Zaraz wracam" 
                    desc="Ustaw status na bezczynny." 
                    active={currentUser.status === UserStatus.IDLE}
                    onClick={() => { onStatusChange?.(UserStatus.IDLE); setShowStatusMenu(false); }}
                />
                <StatusOption 
                    status={UserStatus.DND} 
                    label="Nie przeszkadzać" 
                    desc="Nie będziesz otrzymywać powiadomień." 
                    active={currentUser.status === UserStatus.DND}
                    onClick={() => { onStatusChange?.(UserStatus.DND); setShowStatusMenu(false); }}
                />
                <StatusOption 
                    status={UserStatus.OFFLINE} 
                    label="Niewidoczny" 
                    desc="Będziesz wyglądać jak offline." 
                    active={currentUser.status === UserStatus.OFFLINE}
                    onClick={() => { onStatusChange?.(UserStatus.OFFLINE); setShowStatusMenu(false); }}
                />
            </div>
        </>
      )}

      {/* User Section */}
      <div className="p-4 bg-[#0c0c0c] border-t border-white/10 flex items-center gap-3 shrink-0">
        <button 
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="relative shrink-0 group focus:outline-none"
        >
            <img src={currentUser.avatar} className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 shadow-lg shadow-black/50 group-hover:brightness-75 transition-all" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0c0c0c] transition-colors ${getStatusColor(currentUser.status)}`} />
        </button>
        <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-white truncate tracking-tight">{currentUser.username}</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${currentUser.status === UserStatus.IN_CALL ? 'text-indigo-400' : 'text-slate-500 opacity-60'}`}>
                {getStatusText(currentUser.status)}
            </p>
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

interface ChannelListProps {
  activeServer?: Server;
  activeChannelId: string | null;
  activeVoiceChannelId: string | null;
  currentUser: User;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (catId: string) => void;
  onOpenSettings: (type: ModalType, data?: any) => void;
  onStatusChange?: (status: UserStatus) => void;
}
