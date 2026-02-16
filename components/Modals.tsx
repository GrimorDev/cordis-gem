
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Shield, Users, Plus, Check, ChevronRight, 
  Ban, UserMinus, Settings, Bell, Upload, Video, VideoOff,
  Lock, Palette, Monitor, LogOut, Trash2, Volume2, Globe, Hash, Layers, Sliders, Trash, ChevronLeft, AlertCircle, Play, Music, UserPlus, Sparkles, Layout, Link as LinkIcon, Search, ArrowUpDown, UserPen, Image as ImageIcon, Compass, ShieldCheck, MicOff, MoreVertical, Key, MessageCircle, Info, Moon, Camera
} from 'lucide-react';
import { ModalType, ChannelType, User, Server, Theme, Channel, Role, Permission, Language, UserStatus, ServerCategory } from '../types';
import { fileToBase64, getUserRoleColor } from '../utils/helpers';
import { PERMISSIONS_LIST, DEFAULT_ROLES } from '../constants';
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

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, danger?: boolean }> = ({ icon, label, active, onClick, danger }) => (
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

const SectionHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="px-4 pt-4 pb-2">
    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60">{children}</h3>
  </div>
);

const Toggle: React.FC<{ active: boolean, onToggle: () => void, label: string, description?: string }> = ({ active, onToggle, label, description }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-black/10 border border-white/5 group hover:border-white/10 transition-all">
        <div className="flex-1 mr-4">
            <h4 className="text-sm font-bold text-white">{label}</h4>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
        <button 
            onClick={onToggle}
            className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${active ? 'bg-indigo-500' : 'bg-slate-600'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all`} style={{ left: active ? '22px' : '2px' }} />
        </button>
    </div>
);

const RoleSelector: React.FC<{ server: Server, selectedRoleIds: string[], onToggle: (id: string) => void }> = ({ server, selectedRoleIds, onToggle }) => (
    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Kto może wyświetlać ten element?</p>
        {server.roles.map(role => (
            <div 
                key={role.id} 
                onClick={() => onToggle(role.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 cursor-pointer transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center bg-black/40">
                        {selectedRoleIds.includes(role.id) && <Check size={12} className="text-indigo-400" />}
                    </div>
                    <span className="text-xs font-bold" style={{ color: role.color }}>{role.name}</span>
                </div>
            </div>
        ))}
    </div>
);

export const ModalManager: React.FC<ModalProps> = ({ isOpen, type, onClose, onSubmit, currentUser, activeServer, targetData }) => {
    if (!isOpen || !type) return null;
    const isLargeModal = ['SERVER_SETTINGS', 'SETTINGS', 'DEVICE_SETTINGS', 'EDIT_CHANNEL', 'EDIT_CATEGORY'].includes(type);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative bg-v1 border border-white/5 rounded-none md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                isLargeModal ? 'w-full h-full md:h-[90vh] md:max-w-6xl' : 'max-w-md w-full mx-4'
            }`}>
                {type === 'SERVER_SETTINGS' && targetData && <ServerSettingsModal onClose={onClose} onSubmit={onSubmit} server={targetData} />}
                {type === 'SETTINGS' && currentUser && <UserSettingsModal onClose={onClose} currentUser={currentUser} onSubmit={onSubmit} />}
                {type === 'CREATE_SERVER' && <CreateServerModal onClose={onClose} onSubmit={onSubmit} />}
                {type === 'CREATE_CHANNEL' && activeServer && <CreateChannelModal onClose={onClose} onSubmit={onSubmit} categoryId={targetData} activeServer={activeServer} />}
                {type === 'CREATE_CATEGORY' && activeServer && <CreateCategoryModal onClose={onClose} onSubmit={onSubmit} activeServer={activeServer} />}
                {type === 'EDIT_CATEGORY' && targetData && activeServer && <EditCategoryModal onClose={onClose} onSubmit={onSubmit} category={targetData} activeServer={activeServer} />}
                {type === 'EDIT_CHANNEL' && targetData && activeServer && <EditChannelModal onClose={onClose} onSubmit={onSubmit} channel={targetData} activeServer={activeServer} />}
                {type === 'DEVICE_SETTINGS' && <DeviceSettingsModal onClose={onClose} />}
                {type === 'ADD_FRIEND' && <AddFriendModal onClose={onClose} onSubmit={onSubmit} />}
                {type === 'INVITE' && targetData && <InviteModal onClose={onClose} server={targetData} />}
            </div>
        </div>
    );
};

