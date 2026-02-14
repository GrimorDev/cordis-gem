
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Shield, Users, Edit3, Plus, Check, ChevronRight, 
  Ban, UserMinus, Settings, Bell, Upload, Mic, Video, VideoOff,
  Lock, Eye, Palette, Monitor, LogOut, Trash2, Volume2, Globe, Speaker, Hash, Layers, Sliders, Trash, Search, ChevronLeft, AlertCircle, Play, Music, FolderPlus
} from 'lucide-react';
import { ModalType, ChannelType, User, Server, Theme, Language, Channel, Role, Permission } from '../types';
import { fileToBase64 } from '../utils/helpers';
import { useAudioLevel } from './VideoGrid';

interface ModalProps {
    isOpen: boolean;
    type: ModalType;
    onClose: () => void;
    onSubmit: (data: any) => void;
    currentUser?: User;
    activeServer?: Server;
    targetData?: any; 
}

const NavItem = ({ icon, label, active, onClick, danger }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, danger?: boolean }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all group ${
            active 
            ? 'bg-indigo-600/20 text-indigo-400' 
            : danger 
                ? 'text-rose-500 hover:bg-rose-500/10' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
    >
        <span className={`${active ? 'text-indigo-400' : danger ? 'text-rose-500' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
        <span className="font-bold text-[12px] tracking-tight">{label}</span>
    </button>
);

export const ModalManager: React.FC<ModalProps> = ({ isOpen, type, onClose, onSubmit, currentUser, activeServer, targetData }) => {
    if (!isOpen || !type) return null;
    const isLargeModal = ['SERVER_SETTINGS', 'SETTINGS', 'DEVICE_SETTINGS', 'EDIT_CHANNEL'].includes(type);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative bg-v1 border border-white/5 rounded-none md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isLargeModal ? 'w-full h-full md:h-[90vh] md:max-w-6xl' : 'max-w-md w-full mx-4'
            }`}>
                {type === 'SERVER_SETTINGS' && activeServer && <ServerSettingsModal onClose={onClose} onSubmit={onSubmit} server={activeServer} />}
                {type === 'SETTINGS' && currentUser && <UserSettingsModal onClose={onClose} currentUser={currentUser} onSubmit={onSubmit} />}
                {type === 'CREATE_SERVER' && <CreateServerModal onClose={onClose} onSubmit={onSubmit} />}
                {type === 'CREATE_CHANNEL' && <CreateChannelModal onClose={onClose} onSubmit={onSubmit} categoryId={targetData} />}
                {type === 'CREATE_CATEGORY' && <CreateCategoryModal onClose={onClose} onSubmit={onSubmit} />}
                {type === 'EDIT_CHANNEL' && targetData && <EditChannelModal onClose={onClose} onSubmit={onSubmit} channel={targetData} activeServer={activeServer} />}
                {type === 'DEVICE_SETTINGS' && <DeviceSettingsModal onClose={onClose} />}
            </div>
        </div>
    );
};

const CreateCategoryModal = ({ onClose, onSubmit }: any) => {
    const [name, setName] = useState('');
    return (
        <div className="p-8 bg-v1">
            <h2 className="text-2xl font-bold text-white mb-6">Utwórz Kategorię</h2>
            <div className="space-y-2 mb-8 text-left">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa kategorii</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none focus:ring-2 ring-indigo-500/20" 
                    placeholder="Nowa Kategoria" 
                    autoFocus
                />
            </div>
            <div className="flex justify-end items-center bg-v2 -mx-8 -mb-8 p-4 gap-4">
                <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Anuluj</button>
                <button 
                    onClick={() => name.trim() && onSubmit({ name })} 
                    className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all"
                >
                    Utwórz kategorię
                </button>
            </div>
        </div>
    );
};

