import React, { useState, useRef, useEffect } from 'react';
import { Plus, Hash, Smile, Gift, Box, MoreVertical, Reply, Trash2, X, Image as ImageIcon, Send, Mic, Square, Play, Pause, Edit3 } from 'lucide-react';
import { Channel, Message, User, Server } from '../types';
import { fileToBase64, getUserRoleColor } from '../utils/helpers';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  members: User[];
  onSendMessage: (content: string, replyId?: string, attachment?: any) => void;
  onDeleteMessage: (messageId: string) => void;
  onUpdateMessage?: (messageId: string, content: string) => void;
  currentUser: User;
  typingUsers?: string[];
  activeServer?: Server;
}

const VoicePlayer: React.FC<{ url: string }> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.addEventListener('timeupdate', () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });
    
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [url]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 bg-v2 p-3 rounded-2xl w-full max-w-[240px] border border-v shadow-sm">
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-md shrink-0"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-1.5 w-full bg-v3 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-400 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center text-[9px] font-black text-v-muted uppercase tracking-tighter">
          <span>{isPlaying ? 'Odtwarzanie' : 'Wiadomość głosowa'}</span>
          <span>{audioRef.current ? Math.floor(audioRef.current.duration || 0) + 's' : '...'}</span>
        </div>
      </div>
    </div>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({ channel, messages, members, onSendMessage, onDeleteMessage, onUpdateMessage, currentUser, typingUsers = [], activeServer }) => {
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingUsers]);

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

  return (
    <div className="flex-1 flex flex-col h-full bg-v0 transition-all duration-200">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <Box size={60} />
            <p className="mt-4 font-black uppercase tracking-widest text-xs text-center">Początek historii kanału #{channel.name}</p>
          </div>
        )}
        {messages.map((msg) => {
          const sender = members.find(m => m.id === msg.senderId) || { username: 'Nieznany', avatar: 'https://picsum.photos/100' } as User;
          const roleColor = getUserRoleColor(sender as User, activeServer);
          const replyMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
          const isDeleted = msg.isDeleted;
          const isEditing = editingMessageId === msg.id;

          return (
            <div key={msg.id} className={`group flex flex-col ${isDeleted ? 'opacity-40' : ''}`}>
              {replyMsg && (
                <div className="flex items-center gap-2 ml-14 mb-1 text-[11px] text-v-muted italic">
                    <Reply size={12} />
                    <span 
                      className="font-bold"
                      style={{ color: getUserRoleColor(members.find(m => m.id === replyMsg.senderId) as User, activeServer) || 'inherit' }}
                    >
                      @{members.find(m => m.id === replyMsg.senderId)?.username}
                    </span>
                    <span className="truncate max-w-[200px]">{replyMsg.content}</span>
                </div>
              )}
              <div className="flex gap-4 group-hover:bg-white/[0.02] p-2 rounded-xl transition-all relative">
                <img src={sender.avatar} className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span 
                      className="font-black text-[13px] tracking-tight"
                      style={{ color: roleColor || 'var(--text-main)' }}
                    >
                      {sender.username}
                    </span>
                    <span className="text-[10px] text-v-muted font-bold opacity-40 uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="mt-1 space-y-1">
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
                        <p className="text-sm italic text-v-muted">{msg.content}</p>
                      ) : (
                        <>
                          <div className="flex items-end gap-2 flex-wrap">
                             {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap inline">{msg.content}</p>}
                             {msg.isEdited && <span className="text-[9px] text-v-muted font-bold opacity-40 uppercase tracking-tighter mb-0.5">(edytowano)</span>}
                          </div>
                          {msg.attachment?.type === 'IMAGE' && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-v max-w-sm">
                              <img src={msg.attachment.url} className="w-full h-auto" />
                            </div>
                          )}
                          {msg.attachment?.type === 'GIF' && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-v max-w-sm">
                              <img src={msg.attachment.url} className="w-full h-auto" />
                            </div>
                          )}
                          {msg.attachment?.type === 'AUDIO' && (
                            <div className="mt-3">
                              <VoicePlayer url={msg.attachment.url} />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
                
                {!isDeleted && !isEditing && (
                  <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-v2 p-1 rounded-lg border border-v shadow-xl transition-all">
                    <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-white/5 rounded text-v-muted hover:text-white" title="Odpowiedz"><Reply size={16}/></button>
                    {msg.senderId === currentUser.id && (
                      <>
                        <button onClick={() => startEditing(msg)} className="p-1.5 hover:bg-white/5 rounded text-v-muted hover:text-white" title="Edytuj"><Edit3 size={16}/></button>
                        <button onClick={() => onDeleteMessage(msg.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-v-muted hover:text-rose-500" title="Usuń"><Trash2 size={16}/></button>
                      </>
                    )}
                    <button className="p-1.5 hover:bg-white/5 rounded text-v-muted hover:text-white"><MoreVertical size={16}/></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-v0/50 backdrop-blur-md shrink-0 relative">
        <div className={`absolute -top-4 left-8 h-8 flex items-center gap-2 transition-opacity duration-300 ${typingUsers.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex gap-1 items-center bg-v1 px-3 py-1 rounded-full border border-v shadow-sm">
                <div className="flex gap-0.5">
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-v-muted uppercase tracking-widest">
                    {typingUsers.join(', ')} pisze...
                </span>
            </div>
        </div>

        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-2 bg-v2 border-x border-t border-v rounded-t-xl text-xs">
            <div className="flex items-center gap-2 text-v-muted">
              <Reply size={14} /> Odpowiadasz użytkownikowi <span className="font-black text-white">{members.find(m=>m.id===replyingTo.senderId)?.username}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-v-muted hover:text-rose-500"><X size={14}/></button>
          </div>
        )}
        
        <div className={`relative bg-v1 border border-v flex items-center p-2 gap-2 shadow-2xl transition-all ${replyingTo ? 'rounded-b-2xl' : 'rounded-2xl'} ${isRecording ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}>
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
                placeholder={`Wiadomość na kanale #${channel.name}`}
                className="flex-1 bg-transparent border-none outline-none p-2 text-sm font-medium"
              />

              <div className="flex items-center gap-1">
                <button onClick={() => setShowGifPicker(!showGifPicker)} className="p-2 text-v-muted hover:text-white hover:bg-v2 rounded-xl transition-all" title="GIFy Tenor">
                  <Gift size={20} />
                </button>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-v-muted hover:text-white hover:bg-v2 rounded-xl transition-all">
                  <Smile size={20} />
                </button>
                <button 
                  onClick={startRecording} 
                  className="p-2 text-v-muted hover:text-indigo-400 hover:bg-v2 rounded-xl transition-all" 
                  title="Wiadomość głosowa"
                >
                  <Mic size={20} />
                </button>
                <button onClick={handleSend} className={`p-2 rounded-xl transition-all ${inputValue.trim() ? 'bg-cordis-accent text-white shadow-lg' : 'text-v-muted'}`}>
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-between px-4 py-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Nagrywanie: {recordTime}s</span>
                </div>
                <div className="flex gap-0.5 items-end h-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 bg-indigo-500 rounded-full animate-[pulse_1s_infinite]" style={{ height: Math.random() * 100 + '%', animationDelay: i * 0.1 + 's' }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIsRecording(false); if(timerRef.current) clearInterval(timerRef.current); }} className="text-[10px] font-black uppercase text-v-muted hover:text-white px-2">Anuluj</button>
                <button onClick={stopRecording} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-500 shadow-lg">
                  <Square size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          )}

          {showGifPicker && (
            <div className="absolute bottom-20 right-0 w-72 bg-v2 border border-v rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-v-muted">Trending Tenor GIFs</span>
                <X size={16} className="cursor-pointer" onClick={() => setShowGifPicker(false)} />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar">
                {MOCK_GIFS.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 ring-indigo-500" 
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
            <div className="absolute bottom-20 right-0 bg-v2 border border-v rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5">
              <div className="grid grid-cols-6 gap-2">
                {['😀','😂','🔥','❤️','🚀','✨','👍','🎉','💯','🎮','💻','🤖'].map(e => (
                   <button key={e} onClick={() => { setInputValue(prev => prev + e); setShowEmojiPicker(false); }} className="text-2xl hover:bg-white/5 p-2 rounded-lg">{e}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
