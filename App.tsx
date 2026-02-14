
import React, { useState, useEffect } from 'react';
import { Sparkles, Bell, Users, Settings, MessageSquare, Search } from 'lucide-react';
import { ServerList } from './components/ServerList';
import { ChannelList } from './components/ChannelList';
import { ChatArea } from './components/ChatArea';
import { UserList } from './components/UserList';
import { VideoGrid } from './components/VideoGrid';
import { MiniPlayer } from './components/MiniPlayer';
import { ModalManager } from './components/Modals';
import { UserProfileSidebar } from './components/UserProfileSidebar';
import { Server, Message, User, ChannelType, ModalType, UserStatus, Channel, ServerCategory } from './types';
import { INITIAL_SERVERS, MOCK_USER, GEMINI_BOT } from './constants';
import { generateAIResponse } from './services/geminiService';

const App: React.FC = () => {
  const [servers, setServers] = useState<Server[]>(() => {
    const saved = localStorage.getItem('cordis_servers');
    return saved ? JSON.parse(saved) : INITIAL_SERVERS;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('cordis_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('cordis_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeServerId, setActiveServerId] = useState<string | 'DM'>(servers[0]?.id || 'DM');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string | null>(null);
  const [isVoiceMinimized, setIsVoiceMinimized] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentUser.settings.theme);
    localStorage.setItem('cordis_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cordis_messages', JSON.stringify(messagesMap));
  }, [messagesMap]);

  useEffect(() => {
    localStorage.setItem('cordis_servers', JSON.stringify(servers));
  }, [servers]);

  // Set initial channel on load if not set
  useEffect(() => {
    if (!activeChannelId && activeServerId !== 'DM') {
      const s = servers.find(sv => sv.id === activeServerId);
      const firstChannel = s?.categories?.[0]?.channels?.[0]?.id;
      if (firstChannel) setActiveChannelId(firstChannel);
    } else if (!activeChannelId && activeServerId === 'DM') {
      setActiveChannelId('dm-gemini');
    }
  }, []);

  const activeServer = servers.find(s => s.id === activeServerId);
  
  const dmChannels = [
    { id: 'dm-gemini', name: 'Gemini AI', avatar: GEMINI_BOT.avatar, status: UserStatus.ONLINE, user: GEMINI_BOT },
    { id: 'dm-support', name: 'Support Bot', avatar: 'https://picsum.photos/101', status: UserStatus.IDLE, user: { ...GEMINI_BOT, username: 'Support Bot', id: 'dm-support', avatar: 'https://picsum.photos/101' } }
  ];

  const activeChannel = activeServerId === 'DM' 
    ? { id: activeChannelId, name: dmChannels.find(d => d.id === activeChannelId)?.name || 'Czat', type: ChannelType.TEXT }
    : activeServer?.categories?.flatMap(c => c.channels).find(c => c.id === activeChannelId);

  const activeDMUser = activeServerId === 'DM' ? dmChannels.find(d => d.id === activeChannelId)?.user : null;

  const handleSendMessage = async (content: string, replyToId?: string, attachment?: any) => {
    if (!activeChannelId) return;
    const newMessage: Message = { 
        id: Math.random().toString(36).substr(2, 9), 
        content, 
        senderId: currentUser.id, 
        timestamp: new Date(),
        replyToId,
        attachment
    };
    
    setMessagesMap(prev => ({ 
        ...prev, 
        [activeChannelId]: [...(prev[activeChannelId] || []), newMessage] 
    }));
    
    if (activeChannelId === 'dm-gemini' || content.toLowerCase().includes('gemini')) {
      setTypingUsers([GEMINI_BOT.username]);
      const response = await generateAIResponse(content);
      
      setTimeout(() => {
        setTypingUsers([]);
        const aiMsg: Message = { 
            id: (Date.now()+1).toString(), 
            content: response, 
            senderId: GEMINI_BOT.id, 
            timestamp: new Date(),
            replyToId: newMessage.id
        };
        setMessagesMap(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), aiMsg] }));
      }, 1500);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeChannelId) return;
    setMessagesMap(prev => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].map(m => m.id === messageId ? { ...m, isDeleted: true, content: 'Ta wiadomość została usunięta.' } : m)
    }));
  };

  const handleUpdateMessage = (messageId: string, newContent: string) => {
    if (!activeChannelId) return;
    setMessagesMap(prev => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].map(m => 
        m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
      )
    }));
  };

  const handleModalSubmit = (data: any) => {
    let shouldClose = true;

    if (modalType === 'SETTINGS') {
      const updatedUser: User = {
        ...currentUser,
        username: data.username || currentUser.username,
        avatar: data.avatar || currentUser.avatar,
        settings: { ...currentUser.settings, ...data.settings }
      };
      
      setCurrentUser(updatedUser);
      setServers(prev => prev.map(s => ({
        ...s,
        members: s.members.map(m => m.id === updatedUser.id ? updatedUser : m)
      })));
    } else if (modalType === 'SERVER_SETTINGS') {
      if (data._action === 'DELETE_SERVER') {
        const remainingServers = servers.filter(s => s.id !== data.id);
        setServers(remainingServers);
        setActiveServerId('DM');
        setActiveChannelId('dm-gemini');
        shouldClose = true;
      } else {
        setServers(prev => prev.map(s => s.id === data.id ? data : s));
        shouldClose = false; 
      }
    } else if (modalType === 'EDIT_CHANNEL') {
      setServers(prev => prev.map(s => s.id === activeServerId ? data : s));
    } else if (modalType === 'CREATE_SERVER') {
      const newServerId = 's-' + Date.now();
      const newServer: Server = {
        id: newServerId,
        name: data.name,
        icon: 'https://picsum.photos/seed/' + data.name + '/100',
        ownerId: currentUser.id,
        members: [currentUser],
        roles: [...INITIAL_SERVERS[0].roles],
        categories: [{ id: 'c-gen-' + Date.now(), name: 'General', channels: [{ id: 'ch-' + Date.now(), name: 'ogolny', type: ChannelType.TEXT, messages: [], connectedUserIds: [], categoryId: 'c-gen' }] }]
      };
      setServers([...servers, newServer]);
      setActiveServerId(newServerId);
      setActiveChannelId(newServer.categories[0].channels[0].id);
    } else if (modalType === 'CREATE_CATEGORY') {
        const newCat: ServerCategory = {
            id: 'cat-' + Date.now(),
            name: data.name,
            channels: []
        };
        setServers(prev => prev.map(s => {
            if (s.id !== activeServerId) return s;
            return {
                ...s,
                categories: [...s.categories, newCat]
            };
        }));
    } else if (modalType === 'CREATE_CHANNEL') {
        const newCh: Channel = {
            id: 'ch-' + Date.now(),
            name: data.name,
            type: data.type,
            messages: [],
            connectedUserIds: [],
            categoryId: data.categoryId
        };
        setServers(prev => prev.map(s => {
            if (s.id !== activeServerId) return s;
            return {
                ...s,
                categories: s.categories.map(cat => {
                    if (cat.id !== data.categoryId) return cat;
                    return { ...cat, channels: [...cat.channels, newCh] };
                })
            };
        }));
        if (data.type === ChannelType.TEXT) {
            setActiveChannelId(newCh.id);
        }
    }

    if (shouldClose) {
        setModalType(null);
        setModalData(null);
    }
  };

  const openModal = (type: ModalType, data: any = null) => {
    setModalType(type);
    setModalData(data);
  };

  const startCall = async (channelId: string) => {
    if (activeVoiceChannelId === channelId) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isCameraOn });
        setLocalStream(stream);
        setActiveVoiceChannelId(channelId);
        setIsVoiceMinimized(false);

        setServers(prev => prev.map(s => {
            if (s.id !== activeServerId) return s;
            return {
                ...s,
                categories: s.categories.map(c => ({
                    ...c,
                    channels: c.channels.map(ch => {
                        if (ch.id === channelId) {
                            return { ...ch, connectedUserIds: Array.from(new Set([...ch.connectedUserIds, currentUser.id, GEMINI_BOT.id])) };
                        }
                        if (ch.type === ChannelType.VOICE) {
                            return { ...ch, connectedUserIds: ch.connectedUserIds.filter(id => id !== currentUser.id) };
                        }
                        return ch;
                    })
                }))
            };
        }));
    } catch (err) {
        console.error("Call error:", err);
        setActiveVoiceChannelId(channelId);
    }
  };

  const handleToggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
        };
        setScreenStream(stream);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    }
  };

  const stopCall = () => {
    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
    }
    if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
    }
    setLocalStream(null);
    setScreenStream(null);
    const prevVoiceId = activeVoiceChannelId;
    setActiveVoiceChannelId(null);
    setIsVoiceMinimized(false);

    if (prevVoiceId) {
        setServers(prev => prev.map(s => ({
            ...s,
            categories: s.categories.map(c => ({
                ...c,
                channels: c.channels.map(ch => {
                    if (ch.id === prevVoiceId) {
                        return { ...ch, connectedUserIds: ch.connectedUserIds.filter(id => id !== currentUser.id && id !== GEMINI_BOT.id) };
                    }
                    return ch;
                })
            }))
        })));
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-v0 text-v-main overflow-hidden font-sans transition-colors duration-200">
      <ServerList 
        servers={servers} 
        activeServerId={activeServerId} 
        onSwitchServer={(id) => {
            setActiveServerId(id);
            if (id === 'DM') {
                setActiveChannelId('dm-gemini');
            } else {
                const s = servers.find(sv => sv.id === id);
                setActiveChannelId(s?.categories?.[0]?.channels?.[0]?.id || null);
            }
        }} 
        onAddServer={() => openModal('CREATE_SERVER')}
      />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[280px] flex flex-col bg-v1 border-r border-v shrink-0">
          {activeServerId === 'DM' ? (
            <div className="flex-1 flex flex-col h-full bg-[#080808]">
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            placeholder="Szukaj rozmowy..." 
                            className="w-full bg-v2 p-2 pl-9 rounded-lg text-[11px] font-bold text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/30 border border-transparent transition-all"
                        />
                    </div>
                </div>
                <div className="p-3 space-y-1 flex-1 overflow-y-auto no-scrollbar">
                    <div className="px-3 py-2 text-[10px] font-black text-v-muted uppercase tracking-[0.2em] opacity-60">Prywatne wiadomości</div>
                    {dmChannels.map(dm => (
                        <button 
                            key={dm.id}
                            onClick={() => setActiveChannelId(dm.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${activeChannelId === dm.id ? 'bg-indigo-600/20 text-white' : 'text-v-muted hover:bg-v2 hover:text-white'}`}
                        >
                            <div className="relative">
                                <img src={dm.avatar} className="w-9 h-9 rounded-full border border-white/5 shadow-lg" alt={dm.name} />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080808] ${dm.status === UserStatus.ONLINE ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                            </div>
                            <span className={`font-bold text-[13px] truncate ${activeChannelId === dm.id ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{dm.name}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 bg-[#0c0c0c] border-t border-white/10 flex items-center gap-3">
                    <div className="relative shrink-0">
                        <img src={currentUser.avatar} className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 shadow-lg shadow-black/50" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0c0c] ${currentUser.status === UserStatus.ONLINE ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-white truncate tracking-tight">{currentUser.username}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Dostępny</p>
                    </div>
                    <button onClick={() => openModal('SETTINGS')} className="p-1.5 hover:bg-white/5 text-v-muted hover:text-white rounded-lg"><Settings size={16}/></button>
                </div>
            </div>
          ) : (
            <ChannelList 
              activeServer={activeServer} 
              activeChannelId={activeChannelId} 
              activeVoiceChannelId={activeVoiceChannelId}
              currentUser={currentUser}
              onSelectChannel={(id) => {
                  const ch = activeServer?.categories?.flatMap(c => c.channels).find(c => c.id === id);
                  if (ch?.type === ChannelType.VOICE) { 
                      startCall(id);
                  }
                  else setActiveChannelId(id);
              }}
              onOpenSettings={openModal}
              onCreateChannel={(catId) => openModal('CREATE_CHANNEL', catId)}
            />
          )}
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-v0 transition-all duration-200">
          <header className="h-[64px] border-b border-v flex items-center justify-between px-8 shrink-0 z-10 bg-v0/80 backdrop-blur-md">
            <div className="flex items-center gap-4 min-w-0">
              {activeServerId === 'DM' ? (
                <div className="flex items-center gap-3">
                   <div className="text-v-muted"><MessageSquare size={20} /></div>
                   <h1 className="text-lg font-black tracking-tight truncate">{activeChannel?.name || 'Wybierz rozmowę'}</h1>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="text-v-muted"><Sparkles size={20} /></div>
                   <h1 className="text-lg font-black tracking-tight truncate">{activeServer?.name || 'Wybierz serwer'}</h1>
                   {activeChannel && (
                     <div className="flex items-center gap-2 text-v-muted font-bold text-xs uppercase tracking-widest">
                        <span className="opacity-30">/</span>
                        <span className="text-indigo-400">#{activeChannel.name}</span>
                     </div>
                   )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
               {activeServerId !== 'DM' && <button onClick={() => openModal('SERVER_SETTINGS')} className="p-2 text-v-muted hover:text-white hover:bg-v2 rounded-lg transition-all"><Settings size={18}/></button>}
               <button className="p-2 text-v-muted hover:text-white"><Bell size={18}/></button>
               <button className="p-2 text-v-muted hover:text-white"><Users size={18}/></button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 flex flex-col bg-v0 relative min-w-0">
                {activeChannelId && activeChannel ? (
                    <ChatArea 
                        channel={activeChannel as any}
                        messages={messagesMap[activeChannelId] || []}
                        members={activeServer?.members || [currentUser, GEMINI_BOT]}
                        onSendMessage={handleSendMessage}
                        onDeleteMessage={handleDeleteMessage}
                        onUpdateMessage={handleUpdateMessage}
                        currentUser={currentUser}
                        typingUsers={typingUsers}
                        activeServer={activeServer}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center opacity-10">
                        <Sparkles size={100} />
                    </div>
                )}
            </main>
            {activeServerId === 'DM' ? (
              activeDMUser && <UserProfileSidebar user={activeDMUser as User} />
            ) : (
              <aside className="w-[280px] border-l border-v bg-v1 shrink-0 hidden xl:block">
                <UserList members={activeServer?.members || []} server={activeServer} />
              </aside>
            )}
          </div>

          {activeVoiceChannelId && (
            isVoiceMinimized ? (
              <MiniPlayer 
                stream={localStream} 
                channelName={activeServer?.categories?.flatMap(c => c.channels).find(ch => ch.id === activeVoiceChannelId)?.name}
                isMicMuted={isMicMuted}
                isDeafened={isDeafened}
                onExpand={() => setIsVoiceMinimized(false)}
                onDisconnect={stopCall}
                onToggleMic={() => setIsMicMuted(!isMicMuted)}
                onToggleDeafen={() => setIsDeafened(!isDeafened)}
              />
            ) : (
              <VideoGrid 
                localStream={localStream}
                screenStream={screenStream}
                isMicMuted={isMicMuted}
                isDeafened={isDeafened}
                isCameraOn={isCameraOn}
                onToggleMic={() => setIsMicMuted(!isMicMuted)}
                onToggleDeafen={() => setIsDeafened(!isDeafened)}
                onToggleCamera={() => setIsCameraOn(!isCameraOn)}
                onToggleScreenShare={handleToggleScreenShare} 
                onDisconnect={stopCall}
                onOpenSettings={() => openModal('DEVICE_SETTINGS')}
                onMinimize={() => setIsVoiceMinimized(true)}
              />
            )
          )}
        </div>
      </div>

      <ModalManager 
        isOpen={!!modalType}
        type={modalType}
        onClose={() => { setModalType(null); setModalData(null); }}
        onSubmit={handleModalSubmit}
        currentUser={currentUser}
        activeServer={activeServer}
        targetData={modalData}
      />
    </div>
  );
};

export default App;