const DeviceSettingsModal = ({ onClose }: { onClose: () => void }) => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedInput, setSelectedInput] = useState<string>('');
    const [selectedOutput, setSelectedOutput] = useState<string>('');
    const [selectedVideo, setSelectedVideo] = useState<string>('');
    const [testStream, setTestStream] = useState<MediaStream | null>(null);
    const [isTestingAudio, setIsTestingAudio] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioLevel = useAudioLevel(testStream, false);

    useEffect(() => {
        const getDevices = async () => {
            try {
                const allDevicesInitially = await navigator.mediaDevices.enumerateDevices();
                const hasMic = allDevicesInitially.some(d => d.kind === 'audioinput');
                const hasCam = allDevicesInitially.some(d => d.kind === 'videoinput');

                if (!hasMic && !hasCam) {
                    setError("Nie wykryto żadnego mikrofonu ani kamery.");
                    setDevices(allDevicesInitially);
                    return;
                }

                const initialConstraints: MediaStreamConstraints = {
                    audio: hasMic,
                    video: hasCam
                };

                await navigator.mediaDevices.getUserMedia(initialConstraints);
                const allDevicesWithLabels = await navigator.mediaDevices.enumerateDevices();
                setDevices(allDevicesWithLabels);
                
                const audioInput = allDevicesWithLabels.find(d => d.kind === 'audioinput');
                const audioOutput = allDevicesWithLabels.find(d => d.kind === 'audiooutput');
                const videoInput = allDevicesWithLabels.find(d => d.kind === 'videoinput');
                
                if (audioInput) setSelectedInput(audioInput.deviceId);
                if (audioOutput) setSelectedOutput(audioOutput.deviceId);
                if (videoInput) setSelectedVideo(videoInput.deviceId);
            } catch (err) {
                console.error("Device error:", err);
                setError("Nie udało się uzyskać uprawnień do urządzeń. Sprawdź ustawienia prywatności przeglądarki.");
            }
        };
        getDevices();
    }, []);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        const startTest = async () => {
            setError(null);
            if (testStream) {
                testStream.getTracks().forEach(t => t.stop());
            }

            if (!devices.some(d => d.kind === 'audioinput' || d.kind === 'videoinput')) return;

            try {
                const constraints: MediaStreamConstraints = {};
                const audioExists = devices.some(d => d.kind === 'audioinput' && d.deviceId === selectedInput);
                const videoExists = devices.some(d => d.kind === 'videoinput' && d.deviceId === selectedVideo);

                if (selectedInput && audioExists) {
                    constraints.audio = { deviceId: { ideal: selectedInput } };
                } else if (devices.some(d => d.kind === 'audioinput')) {
                    constraints.audio = true;
                }

                if (selectedVideo && videoExists) {
                    constraints.video = { deviceId: { ideal: selectedVideo } };
                } else if (devices.some(d => d.kind === 'videoinput')) {
                    constraints.video = true;
                }

                if (constraints.audio || constraints.video) {
                    activeStream = await navigator.mediaDevices.getUserMedia(constraints);
                    setTestStream(activeStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = activeStream;
                    }
                }
            } catch (err) {
                console.error("Test stream error:", err);
            }
        };

        if (devices.length > 0) {
            startTest();
        }

        return () => {
            activeStream?.getTracks().forEach(t => t.stop());
        };
    }, [selectedInput, selectedVideo, devices]);

    const playTestSound = () => {
        setIsTestingAudio(true);
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => {
            console.error("Audio test failed:", e);
            setIsTestingAudio(false);
        });
        audio.onended = () => setIsTestingAudio(false);
    };

    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
    const videoInputs = devices.filter(d => d.kind === 'videoinput');

    return (
        <div className="flex h-full w-full bg-v1">
             <aside className="w-64 bg-v2 p-6 flex flex-col shrink-0 border-r border-white/5">
                <div className="mb-8 px-4">
                    <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] opacity-60">USTAWIENIA APLIKACJI</h2>
                </div>
                <nav className="space-y-1 flex-1">
                    <NavItem icon={<Volume2 size={18}/>} label="Głos i wideo" active={true} onClick={() => {}} />
                    <NavItem icon={<Monitor size={18}/>} label="Ustawienia ekranu" active={false} onClick={() => {}} />
                    <NavItem icon={<Bell size={18}/>} label="Powiadomienia" active={false} onClick={() => {}} />
                    <NavItem icon={<Globe size={18}/>} label="Język" active={false} onClick={() => {}} />
                </nav>
             </aside>
             <main className="flex-1 p-12 overflow-y-auto no-scrollbar relative bg-[#0f111a]">
                <button onClick={onClose} className="fixed top-8 right-8 p-2 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-full z-50">
                    <X size={28}/>
                </button>
                
                <div className="max-w-3xl space-y-12 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Głos i wideo</h2>
                        <p className="text-slate-500 text-sm">Skonfiguruj swoje urządzenia, aby inni mogli Cię widzieć i słyszeć.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Urządzenie wejściowe</label>
                            {audioInputs.length > 0 ? (
                                <select 
                                    value={selectedInput}
                                    onChange={(e) => setSelectedInput(e.target.value)}
                                    className="w-full bg-[#1e1f22] border border-white/5 p-3 rounded-xl text-white font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20"
                                >
                                    {audioInputs.map(d => (
                                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Mikrofon ${d.deviceId.slice(0,5)}`}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 bg-v2/50 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs italic">
                                    Brak wykrytego mikrofonu
                                </div>
                            )}
                            {audioInputs.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Test mikrofonu</span>
                                        <span className="text-[10px] font-mono text-emerald-500">{Math.round(audioLevel)}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                                        <div className="h-full bg-emerald-500 transition-all duration-75 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(audioLevel * 1.5, 100)}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Urządzenie wyjściowe</label>
                            {audioOutputs.length > 0 ? (
                                <select 
                                    value={selectedOutput}
                                    onChange={(e) => setSelectedOutput(e.target.value)}
                                    className="w-full bg-[#1e1f22] border border-white/5 p-3 rounded-xl text-white font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20"
                                >
                                    {audioOutputs.map(d => (
                                        <option key={d.deviceId} value={d.deviceId}>{d.label || 'Głośniki systemowe'}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 bg-v2/50 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs italic">
                                    Głośniki domyślne
                                </div>
                            )}
                            <button 
                                onClick={playTestSound}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${isTestingAudio ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}
                            >
                                {isTestingAudio ? <Music size={14} className="animate-bounce" /> : <Play size={14} fill="currentColor" />}
                                Sprawdź dźwięk
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ustawienia wideo</label>
                            {videoInputs.length > 0 && (
                                <select 
                                    value={selectedVideo}
                                    onChange={(e) => setSelectedVideo(e.target.value)}
                                    className="bg-[#1e1f22] border border-white/5 px-4 py-2 rounded-xl text-white font-bold text-xs outline-none"
                                >
                                    {videoInputs.map(d => (
                                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${d.deviceId.slice(0,5)}`}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="relative aspect-video w-full max-w-2xl bg-black rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group">
                            {videoInputs.length > 0 ? (
                                <>
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Video size={48} className="text-white/20 mb-4" />
                                        <span className="text-white font-black uppercase text-[10px] tracking-widest">Podgląd wideo na żywo</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-[#050505]">
                                    <VideoOff size={64} className="mb-4 opacity-20" />
                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-40">Nie wykryto kamery</span>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-[10px] font-bold border border-white/10 uppercase tracking-widest">
                                {devices.find(d => d.deviceId === selectedVideo)?.label || "Brak podglądu"}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 py-8 flex justify-end border-t border-white/5 max-w-3xl">
                    <button onClick={onClose} className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                        Zapisz i zamknij
                    </button>
                </div>
             </main>
        </div>
    );
};

const ServerSettingsModal = ({ onClose, onSubmit, server }: { onClose: () => void, onSubmit: (d: any) => void, server: Server }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHANNELS' | 'ROLES' | 'MEMBERS'>('OVERVIEW');
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [draftServer, setDraftServer] = useState<Server>({ ...server });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const isDifferent = JSON.stringify(draftServer) !== JSON.stringify(server);
        setHasChanges(isDifferent);
    }, [draftServer, server]);

    const handleSave = () => {
        onSubmit(draftServer);
        setHasChanges(false);
    };

    const handleReset = () => {
        setDraftServer({ ...server });
        setEditingRole(editingRole ? server.roles.find(r => r.id === editingRole.id) || null : null);
    };

    const handleUpdateRole = (updatedRole: Role) => {
        setDraftServer(prev => ({
            ...prev,
            roles: prev.roles.map(r => r.id === updatedRole.id ? updatedRole : r)
        }));
        if (editingRole?.id === updatedRole.id) {
            setEditingRole(updatedRole);
        }
    };

    const handleCreateRole = () => {
        const newRole: Role = {
            id: 'r-' + Date.now(),
            name: 'Nowa Rola',
            color: '#99aab5',
            permissions: [Permission.SEND_MESSAGES, Permission.CONNECT, Permission.SPEAK],
            position: draftServer.roles.length
        };
        setDraftServer(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
        setEditingRole(newRole);
        setActiveTab('ROLES');
    };

    const handleDeleteRole = (id: string) => {
        setDraftServer(prev => ({ ...prev, roles: prev.roles.filter(r => r.id !== id) }));
        setEditingRole(null);
    };

    const handleDeleteChannel = (channelId: string) => {
        setDraftServer(prev => ({
            ...prev,
            categories: prev.categories.map(cat => ({
                ...cat,
                channels: cat.channels.filter(ch => ch.id !== channelId)
            }))
        }));
    };

    const handleDeleteServer = () => {
        if (window.confirm("Czy na pewno chcesz usunąć ten serwer? Tej operacji nie można cofnąć.")) {
            onSubmit({ id: server.id, _action: 'DELETE_SERVER' });
        }
    };

    const handleMemberAction = (memberId: string, action: 'KICK' | 'BAN' | 'UPDATE_ROLES', data?: any) => {
        let updatedMembers = [...draftServer.members];
        if (action === 'KICK' || action === 'BAN') {
            updatedMembers = updatedMembers.filter(m => m.id !== memberId);
        } else if (action === 'UPDATE_ROLES') {
            updatedMembers = updatedMembers.map(m => m.id === memberId ? { ...m, roleIds: data } : m);
        }
        setDraftServer(prev => ({ ...prev, members: updatedMembers }));
    };

    return (
        <div className="flex h-full w-full bg-v1 relative">
            <aside className="w-60 bg-v2 p-6 flex flex-col shrink-0">
                <div className="mb-6 px-4">
                    <h2 className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Ustawienia serwera</h2>
                </div>
                <nav className="space-y-0.5 flex-1">
                    <NavItem icon={<Sliders size={18}/>} label="Przegląd" active={activeTab === 'OVERVIEW' && !editingRole} onClick={() => { setActiveTab('OVERVIEW'); setEditingRole(null); }} />
                    <NavItem icon={<Layers size={18}/>} label="Kanały" active={activeTab === 'CHANNELS'} onClick={() => { setActiveTab('CHANNELS'); setEditingRole(null); }} />
                    <NavItem icon={<Shield size={18}/>} label="Role" active={activeTab === 'ROLES' || !!editingRole} onClick={() => { setActiveTab('ROLES'); setEditingRole(null); }} />
                    <NavItem icon={<Users size={18}/>} label="Członkowie" active={activeTab === 'MEMBERS'} onClick={() => { setActiveTab('MEMBERS'); setEditingRole(null); }} />
                    <div className="h-px bg-white/5 my-4" />
                    <NavItem icon={<Trash2 size={18}/>} label="Usuń Serwer" active={false} danger onClick={handleDeleteServer} />
                </nav>
            </aside>

            <main className="flex-1 p-12 overflow-y-auto no-scrollbar bg-v1 relative">
                <button onClick={onClose} className="fixed top-8 right-8 p-2 text-slate-400 hover:text-white transition-all z-50">
                    <X size={24}/>
                </button>

                {activeTab === 'OVERVIEW' && (
                    <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-xl font-bold text-white">Przegląd</h2>
                        <div className="flex gap-8 items-start">
                            <div className="relative group shrink-0">
                                <img src={draftServer.icon} className="w-24 h-24 rounded-2xl object-cover ring-1 ring-white/5 shadow-xl" />
                                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                                    <Upload size={20} className="text-white mb-1" />
                                    <span className="text-[9px] font-bold text-white uppercase">Zmień</span>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => {
                                        if (e.target.files?.[0]) {
                                            const base64 = await fileToBase64(e.target.files[0]);
                                            setDraftServer(prev => ({ ...prev, icon: base64 }));
                                        }
                                    }} />
                                </div>
                            </div>
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa serwera</label>
                                    <input 
                                        value={draftServer.name} 
                                        onChange={e => setDraftServer(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-[#1e1f22] border border-black/20 p-3 rounded-lg text-white font-medium outline-none focus:ring-2 ring-indigo-500/20" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'CHANNELS' && (
                    <div className="max-w-3xl space-y-6 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Kanały</h2>
                        </div>
                        <div className="space-y-6">
                            {draftServer.categories.map(cat => (
                                <div key={cat.id} className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">
                                        <span>{cat.name}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {cat.channels.map(ch => (
                                            <div key={ch.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group">
                                                <div className="flex items-center gap-3">
                                                    {ch.type === ChannelType.TEXT ? <Hash size={18} className="text-slate-500" /> : <Volume2 size={18} className="text-slate-500" />}
                                                    <span className="font-bold text-slate-200">{ch.name}</span>
                                                </div>
                                                <button onClick={() => handleDeleteChannel(ch.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ROLES' && !editingRole && (
                    <div className="max-w-3xl space-y-6 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Role</h2>
                            <button onClick={handleCreateRole} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-[13px] hover:bg-indigo-500 transition-all">
                                Utwórz rolę
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            {draftServer.roles.map(role => (
                                <div key={role.id} onClick={() => setEditingRole(role)} className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: role.color }} />
                                        <span className="font-medium text-slate-200">{role.name}</span>
                                    </div>
                                    <Settings size={16} className="text-slate-500 group-hover:text-slate-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ROLES' && editingRole && (
                    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-2">
                        <button onClick={() => setEditingRole(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-4">
                            <ChevronLeft size={20}/> <span className="text-xs font-bold uppercase tracking-wider">Lista ról</span>
                        </button>
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg shadow-xl" style={{ backgroundColor: editingRole.color }} />
                                <h2 className="text-xl font-bold text-white">Edytujesz rolę: {editingRole.name}</h2>
                            </div>
                            <button onClick={() => handleDeleteRole(editingRole.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                                <Trash2 size={20}/>
                            </button>
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa roli</label>
                                    <input 
                                        value={editingRole.name} 
                                        onChange={e => handleUpdateRole({...editingRole, name: e.target.value})}
                                        className="w-full bg-[#1e1f22] border border-black/20 p-3 rounded-lg text-white font-medium outline-none" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kolor roli</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            value={editingRole.color} 
                                            onChange={e => handleUpdateRole({...editingRole, color: e.target.value})}
                                            className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer p-0" 
                                        />
                                        <input 
                                            value={editingRole.color} 
                                            onChange={e => handleUpdateRole({...editingRole, color: e.target.value})}
                                            className="bg-[#1e1f22] border border-black/20 px-3 py-2 rounded-lg text-xs font-mono text-slate-300 uppercase w-28" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Uprawnienia</h3>
                                <div className="bg-[#2b2d31] rounded-xl overflow-hidden divide-y divide-white/5">
                                    {Object.values(Permission).map(perm => {
                                        const isEnabled = editingRole.permissions.includes(perm);
                                        return (
                                            <div key={perm} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                                                <span className="text-[13px] font-medium text-slate-200 capitalize">{perm.toLowerCase().replace(/_/g, ' ')}</span>
                                                <button 
                                                    onClick={() => {
                                                        const newPerms = isEnabled 
                                                            ? editingRole.permissions.filter(p => p !== perm) 
                                                            : [...editingRole.permissions, perm];
                                                        handleUpdateRole({...editingRole, permissions: newPerms});
                                                    }}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${isEnabled ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'left-5.5' : 'left-0.5'}`} style={{ left: isEnabled ? '22px' : '2px' }} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'MEMBERS' && (
                    <div className="max-w-4xl space-y-6 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Członkowie</h2>
                            <span className="text-xs font-bold text-slate-500">{draftServer.members.length} członków</span>
                        </div>
                        <div className="space-y-1">
                            {draftServer.members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatar} className="w-8 h-8 rounded-full object-cover" />
                                        <span className="font-bold text-slate-200">{member.username}</span>
                                        <div className="flex gap-1">
                                            {member.roleIds?.map(rid => {
                                                const r = draftServer.roles.find(r => r.id === rid);
                                                if (!r) return null;
                                                return (
                                                    <span key={rid} className="px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1" style={{ backgroundColor: r.color + '20', color: r.color }}>
                                                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: r.color }} />
                                                        {r.name}
                                                        <X size={10} className="cursor-pointer" onClick={() => {
                                                            const newRoles = member.roleIds?.filter(id => id !== rid) || [];
                                                            handleMemberAction(member.id, 'UPDATE_ROLES', newRoles);
                                                        }} />
                                                    </span>
                                                );
                                            })}
                                            <button className="w-5 h-5 flex items-center justify-center rounded bg-white/5 text-slate-500 hover:text-slate-200" onClick={() => {
                                                const availableRole = draftServer.roles.find(r => !member.roleIds?.includes(r.id));
                                                if (availableRole) {
                                                    handleMemberAction(member.id, 'UPDATE_ROLES', [...(member.roleIds || []), availableRole.id]);
                                                }
                                            }}>
                                                <Plus size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                    {member.id !== draftServer.ownerId && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                            <button onClick={() => handleMemberAction(member.id, 'KICK')} className="p-1.5 text-slate-400 hover:text-rose-500 rounded"><UserMinus size={16}/></button>
                                            <button onClick={() => handleMemberAction(member.id, 'BAN')} className="p-1.5 text-slate-400 hover:text-rose-500 rounded"><Ban size={16}/></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasChanges && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-480px)] max-w-2xl bg-[#111214] p-4 rounded-xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-5 border border-black/40 z-[60]">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} className="text-amber-400" />
                            <span className="text-white text-sm font-bold tracking-tight">Uwaga — masz niezapisane zmiany!</span>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleReset} className="text-white text-xs font-bold hover:underline">Resetuj</button>
                            <button onClick={handleSave} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/10">Zapisz zmiany</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const CreateServerModal = ({ onClose, onSubmit }: any) => {
    const [name, setName] = useState('');
    return (
        <div className="p-8 bg-v1 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Stwórz serwer</h2>
            <p className="text-slate-400 text-sm mb-8">Twój serwer to miejsce, gdzie spotykasz się ze znajomymi. Stwórz własny i zacznij rozmawiać.</p>
            <div className="space-y-2 text-left mb-8">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa serwera</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none focus:ring-2 ring-indigo-500/20" placeholder="Serwer programistyczny" />
            </div>
            <div className="flex justify-between items-center bg-v2 -mx-8 -mb-8 p-4">
                <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Wróć</button>
                <button onClick={() => name.trim() && onSubmit({ name })} className="bg-indigo-600 text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all">Stwórz</button>
            </div>
        </div>
    );
};

const CreateChannelModal = ({ onClose, onSubmit, categoryId }: any) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ChannelType>(ChannelType.TEXT);
    return (
        <div className="p-8 bg-v1">
            <h2 className="text-2xl font-bold text-white mb-6">Utwórz Kanał</h2>
            <div className="space-y-6 mb-8">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Typ kanału</label>
                    <div className="space-y-2">
                        <div 
                            onClick={() => setType(ChannelType.TEXT)}
                            className={`p-4 rounded-lg flex items-center gap-4 cursor-pointer transition-all border ${type === ChannelType.TEXT ? 'bg-white/10 border-white/10' : 'bg-white/5 border-transparent hover:bg-white/[0.08]'}`}
                        >
                            <Hash size={24} className="text-slate-400" />
                            <div>
                                <p className="font-bold text-white leading-tight">Tekstowy</p>
                                <p className="text-[11px] text-slate-400">Wysyłaj wiadomości, obrazy, GIF-y i emoji</p>
                            </div>
                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === ChannelType.TEXT ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'}`}>
                                {type === ChannelType.TEXT && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </div>
                        <div 
                            onClick={() => setType(ChannelType.VOICE)}
                            className={`p-4 rounded-lg flex items-center gap-4 cursor-pointer transition-all border ${type === ChannelType.VOICE ? 'bg-white/10 border-white/10' : 'bg-white/5 border-transparent hover:bg-white/[0.08]'}`}
                        >
                            <Volume2 size={24} className="text-slate-400" />
                            <div>
                                <p className="font-bold text-white leading-tight">Głosowy</p>
                                <p className="text-[11px] text-slate-400">Rozmawiaj głosem, wideo i udostępniaj ekran</p>
                            </div>
                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === ChannelType.VOICE ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'}`}>
                                {type === ChannelType.VOICE && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa kanału</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            {type === ChannelType.TEXT ? <Hash size={18}/> : <Volume2 size={18}/>}
                        </span>
                        <input value={name} onChange={e=>setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full bg-[#1e1f22] pl-10 pr-3 py-3 rounded-lg text-white font-medium outline-none" placeholder="nowy-kanal" />
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center bg-v2 -mx-8 -mb-8 p-4 gap-4">
                <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Anuluj</button>
                <button onClick={() => name.trim() && onSubmit({ name, type, categoryId })} className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all">Utwórz kanał</button>
            </div>
        </div>
    );
};

const EditChannelModal = ({ onClose, onSubmit, channel, activeServer }: { onClose: () => void, onSubmit: (d: any) => void, channel: Channel, activeServer?: Server }) => {
    const [name, setName] = useState(channel?.name || '');
    const [topic, setTopic] = useState(channel?.topic || '');
    const [userLimit, setUserLimit] = useState(channel?.userLimit || 0);
    const [isPrivate, setIsPrivate] = useState(channel?.isPrivate || false);

    if (!channel) return null;

    const handleSave = () => {
        if (!activeServer) return;
        const updatedServer = {
            ...activeServer,
            categories: activeServer.categories.map(cat => ({
                ...cat,
                channels: cat.channels.map(ch => 
                    ch.id === channel.id ? { ...ch, name, topic, userLimit, isPrivate } : ch
                )
            }))
        };
        onSubmit(updatedServer);
    };

    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-60 bg-v2 p-6 shrink-0 border-r border-white/5">
                <div className="mb-6 px-4">
                    <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">USTAWIENIA KANAŁU</h3>
                    <p className="text-white font-bold text-sm truncate">#{channel.name}</p>
                </div>
                <nav className="space-y-0.5">
                    <NavItem icon={<Sliders size={18}/>} label="Przegląd" active={true} onClick={() => {}} />
                    <NavItem icon={<Shield size={18}/>} label="Uprawnienia" active={false} onClick={() => {}} />
                </nav>
            </aside>
            <main className="flex-1 p-12 overflow-y-auto no-scrollbar relative">
                <button onClick={onClose} className="fixed top-8 right-8 p-2 text-slate-400 hover:text-white transition-all">
                    <X size={24} />
                </button>
                <div className="max-w-2xl space-y-10">
                    <h2 className="text-xl font-bold text-white">Przegląd</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa kanału</label>
                            <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none" />
                        </div>
                        {channel.type === ChannelType.TEXT && (
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Temat kanału</label>
                                <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="Opisz cel tego kanału..." className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none min-h-[100px] resize-none" />
                            </div>
                        )}
                        <div className="p-4 bg-[#2b2d31] rounded-xl flex items-center justify-between border border-white/5">
                            <div>
                                <h4 className="font-bold text-white flex items-center gap-2">Kanał Prywatny <Lock size={14}/></h4>
                                <p className="text-xs text-slate-400 mt-1">Tylko wybrani członkowie i role będą mogli zobaczyć ten kanał.</p>
                            </div>
                            <button 
                                onClick={() => setIsPrivate(!isPrivate)}
                                className={`w-10 h-5 rounded-full transition-all relative ${isPrivate ? 'bg-indigo-500' : 'bg-slate-600'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isPrivate ? 'left-5.5' : 'left-0.5'}`} style={{ left: isPrivate ? '22px' : '2px' }} />
                            </button>
                        </div>
                    </div>
                    <div className="pt-8 flex justify-end gap-4 border-t border-white/5">
                        <button onClick={onClose} className="text-white text-sm font-bold hover:underline px-4">Anuluj</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all shadow-xl">Zapisz zmiany</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

const UserSettingsModal = ({ onClose, currentUser, onSubmit }: { onClose: () => void, currentUser: User, onSubmit: (d: any) => void }) => {
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'APPEARANCE'>('PROFILE');
    const [editUsername, setEditUsername] = useState(currentUser.username);
    const [editAvatar, setEditAvatar] = useState(currentUser.avatar || '');
    const [settings, setSettings] = useState({ ...currentUser.settings });
    
    const handleSave = () => {
        onSubmit({ username: editUsername, avatar: editAvatar, settings: settings });
    };

    return (
        <div className="flex h-full w-full bg-v1">
             <aside className="w-60 bg-v2 p-6 flex flex-col shrink-0 border-r border-white/5">
                <div className="mb-6 px-4">
                    <h2 className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Ustawienia użytkownika</h2>
                </div>
                <nav className="space-y-0.5 flex-1">
                    <NavItem icon={<Users size={18}/>} label="Mój Profil" active={activeTab === 'PROFILE'} onClick={() => setActiveTab('PROFILE')} />
                    <NavItem icon={<Palette size={18}/>} label="Wygląd" active={activeTab === 'APPEARANCE'} onClick={() => setActiveTab('APPEARANCE')} />
                    <div className="h-px bg-white/5 my-4" />
                    <NavItem icon={<LogOut size={18}/>} label="Wyloguj się" active={false} danger onClick={() => {}} />
                </nav>
             </aside>
             <main className="flex-1 p-12 overflow-y-auto no-scrollbar relative">
                <button onClick={onClose} className="fixed top-8 right-8 p-2 text-slate-400 hover:text-white transition-all">
                    <X size={24}/>
                </button>
                {activeTab === 'PROFILE' && (
                    <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-xl font-bold text-white">Mój Profil</h2>
                        <div className="bg-[#1e1f22] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                            <div className="h-24 bg-indigo-600 relative" />
                            <div className="px-8 pb-8 relative">
                                <div className="absolute -top-12 left-8 p-1.5 bg-[#1e1f22] rounded-full">
                                    <div className="relative group">
                                        <img src={editAvatar} className="w-20 h-20 rounded-full object-cover ring-4 ring-[#1e1f22]" />
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Upload size={20} className="text-white"/>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                                                if(e.target.files?.[0]) setEditAvatar(await fileToBase64(e.target.files[0]));
                                            }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-12 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa użytkownika</label>
                                        <input value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full bg-[#2b2d31] p-3 rounded-lg text-white font-medium outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'APPEARANCE' && (
                    <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-xl font-bold text-white">Wygląd</h2>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Motyw</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[Theme.DARK, Theme.AMOLED, Theme.LIGHT].map(t => (
                                        <div 
                                            key={t}
                                            onClick={() => setSettings({...settings, theme: t})}
                                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${settings.theme === t ? 'border-indigo-500 bg-white/5' : 'bg-white/5 border-transparent hover:bg-white/[0.08]'}`}>
                                            <div className={`w-full h-12 rounded-lg ${t === Theme.LIGHT ? 'bg-white' : t === Theme.AMOLED ? 'bg-black' : 'bg-[#313338] border border-white/5'}`} />
                                            <span className="text-xs font-bold text-white uppercase">{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-12 pt-8 flex justify-end gap-4 border-t border-white/5">
                    <button onClick={onClose} className="text-white text-sm font-bold hover:underline px-4">Anuluj</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all shadow-xl">Zapisz zmiany</button>
                </div>
             </main>
        </div>
    );
};