const DeviceSettingsModal = ({ onClose }: { onClose: () => void }) => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [testStream, setTestStream] = useState<MediaStream | null>(null);
    const audioLevel = useAudioLevel(testStream, false, false);

    useEffect(() => {
        const getDevices = async () => {
            try {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioStream.getTracks().forEach(t => t.stop());
                } catch (e) { console.debug("No mic access"); }
                try {
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoStream.getTracks().forEach(t => t.stop());
                } catch (e) { console.debug("No camera access"); }
                const devs = await navigator.mediaDevices.enumerateDevices();
                setDevices(devs);
            } catch (err) { console.error("Device access error:", err); }
        };
        getDevices();
    }, []);

    const startTest = async () => {
        if (testStream) {
            testStream.getTracks().forEach(t => t.stop());
            setTestStream(null);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setTestStream(stream);
        } catch (err) { alert("Błąd mikrofonu"); }
    };

    useEffect(() => () => testStream?.getTracks().forEach(t => t.stop()), [testStream]);

    const inputs = devices.filter(d => d.kind === 'audioinput');
    const outputs = devices.filter(d => d.kind === 'audiooutput');
    const cameras = devices.filter(d => d.kind === 'videoinput');

    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-64 bg-v2 p-4 shrink-0 border-r border-white/5 flex flex-col">
                <SectionHeader>Ustawienia głosu</SectionHeader>
                <NavItem icon={<Volume2 size={18}/>} label="Głos i wideo" active={true} onClick={() => {}} />
            </aside>
            <main className="flex-1 p-12 overflow-y-auto relative no-scrollbar">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-all"><X size={24} /></button>
                <div className="max-w-2xl space-y-10">
                    <h2 className="text-2xl font-black text-white">Głos i wideo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Urządzenie wejściowe</label>
                            <select className="w-full bg-[#1e1f22] border border-white/5 rounded-lg p-3 text-white outline-none">
                                {inputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Mikrofon ' + d.deviceId.slice(0, 5)}</option>)}
                                {inputs.length === 0 && <option>Brak urządzeń</option>}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Urządzenie wyjściowe</label>
                            <select className="w-full bg-[#1e1f22] border border-white/5 rounded-lg p-3 text-white outline-none">
                                {outputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Głośnik ' + d.deviceId.slice(0, 5)}</option>)}
                                {outputs.length === 0 && <option>Głośniki domyślne</option>}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-white">Tester mikrofonu</h3>
                            <button onClick={startTest} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${testStream ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
                                {testStream ? 'Zatrzymaj' : 'Sprawdź'}
                            </button>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-75" style={{ width: `${Math.min(100, audioLevel * 2)}%` }} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const ServerSettingsModal = ({ onClose, onSubmit, server }: { onClose: () => void, onSubmit: (d: any) => void, server: Server }) => {
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [editedServer, setEditedServer] = useState<Server>(server);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdateServer = (updates: Partial<Server>) => setEditedServer(prev => ({ ...prev, ...updates }));
    
    const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            handleUpdateServer({ icon: base64 });
        }
    };

    const handleCreateRole = () => {
        const newRole: Role = { id: 'r-' + Date.now(), name: 'nowa rola', color: '#94a3b8', permissions: [Permission.SEND_MESSAGES], position: editedServer.roles.length };
        handleUpdateServer({ roles: [...editedServer.roles, newRole] });
        setSelectedRoleId(newRole.id);
    };
    const handleUpdateRole = (roleId: string, updates: Partial<Role>) => handleUpdateServer({ roles: editedServer.roles.map(r => r.id === roleId ? { ...r, ...updates } : r) });
    const togglePermission = (role: Role, perm: Permission) => {
        const hasPerm = role.permissions.includes(perm);
        handleUpdateRole(role.id, { permissions: hasPerm ? role.permissions.filter(p => p !== perm) : [...role.permissions, perm] });
    };
    const selectedRole = editedServer.roles.find(r => r.id === selectedRoleId);

    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-64 bg-v2 p-4 shrink-0 border-r border-white/5 flex flex-col justify-between">
                <div>
                    <SectionHeader>{editedServer.name}</SectionHeader>
                    <nav className="space-y-1">
                        <NavItem icon={<Settings size={18}/>} label="Przegląd" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
                        <NavItem icon={<Shield size={18}/>} label="Role" active={activeTab === 'ROLES'} onClick={() => setActiveTab('ROLES')} />
                        <NavItem icon={<Users size={18}/>} label="Członkowie" active={activeTab === 'MEMBERS'} onClick={() => setActiveTab('MEMBERS')} />
                    </nav>
                </div>
                <div className="space-y-2 p-2 border-t border-white/5">
                    <button onClick={() => onSubmit(editedServer)} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg text-[11px] font-black uppercase tracking-widest"><Check size={14} /> Zapisz</button>
                    <button onClick={() => onSubmit({ id: editedServer.id, _action: 'DELETE_SERVER' })} className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest"><Trash2 size={14} /> Usuń</button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-12 no-scrollbar relative">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X size={24} /></button>
                {activeTab === 'OVERVIEW' && (
                    <div className="max-w-2xl space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-white">Przegląd serwera</h2>
                        <div className="flex gap-8 items-start">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 bg-v2 rounded-[2.5rem] border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:rounded-2xl group-hover:brightness-50">
                                    {editedServer.icon ? <img src={editedServer.icon} className="w-full h-full object-cover" /> : <Camera size={32} />}
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <Upload size={24} className="text-white mb-1" />
                                    <span className="text-[8px] font-black uppercase text-white tracking-widest">Zmień</span>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleIconChange} />
                            </div>
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nazwa serwera</label>
                                    <input value={editedServer.name} onChange={e => handleUpdateServer({ name: e.target.value })} className="w-full bg-[#1e1f22] border border-white/5 rounded-xl p-4 text-white outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'ROLES' && (
                    <div className="flex gap-8 h-full animate-fade-in">
                        <div className="w-48 shrink-0 space-y-2">
                            <button onClick={handleCreateRole} className="w-full p-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase mb-4">Dodaj rolę</button>
                            {editedServer.roles.map(r => (
                                <button key={r.id} onClick={() => setSelectedRoleId(r.id)} className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${selectedRoleId === r.id ? 'bg-indigo-600/20 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                    <span className="text-xs font-bold truncate">{r.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 bg-black/20 rounded-2xl p-6 overflow-y-auto no-scrollbar">
                            {selectedRole ? (
                                <div className="space-y-6">
                                    <h3 className="font-black text-white">Ustawienia: {selectedRole.name}</h3>
                                    <input value={selectedRole.name} onChange={e => handleUpdateRole(selectedRole.id, { name: e.target.value })} className="w-full bg-v1 border border-white/5 rounded-xl p-3 text-white outline-none" />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase">Uprawnienia</label>
                                        {PERMISSIONS_LIST.map(p => (
                                            <Toggle key={p.id} active={selectedRole.permissions.includes(p.id)} onToggle={() => togglePermission(selectedRole, p.id)} label={p.label} />
                                        ))}
                                    </div>
                                </div>
                            ) : <div className="flex items-center justify-center h-full text-slate-500 text-xs uppercase font-black">Wybierz rolę</div>}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const UserSettingsModal = ({ onClose, currentUser, onSubmit }: { onClose: () => void, currentUser: User, onSubmit: (d: any) => void }) => {
    const [activeTab, setActiveTab] = useState('ACCOUNT');
    const [editState, setEditState] = useState({
        username: currentUser.username,
        avatar: currentUser.avatar || '',
        bannerColor: currentUser.bannerColor || '#6366f1',
        aboutMe: currentUser.aboutMe || '',
        customStatus: currentUser.customStatus || '',
        settings: { ...currentUser.settings }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateSetting = (key: keyof typeof editState.settings, value: any) => {
        setEditState(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setEditState(prev => ({ ...prev, avatar: base64 }));
        }
    };

    const handleSave = () => {
        onSubmit({ ...currentUser, ...editState });
        onClose();
    };

    return (
        <div className="flex h-full w-full bg-v1 text-white overflow-hidden">
             <aside className="w-64 bg-v2 p-4 shrink-0 border-r border-white/5 flex flex-col justify-between overflow-y-auto no-scrollbar">
                <div className="space-y-1">
                    <SectionHeader>Ustawienia użytkownika</SectionHeader>
                    <NavItem icon={<Users size={18}/>} label="Moje konto" active={activeTab === 'ACCOUNT'} onClick={() => setActiveTab('ACCOUNT')} />
                    <NavItem icon={<UserPen size={18}/>} label="Profil" active={activeTab === 'PROFILE'} onClick={() => setActiveTab('PROFILE')} />
                    <NavItem icon={<Shield size={18}/>} label="Prywatność" active={activeTab === 'PRIVACY'} onClick={() => setActiveTab('PRIVACY')} />
                    <SectionHeader>Aplikacja</SectionHeader>
                    <NavItem icon={<Palette size={18}/>} label="Wygląd" active={activeTab === 'APPEARANCE'} onClick={() => setActiveTab('APPEARANCE')} />
                    <NavItem icon={<Volume2 size={18}/>} label="Głos i wideo" active={activeTab === 'VOICE'} onClick={() => setActiveTab('VOICE')} />
                </div>
                <div className="mt-8 pt-4 border-t border-white/5 space-y-1">
                    <NavItem icon={<LogOut size={18}/>} label="Wyloguj się" active={false} onClick={onClose} danger />
                    <p className="text-[9px] text-slate-600 font-black uppercase text-center mt-2 tracking-widest">Cordis v2.5.3</p>
                </div>
            </aside>

            <main className="flex-1 bg-v1 flex flex-col relative overflow-hidden">
                <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-white border border-white/10 rounded-full transition-all z-50">
                    <X size={24} />
                </button>

                <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        {activeTab === 'ACCOUNT' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black">Moje konto</h2>
                                <div className="bg-v2 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                                    <div className="h-28" style={{ backgroundColor: editState.bannerColor }} />
                                    <div className="px-8 pb-8">
                                        <div className="flex justify-between items-end -mt-10 mb-6">
                                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <img src={editState.avatar} className="w-24 h-24 rounded-3xl border-8 border-[#151821] bg-[#151821] object-cover shadow-xl" />
                                                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <Camera size={24} />
                                                </div>
                                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                            </div>
                                            <button onClick={() => setActiveTab('PROFILE')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-lg">Edytuj profil</button>
                                        </div>
                                        <div className="space-y-1 bg-black/20 rounded-2xl p-6 border border-white/5">
                                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                                <div><p className="text-[10px] font-black text-slate-500 uppercase">Nazwa użytkownika</p><p className="font-bold">{editState.username}<span className="text-slate-500">#{currentUser.discriminator}</span></p></div>
                                                <button className="text-indigo-400 text-xs font-bold">Edytuj</button>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <div><p className="text-[10px] font-black text-slate-500 uppercase">Adres e-mail</p><p className="font-bold">d********v@cordis.app</p></div>
                                                <button className="text-indigo-400 text-xs font-bold">Odkryj</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'PROFILE' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black">Profil użytkownika</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase">Nazwa wyświetlana</label>
                                        <input value={editState.username} onChange={e => setEditState(p => ({...p, username: e.target.value}))} className="w-full bg-v2 border border-white/5 rounded-xl p-3 text-white outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase">O mnie</label>
                                        <textarea value={editState.aboutMe} onChange={e => setEditState(p => ({...p, aboutMe: e.target.value}))} className="w-full bg-v2 border border-white/5 rounded-xl p-3 text-white outline-none min-h-[100px] resize-none" placeholder="Napisz coś o sobie..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-500 uppercase">Kolor banera</label>
                                        <div className="flex items-center gap-4 bg-v2 p-3 rounded-xl border border-white/5">
                                            <input type="color" value={editState.bannerColor} onChange={e => setEditState(p => ({...p, bannerColor: e.target.value}))} className="w-12 h-10 rounded cursor-pointer bg-transparent border-none" />
                                            <span className="font-mono text-slate-400 uppercase font-bold">{editState.bannerColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'APPEARANCE' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black">Wygląd</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: Theme.DARK, label: 'Ciemny', icon: <Moon size={24}/> },
                                        { id: Theme.LIGHT, label: 'Jasny', icon: <Sparkles size={24}/> },
                                        { id: Theme.AMOLED, label: 'AMOLED', icon: <Monitor size={24}/> }
                                    ].map(t => (
                                        <button key={t.id} onClick={() => updateSetting('theme', t.id)} className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${editState.settings.theme === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-v2 hover:bg-white/5'}`}>
                                            <div className={editState.settings.theme === t.id ? 'text-indigo-400' : 'text-slate-500'}>{t.icon}</div>
                                            <span className="font-bold text-xs uppercase tracking-widest">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gęstość wiadomości</h3>
                                    <div className="space-y-2">
                                        <button onClick={() => updateSetting('displayDensity', 'COZY')} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${editState.settings.displayDensity === 'COZY' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-v2'}`}>
                                            <p className="font-bold text-sm">Przytulny</p>
                                            <p className="text-xs text-slate-500">Więcej miejsca, klasyczny wygląd Cordis.</p>
                                        </button>
                                        <button onClick={() => updateSetting('displayDensity', 'COMPACT')} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${editState.settings.displayDensity === 'COMPACT' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-v2'}`}>
                                            <p className="font-bold text-sm">Kompaktowy</p>
                                            <p className="text-xs text-slate-500">Więcej tekstu na ekranie, ukryte awatary.</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'PRIVACY' && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black">Prywatność</h2>
                                <div className="space-y-4">
                                    <Toggle active={editState.settings.privacyDirectMessages} onToggle={() => updateSetting('privacyDirectMessages', !editState.settings.privacyDirectMessages)} label="Wiadomości od członków serwera" description="Zezwalaj na otrzymywanie wiadomości prywatnych od osób z Twoich serwerów." />
                                    <Toggle active={editState.settings.privacyShowActivity} onToggle={() => updateSetting('privacyShowActivity', !editState.settings.privacyShowActivity)} label="Status aktywności" description="Wyświetlaj aktualnie uruchomione gry i aplikacje jako Twój status." />
                                </div>
                            </div>
                        )}

                        {activeTab === 'VOICE' && <DeviceSettingsModal onClose={() => {}} />}
                    </div>
                </div>

                <div className="p-6 bg-v2 border-t border-white/5 flex justify-end gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                    <button onClick={onClose} className="text-white text-[11px] font-black uppercase tracking-widest hover:underline">Anuluj</button>
                    <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500 shadow-xl transition-all">Zapisz zmiany</button>
                </div>
            </main>
        </div>
    );
};

const CreateServerModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (d: any) => void }) => {
    const [view, setView] = useState<'CHOICE' | 'CREATE' | 'JOIN'>('CHOICE');
    const [serverName, setServerName] = useState('');
    const [icon, setIcon] = useState<string | undefined>();
    const [inviteCode, setInviteCode] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setIcon(base64);
        }
    };

    const handleCreate = () => serverName.trim() && onSubmit({ name: serverName, icon: icon || 'https://picsum.photos/seed/' + serverName + '/100', categories: [] });
    const handleJoin = () => inviteCode.trim() && onSubmit({ action: 'JOIN', inviteCode });
    
    return (
        <div className="p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {view === 'CHOICE' && (
                <>
                    <h2 className="text-2xl font-black text-white mb-2">Stwórz serwer</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Twoje miejsce do rozmów z przyjaciółmi. Stwórz własną społeczność już teraz.</p>
                    <button onClick={() => setView('CREATE')} className="w-full flex items-center justify-between p-4 bg-v2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all mb-3 group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Plus /></div>
                            <span className="font-black text-white text-sm uppercase tracking-widest">Stwórz własny</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-600" />
                    </button>
                    <div className="w-full mt-6 pt-6 border-t border-white/5">
                        <button onClick={() => setView('JOIN')} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest">Dołącz do serwera</button>
                    </div>
                </>
            )}
            {view === 'CREATE' && (
                <div className="w-full text-left">
                    <h2 className="text-2xl font-black text-center mb-2">Dostosuj serwer</h2>
                    <p className="text-slate-400 text-sm mb-8 text-center">Nadaj swojemu serwerowi osobowość, wybierając nazwę i ikonę.</p>
                    <div className="flex justify-center mb-8">
                        <div 
                            className="relative w-24 h-24 rounded-[2rem] border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-indigo-500 hover:text-indigo-400 transition-all group overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {icon ? <img src={icon} className="w-full h-full object-cover" /> : (
                                <>
                                    <Upload size={24} />
                                    <span className="text-[9px] font-black uppercase mt-1 tracking-widest">Ikona</span>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleIconUpload} />
                        </div>
                    </div>
                    <div className="space-y-4 mb-10">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nazwa serwera</label>
                        <input value={serverName} autoFocus onChange={e => setServerName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 shadow-inner" placeholder="Mój nowy serwer" />
                    </div>
                    <div className="flex justify-between pt-6 border-t border-white/5">
                        <button onClick={() => setView('CHOICE')} className="text-white text-[11px] font-black uppercase tracking-widest hover:underline">Wstecz</button>
                        <button onClick={handleCreate} disabled={!serverName.trim()} className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl disabled:opacity-30">Stwórz</button>
                    </div>
                </div>
            )}
            {view === 'JOIN' && (
                <div className="w-full text-left">
                    <h2 className="text-2xl font-black text-center mb-6">Dołącz do społeczności</h2>
                    <div className="space-y-4 mb-10">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Kod zaproszenia</label>
                        <input value={inviteCode} autoFocus onChange={e => setInviteCode(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500" placeholder="np. cordis.gg/react" />
                    </div>
                    <div className="flex justify-between pt-6 border-t border-white/5">
                        <button onClick={() => setView('CHOICE')} className="text-white text-[11px] font-black uppercase tracking-widest hover:underline">Wstecz</button>
                        <button onClick={handleJoin} disabled={!inviteCode.trim()} className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl disabled:opacity-30">Dołącz</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CreateChannelModal = ({ onClose, onSubmit, categoryId, activeServer }: { onClose: () => void, onSubmit: (d: any) => void, categoryId: string, activeServer: Server }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ChannelType>(ChannelType.TEXT);
    const [isPrivate, setIsPrivate] = useState(false);
    const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>([]);

    const toggleRole = (roleId: string) => {
        setAllowedRoleIds(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
    };

    return (
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Utwórz kanał</h2>
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setType(ChannelType.TEXT)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${type === ChannelType.TEXT ? 'bg-indigo-600/10 border-indigo-500 shadow-lg' : 'bg-black/10 border-transparent hover:bg-white/5'}`}>
                        <div className="flex items-center gap-4"><Hash className={type === ChannelType.TEXT ? 'text-indigo-400' : 'text-slate-500'} /><div><p className="text-sm font-black uppercase">Tekstowy</p><p className="text-[10px] text-slate-500">Wiadomości, obrazy i GIFy</p></div></div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === ChannelType.TEXT ? 'border-indigo-500' : 'border-slate-600'}`}>{type === ChannelType.TEXT && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}</div>
                    </button>
                    <button onClick={() => setType(ChannelType.VOICE)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${type === ChannelType.VOICE ? 'bg-indigo-600/10 border-indigo-500 shadow-lg' : 'bg-black/10 border-transparent hover:bg-white/5'}`}>
                        <div className="flex items-center gap-4"><Volume2 className={type === ChannelType.VOICE ? 'text-indigo-400' : 'text-slate-500'} /><div><p className="text-sm font-black uppercase">Głosowy</p><p className="text-[10px] text-slate-500">Głos, wideo i udostępnianie</p></div></div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === ChannelType.VOICE ? 'border-indigo-500' : 'border-slate-600'}`}>{type === ChannelType.VOICE && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}</div>
                    </button>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nazwa kanału</label>
                    <input value={name} autoFocus onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500 shadow-inner" placeholder="nowy-kanał" />
                </div>
                
                <div className="space-y-4">
                    <Toggle 
                        active={isPrivate} 
                        onToggle={() => setIsPrivate(!isPrivate)} 
                        label="Kanał prywatny" 
                        description="Tylko wybrani członkowie i role będą mogli wyświetlać ten kanał." 
                    />
                    {isPrivate && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <RoleSelector server={activeServer} selectedRoleIds={allowedRoleIds} onToggle={toggleRole} />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-10">
                <button onClick={onClose} className="text-white text-[11px] font-black uppercase tracking-widest hover:underline">Anuluj</button>
                <button onClick={() => name.trim() && onSubmit({ name, type, categoryId, isPrivate, allowedRoleIds })} disabled={!name.trim()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase hover:bg-indigo-500 shadow-xl disabled:opacity-30">Utwórz</button>
            </div>
        </div>
    );
};

const CreateCategoryModal = ({ onClose, onSubmit, activeServer }: { onClose: () => void, onSubmit: (d: any) => void, activeServer: Server }) => {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>([]);

    const toggleRole = (roleId: string) => {
        setAllowedRoleIds(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest">Utwórz kategorię</h2>
            <div className="space-y-6 mb-8">
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nazwa kategorii</label>
                    <input value={name} autoFocus onChange={e => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-indigo-500" placeholder="KATEGORIA" />
                </div>
                <Toggle 
                    active={isPrivate} 
                    onToggle={() => setIsPrivate(!isPrivate)} 
                    label="Kategoria prywatna" 
                    description="Ogranicz dostęp do tej kategorii dla wszystkich członków." 
                />
                {isPrivate && (
                    <RoleSelector server={activeServer} selectedRoleIds={allowedRoleIds} onToggle={toggleRole} />
                )}
            </div>
            <div className="flex justify-end gap-4">
                <button onClick={onClose} className="text-white text-[11px] font-black uppercase tracking-widest hover:underline">Anuluj</button>
                <button onClick={() => onSubmit({ name, isPrivate, allowedRoleIds })} disabled={!name.trim()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase shadow-xl">Utwórz</button>
            </div>
        </div>
    );
};

const EditCategoryModal = ({ onClose, onSubmit, category, activeServer }: { onClose: () => void, onSubmit: (d: any) => void, category: ServerCategory, activeServer: Server }) => {
    const [name, setName] = useState(category.name);
    // Note: Assuming types have isPrivate/allowedRoleIds for category too
    const [isPrivate, setIsPrivate] = useState((category as any).isPrivate || false);
    const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>((category as any).allowedRoleIds || []);

    const toggleRole = (roleId: string) => {
        setAllowedRoleIds(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
    };

    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-64 bg-v2 p-4 shrink-0 border-r border-white/5 flex flex-col justify-between">
                <SectionHeader>Kategoria: {category.name}</SectionHeader>
                <div className="mt-auto">
                    <button onClick={() => onSubmit({ ...category, _action: 'DELETE' })} className="w-full flex items-center gap-3 px-4 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                        <Trash2 size={16}/> Usuń kategorię
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-12 overflow-y-auto no-scrollbar relative">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X size={24} /></button>
                <div className="max-w-2xl space-y-8 animate-fade-in">
                    <h2 className="text-2xl font-black">Edytuj kategorię</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nazwa kategorii</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#1e1f22] border border-white/5 rounded-xl p-4 text-white outline-none focus:border-indigo-500 shadow-inner" />
                        </div>
                        <Toggle 
                            active={isPrivate} 
                            onToggle={() => setIsPrivate(!isPrivate)} 
                            label="Prywatna kategoria" 
                            description="Ustaw tę kategorię jako prywatną, aby ograniczyć widoczność jej i jej kanałów." 
                        />
                        {isPrivate && (
                            <RoleSelector server={activeServer} selectedRoleIds={allowedRoleIds} onToggle={toggleRole} />
                        )}
                    </div>
                    <div className="pt-6 flex justify-end gap-4">
                        <button onClick={onClose} className="text-white text-[11px] font-black uppercase hover:underline">Anuluj</button>
                        <button onClick={() => onSubmit({ ...category, name, isPrivate, allowedRoleIds })} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase shadow-xl hover:bg-indigo-500 transition-all">Zapisz</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

const EditChannelModal = ({ onClose, onSubmit, channel, activeServer }: { onClose: () => void, onSubmit: (d: any) => void, channel: Channel, activeServer: Server }) => {
    const [name, setName] = useState(channel.name);
    const [topic, setTopic] = useState(channel.topic || '');
    const [isPrivate, setIsPrivate] = useState(channel.isPrivate || false);
    const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>(channel.allowedRoleIds || []);

    const toggleRole = (roleId: string) => {
        setAllowedRoleIds(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
    };

    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-64 bg-v2 p-4 shrink-0 border-r border-white/5 flex flex-col justify-between">
                <SectionHeader>Kanał #{channel.name}</SectionHeader>
                <div className="mt-auto"><NavItem icon={<Trash2 size={18}/>} label="Usuń kanał" active={false} onClick={() => onSubmit({ ...channel, _action: 'DELETE' })} danger /></div>
            </aside>
            <main className="flex-1 p-12 overflow-y-auto relative no-scrollbar">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white"><X size={24} /></button>
                <div className="max-w-2xl space-y-8 animate-fade-in">
                    <h2 className="text-2xl font-black">Przegląd</h2>
                    <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Nazwa kanału</label><input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#1e1f22] border border-white/5 rounded-xl p-3 text-white outline-none focus:border-indigo-500" /></div>
                        <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Temat kanału</label><textarea value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-[#1e1f22] border border-white/5 rounded-xl p-3 text-white outline-none min-h-[100px] resize-none" placeholder="O czym rozmawiamy na tym kanale?" /></div>
                        
                        <div className="pt-4 border-t border-white/5">
                            <Toggle 
                                active={isPrivate} 
                                onToggle={() => setIsPrivate(!isPrivate)} 
                                label="Prywatny kanał" 
                                description="Tylko wybrani członkowie i role będą mogli wyświetlać ten kanał." 
                            />
                            {isPrivate && (
                                <RoleSelector server={activeServer} selectedRoleIds={allowedRoleIds} onToggle={toggleRole} />
                            )}
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end gap-4">
                         <button onClick={onClose} className="text-white text-[11px] font-black uppercase hover:underline">Anuluj</button>
                         <button onClick={() => onSubmit({ ...channel, name, topic, isPrivate, allowedRoleIds })} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all">Zapisz zmiany</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

const AddFriendModal = ({ onClose, onSubmit }: any) => {
    const [val, setVal] = useState('');
    return (
        <div className="p-8">
            <h2 className="text-xl font-black mb-2 uppercase tracking-widest">Dodaj znajomego</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Możesz dodać znajomych za pomocą ich tagu Cordis. Pamiętaj, że wielkość liter ma znaczenie!</p>
            <div className="relative">
                <input value={val} autoFocus onChange={e => setVal(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-indigo-500 shadow-inner" placeholder="użytkownik#0000" />
                <button disabled={!val.includes('#')} onClick={() => onSubmit({ friendTag: val })} className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-lg font-black text-[10px] uppercase shadow-lg disabled:opacity-30">Wyślij prośbę</button>
            </div>
        </div>
    );
};

const InviteModal = ({ onClose, server }: any) => {
    const code = Math.random().toString(36).substring(7).toUpperCase();
    return (
        <div className="p-8">
            <h2 className="text-xl font-black mb-2">Zaproś do {server.name}</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Wyślij ten link znajomym, aby dać im dostęp do tego serwera.</p>
            <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase">Link z zaproszeniem</label><div className="flex gap-2"><div className="flex-1 bg-black/30 border border-white/10 rounded-xl p-4 text-indigo-400 font-black text-sm tracking-widest">cordis.gg/{code}</div><button onClick={() => { navigator.clipboard.writeText(`cordis.gg/${code}`); alert('Skopiowano!'); }} className="bg-indigo-600 text-white px-8 rounded-xl font-black text-[11px] uppercase shadow-xl">Kopiuj</button></div></div>
        </div>
    );
};
