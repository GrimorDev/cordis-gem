
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Bell, Users, Settings, MessageSquare, Search, UserPlus } from 'lucide-react';
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
  const [servers, setServers] = useState<Server[]>(INITIAL_SERVERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [friends, setFriends] = useState<User[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});

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

  // Status management
  const [manualStatus, setManualStatus] = useState<UserStatus>(MOCK_USER.status);

  // 1. Inicjalizacja danych z API
  useEffect(() => {
    const initData = async () => {
      try {
        // Pobierz profil usera
        const userRes = await fetch(`/api/users/${MOCK_USER.id}`);
        const userData = await userRes.json();
        if (userData) {
          setCurrentUser(prev => ({ ...prev, ...userData, settings: { ...prev.settings, ...(userData.settings || {}) } }));
          setManualStatus(userData.status);
        }

        // Pobierz znajomych (DM)
        const friendsRes = await fetch(`/api/friends/${MOCK_USER.id}`);
        setFriends(await friendsRes.json());

        // Pobierz serwery
        const serversRes = await fetch('/api/servers');
        const serversData = await serversRes.json();
        if (Array.isArray(serversData) && serversData.length > 0) {
          setServers(serversData.map((s: any) => ({
            ...s,
            ownerId: s.owner_id,
            roles: typeof s.roles === 'string' ? JSON.parse(s.roles) : s.roles,
            categories: typeof s.categories === 'string' ? JSON.parse(s.categories) : s.categories
          })));
        }
      } catch (e) {
        console.warn("Backend error - fallback to local constants", e);
      }
    };
    initData();
  }, []);

  // 2. Automatyczna synchronizacja statusu (w tym IN_CALL)
  useEffect(() => {
    const syncStatus = async () => {
      const targetStatus = activeVoiceChannelId ? UserStatus.IN_CALL : manualStatus;
      if (currentUser.status !== targetStatus) {
        setCurrentUser(prev => ({ ...prev, status: targetStatus }));
        try {
          await fetch(`/api/users/${currentUser.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetStatus })
          });
        } catch(e) {}
      }
    };
    syncStatus();
  }, [activeVoiceChannelId, manualStatus, currentUser.id]);

  const handleStatusChange = useCallback((newStatus: UserStatus) => {
    setManualStatus(newStatus);
  }, []);

  // 3. Pobieranie wiadomości przy zmianie kanału
  useEffect(() => {
    if (activeChannelId && !messagesMap[activeChannelId]) {
      const fetchMsgs = async () => {
        try {
          const res = await fetch(`/api/messages/${activeChannelId}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setMessagesMap(prev => ({ ...prev, [activeChannelId]: data.map((m: any) => ({
              ...m,
              senderId: m.sender_id,
              replyToId: m.reply_to_id,
              timestamp: new Date(m.timestamp)
            })) }));
          }
        } catch(e) {}
      };
      fetchMsgs();
    }
  }, [activeChannelId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentUser.settings.theme);
  }, [currentUser]);

  useEffect(() => {
    if (!activeChannelId && activeServerId !== 'DM') {
      const s = servers.find(sv => sv.id === activeServerId);
      const firstChannel = s?.categories?.[0]?.channels?.[0]?.id;
      if (firstChannel) setActiveChannelId(firstChannel);
    } else if (!activeChannelId && activeServerId === 'DM') {
      setActiveChannelId('dm-gemini');
    }
  }, [servers, activeServerId, activeChannelId]);

  const activeServer = servers.find(s => s.id === activeServerId);
  
  const dmChannels = [
    { id: 'dm-gemini', name: 'Gemini AI', avatar: GEMINI_BOT.avatar, status: UserStatus.ONLINE, user: GEMINI_BOT },
    ...friends.map(f => ({ id: `dm-${f.id}`, name: f.username, avatar: f.avatar, status: f.status, user: f }))
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
    
    setMessagesMap(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), newMessage] }));

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newMessage, 
          channel_id: activeChannelId, 
          sender_id: currentUser.id,
          reply_to_id: replyToId
        })
      });
    } catch(e) {}
    
    if (activeChannelId.includes('gemini') || content.toLowerCase().includes('gemini')) {
      setTypingUsers([GEMINI_BOT.username]);
      const response = await generateAIResponse(content);
      setTimeout(async () => {
        setTypingUsers([]);
        const aiMsg: Message = { id: Date.now().toString(), content: response, senderId: GEMINI_BOT.id, timestamp: new Date(), replyToId: newMessage.id };
        setMessagesMap(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), aiMsg] }));
        try {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...aiMsg, channel_id: activeChannelId, sender_id: GEMINI_BOT.id, reply_to_id: newMessage.id })
          });
        } catch(e) {}
      }, 1500);
    }
  };

  const handleModalSubmit = async (data: any) => {
    let shouldClose = true;

    if (modalType === 'SETTINGS') {
      const updatedUser = { ...currentUser, username: data.username, avatar: data.avatar, settings: { ...currentUser.settings, ...data.settings } };
      setCurrentUser(updatedUser);
      await fetch(`/api/users/${currentUser.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(updatedUser) });
    } else if (modalType === 'CREATE_SERVER') {
      const newServer: Server = {
        id: 's-' + Date.now(),
        name: data.name,
        icon: 'https://picsum.photos/seed/' + data.name + '/100',
        ownerId: currentUser.id,
        members: [currentUser],
        roles: [...INITIAL_SERVERS[0].roles],
        categories: [{ id: 'c-' + Date.now(), name: 'Ogólne', channels: [{ id: 'ch-' + Date.now(), name: 'ogólny', type: ChannelType.TEXT, messages: [], connectedUserIds: [], categoryId: 'c-gen' }] }]
      };
      setServers(prev => [...prev, newServer]);
      await fetch('/api/servers', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newServer) });
      setActiveServerId(newServer.id);
      setActiveChannelId(newServer.categories[0].channels[0].id);
    } else if (modalType === 'SERVER_SETTINGS') {
      if (data._action === 'DELETE_SERVER') {
        setServers(prev => prev.filter(s => s.id !== data.id));
        await fetch(`/api/servers/${data.id}`, { method: 'DELETE' });
        setActiveServerId('DM');
      } else {
        setServers(prev => prev.map(s => s.id === data.id ? data : s));
        await fetch('/api/servers', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
      }
    } else if (modalType === 'EDIT_CHANNEL' || modalType === 'CREATE_CHANNEL' || modalType === 'CREATE_CATEGORY') {
      // Te akcje aktualizują obiekt serwera, który przesyłamy w całości
      setServers(prev => prev.map(s => s.id === activeServerId ? data : s));
      await fetch('/api/servers', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    }

    if (shouldClose) {
        setModalType(null);
        setModalData(null);
    }
  };

  const startCall = async (channelId: string, isVideo: boolean = false) => {
    try {
        // Spróbuj uzyskać dostęp do mikrofonu i opcjonalnie kamery
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: isVideo || isCameraOn 
        });
        setLocalStream(stream);
        setIsCameraOn(isVideo || isCameraOn);
        setActiveVoiceChannelId(channelId);
        setIsVoiceMinimized(false);
    } catch (err: any) { 
        console.error("Call error:", err);
        // Fallback: jeśli video nie jest dostępne (np. brak kamery), spróbuj samo audio
        if (isVideo || isCameraOn) {
          try {
            console.log("Video device not found or denied, falling back to audio-only.");
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setLocalStream(audioOnlyStream);
            setIsCameraOn(false);
            setActiveVoiceChannelId(channelId);
            setIsVoiceMinimized(false);
          } catch (audioErr) {
            console.error("Audio fallback failed:", audioErr);
            alert("Błąd: Nie można uzyskać dostępu do mikrofonu. Sprawdź ustawienia prywatności przeglądarki.");
          }
        } else {
          alert("Błąd: Nie można uzyskać dostępu do mikrofonu. Sprawdź połączenie urządzeń.");
        }
    }
  };

  const toggleScreenShare = async () => {
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
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          console.warn("Screen share permission denied by user.");
        } else {
          console.error("Screen share error:", err);
        }
      }
    }
  };

  const stopCall = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setScreenStream(null);
    setActiveVoiceChannelId(null);
    setIsVoiceMinimized(false);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-v0 text-v-main overflow-hidden font-sans transition-colors duration-200">
      <ServerList 
        servers={servers} 
        activeServerId={activeServerId} 
        onSwitchServer={(id) => {
            setActiveServerId(id);
            setActiveChannelId(null);
        }} 
        onAddServer={() => setModalType('CREATE_SERVER')}
      />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[280px] flex flex-col bg-v1 border-r border-v shrink-0">
          {activeServerId === 'DM' ? (
            <div className="flex-1 flex flex-col h-full bg-[#080808]">
                <div className="p-4 border-b border-white/5 space-y-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            placeholder="Szukaj rozmowy..." 
                            className="w-full bg-v2 p-2 pl-9 rounded-lg text-[11px] font-bold text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/30 border border-transparent transition-all"
                        />
                    </div>
                    <button 
                      onClick={() => setModalType('ADD_FRIEND')}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 text-[11px] font-black uppercase tracking-wider transition-all"
                    >
                      <UserPlus size={14} /> Dodaj znajomego
                    </button>
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
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0c0c] ${manualStatus === UserStatus.ONLINE ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-white truncate tracking-tight">{currentUser.username}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">#{currentUser.discriminator}</p>
                    </div>
                    <button onClick={() => setModalType('SETTINGS')} className="p-1.5 hover:bg-white/5 text-v-muted hover:text-white rounded-lg"><Settings size={16}/></button>
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
                  if (ch?.type === ChannelType.VOICE) startCall(id);
                  else setActiveChannelId(id);
              }}
              onOpenSettings={(t, d) => { setModalType(t); setModalData(d); }}
              onStatusChange={handleStatusChange}
              onCreateChannel={(catId) => { setModalType('CREATE_CHANNEL'); setModalData(catId); }}
            />
          )}
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-v0 transition-all duration-200">
          <header className="h-[64px] border-b border-v flex items-center justify-between px-8 shrink-0 z-10 bg-v0/80 backdrop-blur-md">
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-v-muted"><MessageSquare size={20} /></div>
              <h1 className="text-lg font-black tracking-tight truncate">{activeChannel?.name || 'Wybierz kanał'}</h1>
            </div>
            <div className="flex items-center gap-4">
               {activeServerId === 'DM' && activeDMUser && (
                 <div className="flex items-center gap-2 mr-2">
                    <button onClick={() => startCall(activeChannelId || '', false)} className="p-2 text-v-muted hover:text-emerald-500"><Bell size={20}/></button>
                    <button onClick={() => startCall(activeChannelId || '', true)} className="p-2 text-v-muted hover:text-indigo-500"><Sparkles size={20}/></button>
                 </div>
               )}
               <button className="p-2 text-v-muted hover:text-white"><Bell size={18}/></button>
               <button className="p-2 text-v-muted hover:text-white"><Users size={18}/></button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 flex flex-col bg-v0 relative min-w-0">
                {activeChannelId ? (
                    <ChatArea 
                        channel={activeChannel as any}
                        messages={messagesMap[activeChannelId] || []}
                        members={activeServer?.members || [currentUser, GEMINI_BOT]}
                        onSendMessage={handleSendMessage}
                        onDeleteMessage={(id) => setMessagesMap(prev => ({ ...prev, [activeChannelId]: prev[activeChannelId].filter(m => m.id !== id) }))}
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
              activeDMUser && <UserProfileSidebar user={activeDMUser as User} onCall={() => startCall(activeChannelId || '', false)} onVideoCall={() => startCall(activeChannelId || '', true)} />
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
                channelName={activeChannel?.name}
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
                onToggleScreenShare={toggleScreenShare} 
                onDisconnect={stopCall}
                onOpenSettings={() => setModalType('DEVICE_SETTINGS')}
                onMinimize={() => setIsVoiceMinimized(true)}
              />
            )
          )}
        </div>
      </div>

      <ModalManager 
        isOpen={!!modalType}
        type={modalType}
        onClose={() => setModalType(null)}
        onSubmit={handleModalSubmit}
        currentUser={currentUser}
        activeServer={activeServer}
        targetData={modalData}
      />
    </div>
  );
};

export default App;
