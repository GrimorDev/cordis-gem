
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Hash, Smile, Gift, Box, MoreVertical, Reply, Trash2, X, Image as ImageIcon, Send, Mic, Square, Play, Pause, Edit3, ExternalLink, Globe, SmilePlus, ZoomIn } from 'lucide-react';
import { Channel, Message, User, Server } from '../types';
import { fileToBase64, getUserRoleColor } from '../utils/helpers';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  members: User[];
  onSendMessage: (content: string, replyId?: string, attachment?: any) => void;
  onDeleteMessage: (messageId: string) => void;
  onUpdateMessage?: (messageId: string, content: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  currentUser: User;
  typingUsers?: string[];
  activeServer?: Server;
}

const extractFirstUrl = (text: string): string | null => {
  if (!text) return null;
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
};

const LinkPreview: React.FC<{ url: string }> = ({ url }) => {
  const [domain, setDomain] = useState('');
  const [isYoutube, setIsYoutube] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const urlObj = new URL(url);
      setDomain(urlObj.hostname);
      
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        setIsYoutube(true);
        const vParam = urlObj.searchParams.get('v');
        if (vParam) setYoutubeId(vParam);
        else if (urlObj.hostname.includes('youtu.be')) setYoutubeId(urlObj.pathname.slice(1));
      } else {
        setIsYoutube(false);
      }
    } catch (e) {
      setDomain(url);
    }
  }, [url]);

  return (
    <div className="mt-2 flex flex-col max-w-[400px] bg-[#1e1f22] border-l-4 border-indigo-500 rounded-r-md overflow-hidden shadow-sm animate-scale-in">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isYoutube ? 'YouTube' : 'Website'}</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-400 hover:underline block mb-1 truncate text-sm">
          {isYoutube ? 'Wideo na YouTube' : domain}
        </a>
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {isYoutube ? 'Kliknij, aby obejrzeć ten materiał wideo w nowej karcie.' : `Odwiedź stronę ${url} aby zobaczyć więcej informacji.`}
        </p>
        
        {isYoutube && youtubeId && (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/5 bg-black">
             <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                   <Play size={20} fill="white" className="text-white ml-1" />
                </div>
             </div>
          </div>
        )}
        
        {!isYoutube && (
           <div className="flex items-center gap-2 p-2 bg-[#2b2d31] rounded-lg border border-white/5">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                 <Globe size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{domain}</div>
                  <div className="text-[10px] text-slate-500 truncate">{url}</div>
              </div>
              <ExternalLink size={14} className="text-slate-500" />
           </div>
        )}
      </div>
    </div>
  );
};

const VoicePlayer: React.FC<{ url: string }> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    
    const updateTime = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const handleLoadedMetadata = () => {
        if (isFinite(audio.duration)) {
            setDuration(audio.duration);
        }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current = null;
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      document.querySelectorAll('audio').forEach(el => el !== audioRef.current && el.pause());
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-v2 p-3 rounded-2xl w-full max-w-[280px] border border-v shadow-sm animate-fade-in">
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-md shrink-0"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="h-1.5 w-full bg-v3 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
            if(!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percentage = x / width;
            audioRef.current.currentTime = percentage * audioRef.current.duration;
        }}>
          <div className="h-full bg-indigo-400 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center text-[9px] font-black text-v-muted uppercase tracking-tighter">
          <span>{isPlaying ? formatTime(audioRef.current?.currentTime || 0) : 'Wiadomość głosowa'}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>
    </div>
  );
};

const ImageModal: React.FC<{ url: string, onClose: () => void }> = ({ url, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <X size={32} />
            </button>
            <img 
                src={url} 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in" 
                onClick={(e) => e.stopPropagation()} 
            />
        </div>
    );
};

