
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Bell, Users, Settings, MessageSquare, Search, UserPlus, Phone, Video as VideoIcon } from 'lucide-react';
import { ServerList } from './components/ServerList';
import { ChannelList } from './components/ChannelList';
import { ChatArea } from './components/ChatArea';
import { UserList } from './components/UserList';
import { VideoGrid } from './components/VideoGrid';
import { MiniPlayer } from './components/MiniPlayer';
import { ModalManager } from './components/Modals';
import { UserProfileSidebar } from './components/UserProfileSidebar';
import { Server, Message, User, ChannelType, ModalType, UserStatus, Channel } from './types';
import { INITIAL_SERVERS, MOCK_USER, GEMINI_BOT, DEFAULT_ROLES } from './constants';
import { generateAIResponse } from './services/geminiService';

const SOUNDS = {
  JOIN: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  LEAVE: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  MUTE: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  UNMUTE: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3'
};

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

  const [manualStatus, setManualStatus] = useState<UserStatus>(MOCK_USER.status);

  const playSystemSound = useCallback((soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  const handleStatusChange = useCallback((status: UserStatus) => {
    setManualStatus(status);
  }, []);

  useEffect(() => {
    const targetStatus = activeVoiceChannelId ? UserStatus.IN_CALL : manualStatus;
    if (currentUser.status !== targetStatus) {
      setCurrentUser(prev => ({ ...prev, status: targetStatus }));
    }
  }, [activeVoiceChannelId, manualStatus]);

  const handleToggleMic = useCallback(() => {
    setIsMicMuted(prev => {
      const newState = !prev;
      playSystemSound(newState ? SOUNDS.MUTE : SOUNDS.UNMUTE);
      return newState;
    });
  }, [playSystemSound]);

  const handleToggleDeafen = useCallback(() => {
    setIsDeafened(prev => {
      const newState = !prev;
      playSystemSound(newState ? SOUNDS.MUTE : SOUNDS.UNMUTE);
      return newState;
    });
  }, [playSystemSound]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentUser.settings.theme);
  }, [currentUser.settings.theme]);

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

  const activeChannelObj = activeServerId === 'DM' 
    ? { id: activeChannelId, name: dmChannels.find(d => d.id === activeChannelId)?.name || 'Czat', type: ChannelType.TEXT, categoryId: 'dm' }
    : activeServer?.categories?.flatMap(c => c.channels || [])?.find(c => c.id === activeChannelId);

  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!activeChannelId) return;
    const newMessage: Message = { id: Math.random().toString(36).substr(2, 9), content, senderId: currentUser.id, timestamp: new Date(), replyToId };
    setMessagesMap(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), newMessage] }));

    if (activeChannelId.includes('gemini') || content.toLowerCase().includes('gemini')) {
      setTypingUsers([GEMINI_BOT.username]);
      const response = await generateAIResponse(content);
      setTimeout(() => {
        setTypingUsers([]);
        const aiMsg: Message = { id: Date.now().toString(), content: response, senderId: GEMINI_BOT.id, timestamp: new Date(), replyToId: newMessage.id };
        setMessagesMap(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), aiMsg] }));
      }, 1500);
    }
  };

  const handleUpdateMessage = (messageId: string, content: string) => {
    if (!activeChannelId) return;
    setMessagesMap(prev => ({
        ...prev,
        [activeChannelId]: prev[activeChannelId].map(msg => 
            msg.id === messageId ? { ...msg, content, isEdited: true } : msg
        )
    }));
  };

  const startCall = async (channelId: string, isVideo: boolean = false) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo || isCameraOn });
        setLocalStream(stream);
        setIsCameraOn(isVideo || isCameraOn);
        setActiveVoiceChannelId(channelId);
        setIsVoiceMinimized(false);
        playSystemSound(SOUNDS.JOIN);
    } catch (err) { console.error("Call error:", err); }
  };

  const stopCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
    }
    setLocalStream(null);
    setScreenStream(null);
    setActiveVoiceChannelId(null);
    setIsVoiceMinimized(false);
    playSystemSound(SOUNDS.LEAVE);
  }, [localStream, screenStream, playSystemSound]);

  const handleToggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        // Handle stop sharing from browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
        };
        setScreenStream(stream);
      } catch (err) {
        console.error("Screen share initiation failed:", err);
      }
    }
  };

  const handleReorder = (type: 'CATEGORY' | 'CHANNEL', sourceId: string, targetId: string, categoryId?: string) => {
    if (!activeServerId || activeServerId === 'DM') return;
    
    setServers(prev => prev.map(s => {
        if (s.id !== activeServerId) return s;

        if (type === 'CATEGORY') {
            const categories = [...s.categories];
            const srcIdx = categories.findIndex(c => c.id === sourceId);
            const tgtIdx = categories.findIndex(c => c.id === targetId);
            if (srcIdx > -1 && tgtIdx > -1) {
                const [removed] = categories.splice(srcIdx, 1);
                categories.splice(tgtIdx, 0, removed);
            }
            return { ...s, categories };
        } else if (type === 'CHANNEL' && categoryId) {
            const categories = s.categories.map(cat => {
                if (cat.id !== categoryId) return cat;
                const channels = [...cat.channels];
                const srcIdx = channels.findIndex(c => c.id === sourceId);
                const tgtIdx = channels.findIndex(c => c.id === targetId);
                 if (srcIdx > -1 && tgtIdx > -1) {
                    const [removed] = channels.splice(srcIdx, 1);
                    channels.splice(tgtIdx, 0, removed);
                }
                return { ...cat, channels };
            });
            return { ...s, categories };
        }
        return s;
    }));
  };

  return (
    <div className="flex flex-col w-full h-screen bg-v0 text-v-main overflow-hidden font-sans">
      <ServerList servers={servers} activeServerId={activeServerId} onSwitchServer={(id) => { setActiveServerId(id); setActiveChannelId(null); }} onAddServer={() => setModalType('CREATE_SERVER')} />
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[280px] flex flex-col bg-v1 border-r border-v shrink-0">
          <ChannelList 
            activeServer={activeServerId === 'DM' ? undefined : activeServer} 
            activeChannelId={activeChannelId} 
            activeVoiceChannelId={activeVoiceChannelId} 
            currentUser={currentUser}
            onSelectChannel={(id) => {
                if (activeServerId === 'DM') {
                  setActiveChannelId(id);
                } else {
                  const ch = activeServer?.categories?.flatMap(c => c.channels || []).find(c => c.id === id);
                  if (ch?.type === ChannelType.VOICE) startCall(id);
                  else setActiveChannelId(id);
                }
            }}
            onOpenSettings={(t, d) => { setModalType(t); setModalData(d); }}
            onStatusChange={handleStatusChange} 
            onToggleMic={handleToggleMic} 
            onToggleDeafen={handleToggleDeafen}
            onCreateChannel={(catId) => { setModalType('CREATE_CHANNEL'); setModalData(catId); }}
            onReorder={handleReorder}
            isMicMuted={isMicMuted} isDeafened={isDeafened} localStream={localStream}
            isDMView={activeServerId === 'DM'}
            dmChannels={dmChannels}
          />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-v0">
          <header className="h-[64px] border-b border-v flex items-center justify-between px-8 shrink-0 bg-v0/80 backdrop-blur-md z-10">
            <h1 className="text-lg font-black tracking-tight">{(activeChannelObj as any)?.name || 'Wybierz kanał'}</h1>
          </header>
          
          <main className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                {activeChannelId ? (
                    <ChatArea 
                        channel={activeChannelObj as any} messages={messagesMap[activeChannelId] || []}
                        members={activeServer?.members || [currentUser, GEMINI_BOT]}
                        onSendMessage={handleSendMessage} 
                        onDeleteMessage={(id) => setMessagesMap(prev => ({ ...prev, [activeChannelId]: prev[activeChannelId].filter(m => m.id !== id) }))}
                        onUpdateMessage={handleUpdateMessage}
                        currentUser={currentUser} typingUsers={typingUsers} activeServer={activeServer}
                    />
                ) : ( <div className="flex-1 flex items-center justify-center opacity-10"><Sparkles size={100} /></div> )}
            </div>
            {activeServerId !== 'DM' && (
              <aside className="w-[280px] border-l border-v bg-v1 shrink-0 hidden xl:block">
                <UserList members={activeServer?.members || []} server={activeServer} onUserAction={(u, a) => { if(a==='MESSAGE') { setActiveServerId('DM'); setActiveChannelId(`dm-${u.id}`); }}} />
              </aside>
            )}
          </main>

          {activeVoiceChannelId && !isVoiceMinimized && (
            <VideoGrid 
              localStream={localStream} 
              screenStream={screenStream} 
              isMicMuted={isMicMuted} 
              isDeafened={isDeafened} 
              isCameraOn={isCameraOn}
              onToggleMic={handleToggleMic} 
              onToggleDeafen={handleToggleDeafen} 
              onToggleCamera={() => setIsCameraOn(!isCameraOn)}
              onToggleScreenShare={handleToggleScreenShare} 
              onDisconnect={stopCall} 
              onOpenSettings={() => setModalType('DEVICE_SETTINGS')} 
              onMinimize={() => setIsVoiceMinimized(true)}
            />
          )}

          {activeVoiceChannelId && isVoiceMinimized && (
            <MiniPlayer 
                stream={localStream} 
                channelName={(activeServer?.categories.flatMap(c => c.channels).find(ch => ch.id === activeVoiceChannelId)?.name) || "Rozmowa"}
                isMicMuted={isMicMuted} 
                isDeafened={isDeafened}
                onExpand={() => setIsVoiceMinimized(false)}
                onDisconnect={stopCall}
                onToggleMic={handleToggleMic}
                onToggleDeafen={handleToggleDeafen}
            />
          )}
        </div>
      </div>
      
      <ModalManager 
        isOpen={!!modalType} 
        type={modalType} 
        onClose={() => setModalType(null)} 
        onSubmit={(d) => { 
            if (modalType === 'SETTINGS') setCurrentUser(prev => ({ ...prev, ...d })); 
            if (modalType === 'CREATE_SERVER') setServers(prev => [...prev, { ...d, id: 's'+Date.now(), members: [currentUser], ownerId: currentUser.id, roles: DEFAULT_ROLES, categories: [] }]);
            
            // Obsługa tworzenia kategorii
            if (modalType === 'CREATE_CATEGORY' && activeServerId !== 'DM') {
                setServers(prev => prev.map(s => {
                    if (s.id === activeServerId) {
                        return {
                            ...s,
                            categories: [...s.categories, { id: 'c' + Date.now(), name: d.name, channels: [] }]
                        };
                    }
                    return s;
                }));
            }

            // Obsługa edycji kategorii
            if (modalType === 'EDIT_CATEGORY' && activeServerId !== 'DM') {
                setServers(prev => prev.map(s => {
                    if (s.id === activeServerId) {
                        if (d._action === 'DELETE') {
                            return { ...s, categories: s.categories.filter(c => c.id !== d.id) };
                        }
                        return {
                            ...s,
                            categories: s.categories.map(c => c.id === d.id ? { ...c, name: d.name } : c)
                        };
                    }
                    return s;
                }));
            }

            // Obsługa tworzenia kanału
            if (modalType === 'CREATE_CHANNEL' && activeServerId !== 'DM') {
                setServers(prev => prev.map(s => {
                    if (s.id === activeServerId) {
                        return {
                            ...s,
                            categories: s.categories.map(cat => {
                                if (cat.id === d.categoryId) {
                                    return {
                                        ...cat,
                                        channels: [...cat.channels, {
                                            id: 'ch' + Date.now(),
                                            name: d.name,
                                            type: d.type,
                                            categoryId: d.categoryId,
                                            messages: [],
                                            connectedUserIds: [],
                                            isPrivate: d.isPrivate,
                                            allowedRoleIds: d.allowedRoleIds || [],
                                            userLimit: d.type === ChannelType.VOICE ? 0 : undefined
                                        }]
                                    };
                                }
                                return cat;
                            })
                        };
                    }
                    return s;
                }));
            }

            // Obsługa edycji kanału
            if (modalType === 'EDIT_CHANNEL' && activeServerId !== 'DM') {
                setServers(prev => prev.map(s => {
                    if (s.id === activeServerId) {
                        return {
                            ...s,
                            categories: s.categories.map(cat => {
                                if (cat.id === d.categoryId) {
                                    if (d._action === 'DELETE') {
                                        return { ...cat, channels: cat.channels.filter(ch => ch.id !== d.id) };
                                    }
                                    return {
                                        ...cat,
                                        channels: cat.channels.map(ch => ch.id === d.id ? { ...ch, ...d } : ch)
                                    };
                                }
                                return cat;
                            })
                        };
                    }
                    return s;
                }));
                // Jeśli usunięto aktywny kanał, zresetuj widok
                if (d._action === 'DELETE' && activeChannelId === d.id) {
                    setActiveChannelId(null);
                }
            }
            
            // Obsługa edycji serwera
            if (modalType === 'SERVER_SETTINGS' && activeServerId !== 'DM' && d.id) {
                 setServers(prev => prev.map(s => s.id === d.id ? d : s));
                 if (d._action === 'DELETE_SERVER') {
                     setServers(prev => prev.filter(s => s.id !== d.id));
                     setActiveServerId('DM');
                 }
            }

            setModalType(null); 
        }} 
        currentUser={currentUser} activeServer={activeServer} targetData={modalData} 
      />
    </div>
  );
};

export default App;
