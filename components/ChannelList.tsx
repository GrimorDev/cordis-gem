
import React, { useState } from 'react';
import { Hash, Volume2, Plus, Settings, Lock, ChevronDown, Mic, MicOff, Headphones, HeadphoneOff, Search, UserPlus, FolderPlus, GripVertical } from 'lucide-react';
import { Server, ChannelType, User, UserStatus, ModalType } from '../types';

interface ChannelListProps {
  activeServer?: Server;
  activeChannelId: string | null;
  activeVoiceChannelId: string | null;
  currentUser: User;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (catId: string) => void;
  onOpenSettings: (type: ModalType, data?: any) => void;
  onStatusChange?: (status: UserStatus) => void;
  onToggleMic?: () => void;
  onToggleDeafen?: () => void;
  onReorder?: (type: 'CATEGORY' | 'CHANNEL', sourceId: string, targetId: string, categoryId?: string) => void;
  isMicMuted?: boolean;
  isDeafened?: boolean;
  localStream?: MediaStream | null;
  isDMView?: boolean;
  dmChannels?: any[];
}

const StatusOption: React.FC<{ status: UserStatus, label: string, active: boolean, onClick: () => void }> = ({ status, label, active, onClick }) => {
  const getDotColor = () => {
    switch(status) {
      case UserStatus.ONLINE: return 'bg-emerald-500';
      case UserStatus.IDLE: return 'bg-amber-400';
      case UserStatus.DND: return 'bg-rose-500';
      case UserStatus.OFFLINE: return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all ${active ? 'bg-indigo-600/20' : ''}`}>
      <div className={`w-3 h-3 rounded-full ${getDotColor()}`} />
      <span className="text-xs font-bold text-slate-200">{label}</span>
    </button>
  );
};

const VoiceParticipant: React.FC<{ user: User; isTalking: boolean; isMuted?: boolean; isDeafened?: boolean; }> = ({ user, isTalking, isMuted, isDeafened }) => (
    <div className="flex items-center gap-2 ml-7 py-1 animate-in fade-in slide-in-from-left-1">
      <img src={user.avatar} className={`w-5 h-5 rounded-full ${isTalking ? 'ring-2 ring-emerald-500' : ''}`} />
      <span className="text-[12px] font-medium text-slate-400 flex-1 truncate">{user.username}</span>
      <div className="flex items-center gap-1">
        {isDeafened && <HeadphoneOff size={12} className="text-rose-500" />}
        {!isDeafened && isMuted && <MicOff size={12} className="text-rose-500" />}
      </div>
    </div>
);

export const ChannelList: React.FC<ChannelListProps> = ({ 
  activeServer, activeChannelId, activeVoiceChannelId, currentUser, 
  onSelectChannel, onCreateChannel, onOpenSettings, onStatusChange,
  onToggleMic, onToggleDeafen, onReorder, isMicMuted, isDeafened, isDMView, dmChannels = []
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{type: 'CATEGORY'|'CHANNEL', id: string, categoryId?: string} | null>(null);

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
        case UserStatus.ONLINE: return 'bg-emerald-500';
        case UserStatus.IDLE: return 'bg-amber-400';
        case UserStatus.DND: return 'bg-rose-500';
        case UserStatus.OFFLINE: return 'bg-slate-500';
        case UserStatus.IN_CALL: return 'bg-indigo-500 animate-pulse';
        default: return 'bg-slate-500';
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, type: 'CATEGORY'|'CHANNEL', id: string, categoryId?: string) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ type, id, categoryId }));
      setDraggedItem({ type, id, categoryId });
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'CATEGORY'|'CHANNEL', targetCategoryId?: string) => {
      e.preventDefault();
      setDraggedItem(null);
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      
      const source = JSON.parse(data);
      
      // Logika upuszczania
      if (source.type === 'CATEGORY' && targetType === 'CATEGORY' && source.id !== targetId) {
          onReorder?.('CATEGORY', source.id, targetId);
      } else if (source.type === 'CHANNEL' && targetType === 'CHANNEL' && source.id !== targetId) {
          // Jeśli przenosimy kanał, musimy wiedzieć w jakiej kategorii ląduje (zazwyczaj tej samej lub innej)
          // Na razie proste sortowanie wewnątrz jednej kategorii, ale API pozwala na przenoszenie między kategoriami
          onReorder?.('CHANNEL', source.id, targetId, targetCategoryId);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#080808] relative">
      {/* Header */}
      <div className="relative shrink-0 z-20">
        <button 
          onClick={() => !isDMView && setShowServerMenu(!showServerMenu)}
          className={`h-[64px] w-full px-4 flex items-center justify-between border-b border-white/5 transition-all ${!isDMView ? 'hover:bg-white/5' : ''}`}
        >
          <h2 className="font-black text-white text-sm truncate uppercase tracking-tight">
            {isDMView ? 'Prywatne wiadomości' : activeServer?.name}
          </h2>
          {!isDMView && <ChevronDown size={18} className={`text-slate-400 transition-transform ${showServerMenu ? 'rotate-180' : ''}`} />}
        </button>

        {showServerMenu && !isDMView && activeServer && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowServerMenu(false)} />
            <div className="absolute top-[58px] left-2 right-2 bg-[#111214] border border-white/5 rounded-xl shadow-2xl z-20 p-2 animate-in zoom-in-95 duration-200">
               <button onClick={() => { onOpenSettings('SERVER_SETTINGS', activeServer); setShowServerMenu(false); }} className="w-full flex items-center justify-between p-2 rounded-lg text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-sm font-bold">
                  Ustawienia serwera <Settings size={16} />
               </button>
               <button onClick={() => { onOpenSettings('INVITE', activeServer); setShowServerMenu(false); }} className="w-full flex items-center justify-between p-2 rounded-lg text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-sm font-bold mt-1">
                  Zaproś znajomych <UserPlus size={16} />
               </button>
               <div className="h-px bg-white/5 my-1" />
               <button onClick={() => { onOpenSettings('CREATE_CATEGORY'); setShowServerMenu(false); }} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-all text-sm font-bold">
                  Utwórz kategorię <FolderPlus size={16} />
               </button>
               <button onClick={() => { 
                   if (activeServer.categories.length > 0) {
                       onOpenSettings('CREATE_CHANNEL', activeServer.categories[0].id);
                   } else {
                       onOpenSettings('CREATE_CATEGORY');
                       alert("Najpierw musisz utworzyć kategorię!");
                   }
                   setShowServerMenu(false); 
               }} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-all text-sm font-bold mt-1">
                  Utwórz kanał <Plus size={16} />
               </button>
            </div>
          </>
        )}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {isDMView ? (
          <div className="space-y-1">
             <div className="px-3 py-2">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input placeholder="Szukaj rozmowy..." className="w-full bg-v2 p-2 pl-9 rounded-lg text-[11px] font-bold text-slate-300 outline-none" />
                </div>
             </div>
             {dmChannels.map(dm => (
                <button 
                    key={dm.id}
                    onClick={() => onSelectChannel(dm.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeChannelId === dm.id ? 'bg-indigo-600/20 text-white' : 'text-v-muted hover:bg-v2 hover:text-white'}`}
                >
                    <div className="relative">
                        <img src={dm.avatar} className="w-9 h-9 rounded-full" alt={dm.name} />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080808] ${getStatusColor(dm.status)}`} />
                    </div>
                    <span className="font-bold text-[13px] truncate">{dm.name}</span>
                </button>
             ))}
          </div>
        ) : activeServer && (
          activeServer.categories.length > 0 ? (
            activeServer.categories.map(cat => (
              <div 
                  key={cat.id} 
                  className={`mb-6 ${draggedItem?.id === cat.id ? 'opacity-40 border-2 border-dashed border-slate-500 rounded-lg' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'CATEGORY', cat.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cat.id, 'CATEGORY')}
              >
                <div className="flex items-center justify-between mb-2 px-3 group">
                  <div className="flex items-center gap-1 cursor-move">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors">{cat.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Settings size={12} className="text-slate-600 cursor-pointer hover:text-white" onClick={() => onOpenSettings('EDIT_CATEGORY', cat)} />
                     <Plus size={14} className="text-slate-600 cursor-pointer hover:text-white" onClick={() => onCreateChannel(cat.id)} />
                  </div>
                </div>
                <div className="space-y-0.5">
                  {cat.channels.map(ch => {
                    const isVoice = ch.type === ChannelType.VOICE;
                    const isActive = activeChannelId === ch.id || activeVoiceChannelId === ch.id;
                    return (
                      <div 
                          key={ch.id}
                          draggable
                          onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, 'CHANNEL', ch.id, cat.id); }}
                          onDragOver={handleDragOver}
                          onDrop={(e) => { e.stopPropagation(); handleDrop(e, ch.id, 'CHANNEL', cat.id); }}
                          className={`${draggedItem?.id === ch.id ? 'opacity-40' : ''}`}
                      >
                        <div className="group relative">
                            <button 
                              onClick={() => onSelectChannel(ch.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                              {isVoice ? <Volume2 size={16} /> : <Hash size={16} />}
                              <span className="truncate flex-1 text-left">{ch.name}</span>
                              {ch.isPrivate && <Lock size={12} className="text-slate-600" />}
                            </button>
                            
                            {/* Edit Button only visible on hover */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenSettings('EDIT_CHANNEL', ch); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Settings size={12} />
                            </button>
                        </div>
                        {isVoice && activeVoiceChannelId === ch.id && (
                          <VoiceParticipant user={currentUser} isTalking={false} isMuted={isMicMuted} isDeafened={isDeafened} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-40">
                <FolderPlus size={48} className="mb-4 text-slate-500" />
                <h3 className="text-sm font-bold text-white mb-2">Pusto tutaj...</h3>
                <p className="text-xs text-slate-400 mb-6">Ten serwer nie ma jeszcze żadnych kanałów. Utwórz kategorię, aby zacząć.</p>
                <button 
                    onClick={() => onOpenSettings('CREATE_CATEGORY')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-all"
                >
                    Utwórz pierwszą kategorię
                </button>
            </div>
          )
        )}
      </div>

      {/* User Bar */}
      {showStatusMenu && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
            <div className="absolute bottom-[72px] left-4 w-52 bg-[#111214] border border-white/5 rounded-xl shadow-2xl z-50 p-2 animate-in slide-in-from-bottom-2">
                <StatusOption status={UserStatus.ONLINE} label="Dostępny" active={currentUser.status === UserStatus.ONLINE} onClick={() => { onStatusChange?.(UserStatus.ONLINE); setShowStatusMenu(false); }} />
                <StatusOption status={UserStatus.IDLE} label="Zaraz wracam" active={currentUser.status === UserStatus.IDLE} onClick={() => { onStatusChange?.(UserStatus.IDLE); setShowStatusMenu(false); }} />
                <StatusOption status={UserStatus.DND} label="Nie przeszkadzać" active={currentUser.status === UserStatus.DND} onClick={() => { onStatusChange?.(UserStatus.DND); setShowStatusMenu(false); }} />
                <StatusOption status={UserStatus.OFFLINE} label="Niewidoczny" active={currentUser.status === UserStatus.OFFLINE} onClick={() => { onStatusChange?.(UserStatus.OFFLINE); setShowStatusMenu(false); }} />
            </div>
        </>
      )}

      <div className="p-4 bg-[#0c0c0c] border-t border-white/10 flex items-center gap-3 shrink-0">
        <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="relative group shrink-0">
            <img src={currentUser.avatar} className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/5 group-hover:brightness-75 transition-all" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0c0c0c] ${getStatusColor(currentUser.status)}`} />
        </button>
        <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-white truncate">{currentUser.username}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase truncate">
                {currentUser.status === UserStatus.IN_CALL ? 'W rozmowie' : (currentUser.customStatus || 'Online')}
            </p>
        </div>
        <div className="flex items-center gap-0.5 text-slate-500">
            <button 
                onClick={onToggleMic} 
                className={`p-1.5 rounded-lg transition-colors ${isMicMuted ? 'text-rose-500 bg-rose-500/10' : 'hover:bg-white/5 hover:text-white'}`}
                title={isMicMuted ? "Włącz mikrofon" : "Wycisz mikrofon"}
            >
                {isMicMuted ? <MicOff size={16}/> : <Mic size={16}/>}
            </button>
            <button 
                onClick={onToggleDeafen} 
                className={`p-1.5 rounded-lg transition-colors ${isDeafened ? 'text-rose-500 bg-rose-500/10' : 'hover:bg-white/5 hover:text-white'}`}
                title={isDeafened ? "Wyłącz ogłuszenie" : "Ogłusz"}
            >
                {isDeafened ? <HeadphoneOff size={16}/> : <Headphones size={16}/>}
            </button>
            <button 
                onClick={() => onOpenSettings('SETTINGS')} 
                className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Ustawienia użytkownika"
            >
                <Settings size={16}/>
            </button>
        </div>
      </div>
    </div>
  );
};