export const ChatArea: React.FC<ChatAreaProps> = ({ channel, messages, members, onSendMessage, onDeleteMessage, onUpdateMessage, onAddReaction, currentUser, typingUsers = [], activeServer }) => {
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingUsers, channel.id]);

  const handleSend = () => {
    if (inputValue.trim() || replyingTo) {
      onSendMessage(inputValue, replyingTo?.id);
      setInputValue('');
      setReplyingTo(null);
    }
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditValue(msg.content);
  };

  const handleEditSave = () => {
    if (editingMessageId && editValue.trim()) {
      onUpdateMessage?.(editingMessageId, editValue);
      setEditingMessageId(null);
      setEditValue('');
    } else if (editingMessageId && !editValue.trim()) {
        setEditingMessageId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditValue('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onSendMessage('', replyingTo?.id, { type: 'IMAGE', url: base64 });
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage('', replyingTo?.id, { type: 'AUDIO', url: base64Audio });
        };
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Błąd mikrofonu: ' + err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const MOCK_GIFS = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4d25yeXJ5eXJ5eXJ5eXJ5eXJ5eXJ5eXJ5eXJ5JnBvcz1jJm89Zw/3o7TKMGpxr9L5H3Dzy/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4d25yeXJ5eXJ5eXJ5eXJ5eXJ5eXJ5eXJ5eXJ5JnBvcz1jJm89Zw/LXIyDxlv3733V00r4K/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZzZ4d25yeXJ5eXJ5eXJ5eXJ5eXJ5eXJ5eXJ5eXJ5JnBvcz1jJm89Zw/sSgv3S9oR1xRG/giphy.gif'
  ];

  const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  return (
    <div className="flex-1 flex flex-col h-full bg-v0 page-transition">
      {enlargedImage && <ImageModal url={enlargedImage} onClose={() => setEnlargedImage(null)} />}
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 animate-fade-in">
            <Box size={60} />
            <p className="mt-4 font-black uppercase tracking-widest text-xs text-center">Początek historii kanału #{channel?.name || 'Unknown'}</p>
          </div>
        )}
        {messages.map((msg) => {
          const sender = members.find(m => m.id === msg.senderId) || { username: 'Nieznany', avatar: 'https://picsum.photos/100' } as User;
          const roleColor = getUserRoleColor(sender as User, activeServer);
          const replyMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
          const isDeleted = msg.isDeleted;
          const isEditing = editingMessageId === msg.id;
          const linkPreviewUrl = !isDeleted && !isEditing ? extractFirstUrl(msg.content) : null;

          return (
            <div key={msg.id} className="group flex flex-col animate-slide-in-up">
              {replyMsg && (
                <div className="flex items-center gap-2 ml-14 mb-1 text-[11px] text-v-muted italic animate-fade-in">
                    <Reply size={12} className="shrink-0" />
                    <span 
                      className="font-bold shrink-0"
                      style={{ color: getUserRoleColor(members.find(m => m.id === replyMsg.senderId) as User, activeServer) || 'inherit' }}
                    >
                      @{members.find(m => m.id === replyMsg.senderId)?.username}
                    </span>
                    <span className="truncate max-w-[200px] opacity-70">{replyMsg.content}</span>
                </div>
              )}
              <div className="flex gap-4 group-hover:bg-white/[0.03] p-2 rounded-xl transition-all relative">
                <img src={sender.avatar} className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/5 transition-transform group-hover:scale-105" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span 
                      className="font-black text-[13px] tracking-tight hover:underline cursor-pointer"
                      style={{ color: roleColor || 'var(--text-main)' }}
                    >
                      {sender.username}
                    </span>
                    <span className="text-[10px] text-v-muted font-bold opacity-40 uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="mt-1 space-y-1 animate-scale-in">
                      <div className="bg-v1 border border-v rounded-xl p-3 focus-within:border-indigo-500 transition-all shadow-inner">
                        <textarea
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEditSave();
                            } else if (e.key === 'Escape') {
                              handleEditCancel();
                            }
                          }}
                          className="w-full bg-transparent border-none outline-none text-sm font-medium resize-none min-h-[40px]"
                        />
                      </div>
                      <div className="flex gap-2 items-center text-[9px] font-black uppercase tracking-widest text-v-muted">
                        <span>ESC by <span className="text-rose-500">anulować</span></span>
                        <span className="opacity-20">•</span>
                        <span>ENTER by <span className="text-emerald-500">zapisać</span></span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isDeleted ? (
                        <p className="text-sm italic text-v-muted opacity-50">{msg.content}</p>
                      ) : (
                        <>
                          <div className="flex flex-col gap-2">
                             {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                             {msg.isEdited && <span className="text-[9px] text-v-muted font-bold opacity-40 uppercase tracking-tighter mb-0.5">(edytowano)</span>}
                             
                             {linkPreviewUrl && !msg.attachment && (
                                <LinkPreview url={linkPreviewUrl} />
                             )}
                          </div>

                          {msg.attachment?.type === 'IMAGE' && (
                            <div className="mt-3 relative group/img inline-block max-w-sm animate-scale-in">
                              <img 
                                src={msg.attachment.url} 
                                className="w-full h-auto rounded-2xl border border-v cursor-zoom-in shadow-xl hover:shadow-indigo-500/10 transition-shadow" 
                                onClick={() => setEnlargedImage(msg.attachment?.url || null)}
                              />
                            </div>
                          )}
                          {msg.attachment?.type === 'GIF' && (
                            <div className="mt-3 relative inline-block max-w-sm animate-scale-in">
                              <img src={msg.attachment.url} className="w-full h-auto rounded-2xl border border-v shadow-xl" />
                            </div>
                          )}
                          {msg.attachment?.type === 'AUDIO' && (
                            <div className="mt-3">
                              <VoicePlayer url={msg.attachment.url} />
                            </div>
                          )}

                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                             <div className="flex flex-wrap gap-1 mt-2 animate-fade-in">
                                 {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                                     const users = userIds as string[];
                                     const meReacted = users.includes(currentUser.id);
                                     return (
                                         <button 
                                            key={emoji} 
                                            onClick={() => onAddReaction?.(msg.id, emoji)}
                                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-bold transition-all active:scale-90 ${
                                                meReacted 
                                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200' 
                                                : 'bg-[#1e1f22] border-transparent hover:border-white/10 text-slate-400 hover:text-white'
                                            }`}
                                         >
                                             <span>{emoji}</span>
                                             <span className="text-[10px] opacity-70">{users.length}</span>
                                         </button>
                                     );
                                 })}
                             </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
                
                {!isDeleted && !isEditing && (
                  <div className="absolute right-4 -top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-v2 p-1 rounded-lg border border-v shadow-xl transition-all z-10 scale-95 group-hover:scale-100">
                    <div className="relative group/emojis">
                        <button className="p-1.5 hover:bg-white/5 rounded text-v-muted hover:text-amber-400 transition-colors" title="Dodaj reakcję">
                            <SmilePlus size={16}/>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 hidden group-hover/emojis:flex gap-1 animate-scale-in origin-bottom">
                             <div className="flex gap-1 bg-v2 border border-v p-1.5 rounded-xl shadow-2xl">
                                {QUICK_REACTIONS.map(emoji => (
                                    <button 
                                        key={emoji} 
                                        onClick={() => onAddReaction?.(msg.id, emoji)}
                                        className="p-1 hover:bg-white/10 rounded text-lg hover:scale-125 transition-transform"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-white/5 rounded text-v-muted hover:text-white transition-colors" title="Odpowiedz"><Reply size={16}/></button>
                    {msg.senderId === currentUser.id && (
                      <>
                        <button onClick={() => startEditing(msg)} className="p-1.5 hover:bg-white/5 rounded text-v-muted hover:text-white transition-colors" title="Edytuj"><Edit3 size={16}/></button>
                        <button onClick={() => onDeleteMessage(msg.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-v-muted hover:text-rose-500 transition-colors" title="Usuń"><Trash2 size={16}/></button>
                      </>
                    )}
                    <button className="p-1.5 hover:bg-white/5 rounded text-v-muted hover:text-white transition-colors"><MoreVertical size={16}/></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-v0/50 backdrop-blur-md shrink-0 relative">
        <div className={`absolute -top-4 left-8 h-8 flex items-center gap-2 transition-all duration-300 ${typingUsers.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="flex gap-1.5 items-center bg-v1 px-3 py-1 rounded-full border border-v shadow-sm">
                <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-typing" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-typing [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-typing [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-v-muted uppercase tracking-widest">
                    {typingUsers.join(', ')} pisze...
                </span>
            </div>
        </div>

        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-2 bg-v2 border-x border-t border-v rounded-t-xl text-xs animate-slide-in-up">
            <div className="flex items-center gap-2 text-v-muted">
              <Reply size={14} /> Odpowiadasz użytkownikowi <span className="font-black text-white">{members.find(m=>m.id===replyingTo.senderId)?.username}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-v-muted hover:text-rose-500 transition-colors"><X size={14}/></button>
          </div>
        )}
        
        <div className={`relative bg-v1 border border-v flex items-center p-2 gap-2 shadow-2xl transition-all duration-300 ${replyingTo ? 'rounded-b-2xl border-t-0' : 'rounded-2xl'} ${isRecording ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5'}`}>
          {!isRecording ? (
            <>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-v-muted hover:text-white hover:bg-v2 rounded-xl transition-all">
                <Plus size={20} />
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
              </button>
              
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Wiadomość na kanale #${channel?.name || 'Unknown'}`}
                className="flex-1 bg-transparent border-none outline-none p-2 text-sm font-medium"
              />

              <div className="flex items-center gap-1">
                <button onClick={() => setShowGifPicker(!showGifPicker)} className={`p-2 rounded-xl transition-all ${showGifPicker ? 'bg-indigo-600/20 text-indigo-400' : 'text-v-muted hover:text-white hover:bg-v2'}`} title="GIFy Tenor">
                  <Gift size={20} />
                </button>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-indigo-600/20 text-indigo-400' : 'text-v-muted hover:text-white hover:bg-v2'}`}>
                  <Smile size={20} />
                </button>
                <button 
                  onClick={startRecording} 
                  className="p-2 text-v-muted hover:text-indigo-400 hover:bg-v2 rounded-xl transition-all" 
                  title="Wiadomość głosowa"
                >
                  <Mic size={20} />
                </button>
                <button 
                  onClick={handleSend} 
                  className={`p-2 rounded-xl transition-all transform active:scale-95 ${inputValue.trim() || replyingTo ? 'bg-indigo-600 text-white shadow-lg' : 'text-v-muted opacity-50'}`}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-between px-4 py-1 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Nagrywanie: {recordTime}s</span>
                </div>
                <div className="flex gap-1 items-end h-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1 bg-indigo-500 rounded-full transition-all duration-300" style={{ height: Math.max(15, Math.random() * 100) + '%', opacity: 0.3 + (Math.random() * 0.7) }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIsRecording(false); if(timerRef.current) clearInterval(timerRef.current); }} className="text-[10px] font-black uppercase text-v-muted hover:text-white px-2 transition-colors">Anuluj</button>
                <button onClick={stopRecording} className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-500 shadow-lg transform active:scale-90 transition-all">
                  <Square size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          )}

          {showGifPicker && (
            <div className="absolute bottom-20 right-0 w-72 bg-v2 border border-v rounded-2xl shadow-2xl p-4 z-50 animate-scale-in origin-bottom-right">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-v-muted">Trending Tenor GIFs</span>
                <X size={16} className="cursor-pointer hover:text-white transition-colors" onClick={() => setShowGifPicker(false)} />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar">
                {MOCK_GIFS.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 ring-indigo-500 transition-all transform hover:scale-[1.02]" 
                    onClick={() => {
                        onSendMessage('', replyingTo?.id, { type: 'GIF', url });
                        setShowGifPicker(false);
                        setReplyingTo(null);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {showEmojiPicker && (
            <div className="absolute bottom-20 right-0 bg-v2 border border-v rounded-2xl shadow-2xl p-4 z-50 animate-scale-in origin-bottom-right">
              <div className="grid grid-cols-6 gap-2">
                {['😀','😂','🔥','❤️','🚀','✨','👍','🎉','💯','🎮','💻','🤖','🍕','🌈','⭐','🍀','⚡','🛸'].map(e => (
                   <button key={e} onClick={() => { setInputValue(prev => prev + e); setShowEmojiPicker(false); }} className="text-2xl hover:bg-white/5 p-2 rounded-lg transition-transform hover:scale-110">{e}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
