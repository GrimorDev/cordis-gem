
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Shield, Users, Plus, Check, ChevronRight, 
  Ban, UserMinus, Settings, Bell, Upload, Video, VideoOff,
  Lock, Palette, Monitor, LogOut, Trash2, Volume2, Globe, Hash, Layers, Sliders, Trash, ChevronLeft, AlertCircle, Play, Music, UserPlus, Sparkles, Layout, Link as LinkIcon, Search, ArrowUpDown, UserPen, Image as ImageIcon, Compass, ShieldCheck, MicOff, MoreVertical
} from 'lucide-react';
import { ModalType, ChannelType, User, Server, Theme, Channel, Role, Permission } from '../types';
import { fileToBase64 } from '../utils/helpers';
import { PERMISSIONS_LIST, DEFAULT_ROLES } from '../constants';

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
                {type === 'SERVER_SETTINGS' && targetData && <ServerSettingsModal onClose={onClose} onSubmit={onSubmit} server={targetData} />}
                {type === 'SETTINGS' && currentUser && <UserSettingsModal onClose={onClose} currentUser={currentUser} onSubmit={onSubmit} />}
                {type === 'CREATE_SERVER' && <CreateServerModal onClose={onClose} onSubmit={onSubmit} />}
                {type === 'CREATE_CHANNEL' && <CreateChannelModal onClose={onClose} onSubmit={onSubmit} categoryId={targetData} activeServer={activeServer} />}
                {type === 'CREATE_CATEGORY' && <CreateCategoryModal onClose={onClose} onSubmit={onSubmit} />}
                {type === 'EDIT_CATEGORY' && targetData && <EditCategoryModal onClose={onClose} onSubmit={onSubmit} category={targetData} />}
                {type === 'EDIT_CHANNEL' && targetData && <EditChannelModal onClose={onClose} onSubmit={onSubmit} channel={targetData} activeServer={activeServer} />}
                {type === 'DEVICE_SETTINGS' && <DeviceSettingsModal onClose={onClose} />}
                {type === 'ADD_FRIEND' && <AddFriendModal onClose={onClose} onSubmit={onSubmit} />}
                {type === 'INVITE' && targetData && <InviteModal onClose={onClose} server={targetData} />}
            </div>
        </div>
    );
};

// ... (AddFriendModal, InviteModal, CreateCategoryModal, EditCategoryModal, EditChannelModal, CreateServerModal, CreateChannelModal remain the same)
// Since they are not changed in this logic, I will provide the updated ServerSettingsModal and include the rest as they were to ensure full file integrity or skip if allowed.
// To be safe and follow instructions, I will include the full content of the file with the changes applied.

const AddFriendModal = ({ onClose, onSubmit }: any) => {
    const [id, setId] = useState('');
    return (
        <div className="p-8 bg-v1">
            <h2 className="text-2xl font-bold text-white mb-2">Dodaj znajomego</h2>
            <p className="text-slate-400 text-sm mb-6">Możesz dodać znajomego, wpisując jego identyfikator Cordis (np. <span className="text-white font-mono">użytkownik#2403</span>).</p>
            <div className="space-y-2 mb-8 text-left">
                <input 
                    value={id} 
                    onChange={e => setId(e.target.value)} 
                    className="w-full bg-[#1e1f22] p-4 rounded-xl text-white font-medium outline-none border border-white/5 focus:border-indigo-500/50 transition-all" 
                    placeholder="Wprowadź ID użytkownika..." 
                    autoFocus
                />
            </div>
            <div className="flex justify-end items-center bg-v2 -mx-8 -mb-8 p-4 gap-4">
                <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Anuluj</button>
                <button 
                    onClick={() => id.trim() && onSubmit({ friendId: id })} 
                    className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                >
                    Wyślij zaproszenie
                </button>
            </div>
        </div>
    );
};

const InviteModal = ({ onClose, server }: { onClose: () => void, server: Server }) => {
    const inviteCode = `WAURs9d`; 
    const inviteLink = `https://cordis.gg/${inviteCode}`;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 bg-v1">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Users size={20} className="text-indigo-400" /> Zaproś znajomych do {server?.name || 'Serwer'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">Udostępnij ten link innym, aby mogli dołączyć do Twojego serwera.</p>
            
            <div className="space-y-4">
                <div className="relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Link zaproszenia</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-[#1e1f22] p-3 rounded-xl text-indigo-400 font-bold text-sm border border-white/5 truncate">
                            {inviteLink}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className={`px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                        >
                            {copied ? <Check size={18}/> : 'Kopiuj'}
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">Ten link wygaśnie za 7 dni i ma nieograniczoną liczbę użyć.</p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Zamknij</button>
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

const EditCategoryModal = ({ onClose, onSubmit, category }: any) => {
    const [name, setName] = useState(category?.name || '');
    
    const handleDelete = () => {
        if (confirm("Czy na pewno chcesz usunąć tę kategorię? Wszystkie kanały wewnątrz również zostaną usunięte.")) {
            onSubmit({ id: category.id, _action: 'DELETE' });
        }
    };

    return (
        <div className="p-8 bg-v1">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-white">Edytuj Kategorię</h2>
                 <button onClick={handleDelete} className="text-rose-500 bg-rose-500/10 p-2 rounded hover:bg-rose-500 hover:text-white transition-all">
                     <Trash2 size={20} />
                 </button>
            </div>
            
            <div className="space-y-2 mb-8 text-left">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa kategorii</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none focus:ring-2 ring-indigo-500/20" 
                    placeholder="Nazwa kategorii" 
                />
            </div>
            <div className="flex justify-end items-center bg-v2 -mx-8 -mb-8 p-4 gap-4">
                <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Anuluj</button>
                <button 
                    onClick={() => name.trim() && onSubmit({ id: category.id, name })} 
                    className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all"
                >
                    Zapisz zmiany
                </button>
            </div>
        </div>
    );
};

const EditChannelModal = ({ onClose, onSubmit, channel, activeServer }: { onClose: () => void, onSubmit: (d: any) => void, channel: Channel, activeServer?: Server }) => {
    const [name, setName] = useState(channel?.name || '');
    const [topic, setTopic] = useState(channel?.topic || '');
    const [userLimit, setUserLimit] = useState(channel?.userLimit || 0);
    const [isPrivate, setIsPrivate] = useState(channel?.isPrivate || false);
    const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>(channel?.allowedRoleIds || []);

    if (!channel) return null;

    const toggleRole = (roleId: string) => {
        setAllowedRoleIds(prev => 
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSave = () => {
        onSubmit({ 
            id: channel.id,
            categoryId: channel.categoryId,
            name, 
            topic, 
            userLimit, 
            isPrivate, 
            allowedRoleIds 
        });
    };

    const handleDelete = () => {
        if(confirm("Czy na pewno chcesz usunąć ten kanał?")) {
            onSubmit({ id: channel.id, categoryId: channel.categoryId, _action: 'DELETE' });
        }
    };

    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-60 bg-v2 p-6 shrink-0 border-r border-white/5 flex flex-col justify-between">
                <div>
                    <div className="mb-6 px-4">
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">USTAWIENIA KANAŁU</h3>
                        <p className="text-white font-bold text-sm truncate">#{channel?.name || 'Unknown'}</p>
                    </div>
                    <nav className="space-y-0.5">
                        <NavItem icon={<Sliders size={18}/>} label="Przegląd" active={true} onClick={() => {}} />
                        <NavItem icon={<Shield size={18}/>} label="Uprawnienia" active={false} onClick={() => {}} />
                    </nav>
                </div>
                <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wide"
                >
                    <Trash2 size={16} /> Usuń kanał
                </button>
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
                        {channel.type === ChannelType.VOICE && (
                             <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                                    <span>Limit użytkowników</span>
                                    <span className="text-white">{userLimit === 0 ? "Brak limitu" : `${userLimit} użytkowników`}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="99" 
                                    value={userLimit} 
                                    onChange={(e) => setUserLimit(parseInt(e.target.value))}
                                    className="w-full h-2 bg-[#1e1f22] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                             </div>
                        )}

                        <div className="p-4 bg-[#2b2d31] rounded-xl space-y-4 border border-white/5">
                            <div className="flex items-center justify-between">
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

                            {isPrivate && activeServer && (
                                <div className="pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kto może dołączyć?</label>
                                    <div className="space-y-1">
                                        {activeServer.roles.map((role: Role) => (
                                            <div 
                                                key={role.id}
                                                onClick={() => toggleRole(role.id)}
                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                                                    <span className="text-sm font-medium text-slate-200">{role.name}</span>
                                                </div>
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${allowedRoleIds.includes(role.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                                    {allowedRoleIds.includes(role.id) && <Check size={12} className="text-white" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

const CreateServerModal = ({ onClose, onSubmit }: any) => {
    const [mode, setMode] = useState<'CREATE' | 'JOIN'>('CREATE');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    return (
        <div className="bg-v1 flex flex-col h-full md:h-auto overflow-hidden">
            <div className="p-8 text-center">
                <h2 className="text-2xl font-black text-white mb-2">
                    {mode === 'CREATE' ? "Stwórz swój serwer" : "Dołącz do serwera"}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    {mode === 'CREATE' 
                        ? "Twój serwer to miejsce, gdzie spotkasz się ze znajomymi. Stwórz go i zacznij rozmowę."
                        : "Wpisz zaproszenie poniżej, aby dołączyć do istniejącego serwera."}
                </p>
                
                {mode === 'CREATE' ? (
                    <>
                         <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-500 flex flex-col items-center justify-center text-slate-400 hover:border-white hover:text-white transition-all cursor-pointer bg-[#1e1f22]">
                                <Upload size={24} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase">Ikona</span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-8 text-left">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa serwera</label>
                            <input 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none border border-white/5 focus:border-indigo-500/50" 
                                placeholder="Mój super serwer" 
                            />
                        </div>
                    </>
                ) : (
                    <div className="space-y-2 mb-8 text-left">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Link zaproszenia</label>
                        <input 
                            value={inviteCode} 
                            onChange={e => setInviteCode(e.target.value)} 
                            className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none border border-white/5 focus:border-indigo-500/50" 
                            placeholder="https://cordis.gg/..." 
                        />
                         <p className="text-[10px] text-slate-500 mt-1">
                            Przykłady zaproszeń: <span className="text-slate-400">hTKzmak</span>, <span className="text-slate-400">https://cordis.gg/hTKzmak</span>
                         </p>
                    </div>
                )}
            </div>

            <div className="bg-v2 p-4 flex justify-between items-center mt-auto border-t border-white/5">
                <button onClick={() => setMode(mode === 'CREATE' ? 'JOIN' : 'CREATE')} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider px-4">
                     {mode === 'CREATE' ? "Dołącz do serwera" : "Stwórz serwer"}
                </button>
                <div className="flex items-center gap-4">
                     <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Wróć</button>
                     {mode === 'CREATE' ? (
                         <button 
                             onClick={() => name.trim() && onSubmit({ action: 'CREATE', name, icon: `https://picsum.photos/seed/${name}/200` })} 
                             className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg"
                         >
                             Stwórz
                         </button>
                     ) : (
                         <button 
                             onClick={() => inviteCode.trim() && onSubmit({ action: 'JOIN', inviteCode })} 
                             className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg"
                         >
                             Dołącz
                         </button>
                     )}
                </div>
            </div>
        </div>
    );
};

const CreateChannelModal = ({ onClose, onSubmit, categoryId }: any) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ChannelType>(ChannelType.TEXT);
    const [isPrivate, setIsPrivate] = useState(false);

    return (
        <div className="p-8 bg-v1">
            <h2 className="text-2xl font-bold text-white mb-6">Utwórz Kanał</h2>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Typ kanału</label>
                    <div className="space-y-2">
                        <div 
                            onClick={() => setType(ChannelType.TEXT)}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${type === ChannelType.TEXT ? 'bg-v2 border-indigo-500' : 'bg-[#1e1f22] border-white/5 hover:bg-white/5'}`}
                        >
                            <Hash size={24} className="text-slate-400" />
                            <div>
                                <div className="font-bold text-white">Tekstowy</div>
                                <div className="text-xs text-slate-400">Wysyłaj wiadomości, obrazy i GIFy.</div>
                            </div>
                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === ChannelType.TEXT ? 'border-indigo-500' : 'border-slate-600'}`}>
                                {type === ChannelType.TEXT && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                            </div>
                        </div>
                        <div 
                            onClick={() => setType(ChannelType.VOICE)}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${type === ChannelType.VOICE ? 'bg-v2 border-indigo-500' : 'bg-[#1e1f22] border-white/5 hover:bg-white/5'}`}
                        >
                            <Volume2 size={24} className="text-slate-400" />
                            <div>
                                <div className="font-bold text-white">Głosowy</div>
                                <div className="text-xs text-slate-400">Rozmawiaj głosowo, wideo i udostępniaj ekran.</div>
                            </div>
                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === ChannelType.VOICE ? 'border-indigo-500' : 'border-slate-600'}`}>
                                {type === ChannelType.VOICE && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa kanału</label>
                    <div className="flex items-center bg-[#1e1f22] rounded-lg border border-white/5 focus-within:border-indigo-500/50 transition-all">
                        <div className="pl-3 text-slate-500">
                             {type === ChannelType.TEXT ? <Hash size={16}/> : <Volume2 size={16}/>}
                        </div>
                        <input 
                            value={name} 
                            onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                            className="w-full bg-transparent p-3 text-white font-medium outline-none" 
                            placeholder="nowy-kanał" 
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-300">Kanał prywatny</span>
                    </div>
                    <button 
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`w-10 h-5 rounded-full transition-all relative ${isPrivate ? 'bg-indigo-500' : 'bg-slate-600'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isPrivate ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                </div>
            </div>

            <div className="flex justify-end items-center mt-8 pt-4 border-t border-white/5 gap-4">
                <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Anuluj</button>
                <button 
                    onClick={() => name.trim() && onSubmit({ name, type, categoryId, isPrivate })} 
                    className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all"
                >
                    Utwórz kanał
                </button>
            </div>
        </div>
    );
};

const ServerSettingsModal = ({ onClose, onSubmit, server }: { onClose: () => void, onSubmit: (d: any) => void, server: Server }) => {
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    
    // Używamy lokalnego stanu edycji, aby nie nadpisywać propsów bezpośrednio przed zapisem
    const [editedServer, setEditedServer] = useState<Server>(server);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDeleteServer = () => {
        if (confirm(`Czy na pewno chcesz usunąć serwer ${server.name}? Ta operacja jest nieodwracalna.`)) {
            onSubmit({ id: server.id, _action: 'DELETE_SERVER' });
            onClose();
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setEditedServer(prev => ({ ...prev, icon: base64 }));
        }
    };

    const handleSaveChanges = () => {
        onSubmit(editedServer);
        onClose();
    };

    // Role Management
    const handleCreateRole = () => {
        const newRole: Role = {
            id: 'r-' + Date.now(),
            name: 'nowa rola',
            color: '#94a3b8',
            permissions: [Permission.SEND_MESSAGES],
            position: editedServer.roles.length
        };
        setEditedServer(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
        setSelectedRole(newRole);
    };

    const handleUpdateRole = (roleId: string, updates: Partial<Role>) => {
        setEditedServer(prev => ({
            ...prev,
            roles: prev.roles.map(r => r.id === roleId ? { ...r, ...updates } : r)
        }));
        if (selectedRole && selectedRole.id === roleId) {
            setSelectedRole(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const handleDeleteRole = (roleId: string) => {
        setEditedServer(prev => ({
            ...prev,
            roles: prev.roles.filter(r => r.id !== roleId),
            // Remove role from members
            members: prev.members.map(m => ({
                ...m,
                roleIds: m.roleIds?.filter(id => id !== roleId)
            }))
        }));
        setSelectedRole(null);
    };

    const togglePermission = (role: Role, perm: Permission) => {
        const hasPerm = role.permissions.includes(perm);
        const newPerms = hasPerm 
            ? role.permissions.filter(p => p !== perm) 
            : [...role.permissions, perm];
        handleUpdateRole(role.id, { permissions: newPerms });
    };

    // Member Management
    const toggleMemberRole = (memberId: string, roleId: string) => {
        setEditedServer(prev => ({
            ...prev,
            members: prev.members.map(m => {
                if (m.id !== memberId) return m;
                const roles = m.roleIds || [];
                const hasRole = roles.includes(roleId);
                return {
                    ...m,
                    roleIds: hasRole ? roles.filter(id => id !== roleId) : [...roles, roleId]
                };
            })
        }));
    };

    return (
        <div className="flex h-full w-full bg-v1 text-white animate-in fade-in duration-200">
            <aside className="w-60 bg-[#1e1f22] p-3 shrink-0 flex flex-col justify-between border-r border-white/5">
                <div>
                     <div className="px-3 pt-4 pb-4">
                        <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-widest opacity-80 pl-1">{editedServer.name}</h3>
                    </div>
                    <nav className="space-y-0.5">
                        <NavItem icon={<Settings size={18}/>} label="Przegląd" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
                        <NavItem icon={<Shield size={18}/>} label="Role" active={activeTab === 'ROLES'} onClick={() => { setActiveTab('ROLES'); setSelectedRole(null); }} />
                        <NavItem icon={<Users size={18}/>} label="Członkowie" active={activeTab === 'MEMBERS'} onClick={() => setActiveTab('MEMBERS')} />
                    </nav>
                </div>
                
                 <div className="p-2 border-t border-white/5 space-y-2">
                    <button onClick={handleSaveChanges} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 p-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wide">
                        <Check size={16} /> Zapisz zmiany
                    </button>
                    <button onClick={handleDeleteServer} className="w-full flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 p-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wide">
                        <Trash2 size={16} /> Usuń serwer
                    </button>
                </div>
            </aside>

            <main className="flex-1 bg-v1 flex flex-col relative overflow-hidden">
                <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-white border-2 border-slate-400/20 rounded-full hover:border-white transition-all z-50 group">
                    <X size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black px-2 py-1 rounded text-white pointer-events-none">ESC</span>
                </button>
                
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar no-scrollbar">
                    <div className="max-w-3xl">
                        {activeTab === 'OVERVIEW' && (
                            <div className="animate-in slide-in-from-bottom-4 duration-300">
                                <h2 className="text-2xl font-black text-white mb-8">Przegląd serwera</h2>
                                <div className="flex flex-col md:flex-row gap-10">
                                     <div className="shrink-0 flex flex-col items-center gap-4">
                                         <div className="relative group w-32 h-32">
                                            <img src={editedServer.icon} className="w-full h-full rounded-full object-cover shadow-2xl ring-4 ring-[#1e1f22]" />
                                            <div className="absolute top-0 right-0 bg-indigo-500 rounded-full p-2 shadow-lg">
                                                <ImageIcon size={16} className="text-white" />
                                            </div>
                                            <div 
                                                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <span className="text-[10px] font-black uppercase text-white tracking-wider">Zmień ikonę</span>
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleIconUpload} />
                                         </div>
                                     </div>

                                     <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa serwera</label>
                                            <input 
                                                value={editedServer.name} 
                                                onChange={e => setEditedServer(prev => ({...prev, name: e.target.value}))} 
                                                className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none focus:border-indigo-500 border border-black/20 transition-all" 
                                            />
                                        </div>
                                     </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ROLES' && (
                             <div className="animate-in slide-in-from-bottom-4 duration-300 h-full flex gap-8">
                                {/* Role List */}
                                <div className="w-64 shrink-0 flex flex-col gap-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-black text-white">Role</h2>
                                        <button onClick={handleCreateRole} className="p-1.5 bg-indigo-600 rounded hover:bg-indigo-500 text-white transition-all"><Plus size={16}/></button>
                                    </div>
                                    <div className="space-y-1">
                                        {editedServer.roles.map(role => (
                                            <div 
                                                key={role.id} 
                                                onClick={() => setSelectedRole(role)}
                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${selectedRole?.id === role.id ? 'bg-indigo-600/20 text-white border border-indigo-500/50' : 'text-slate-400 hover:bg-[#1e1f22] hover:text-slate-200'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                                                    <span className="text-xs font-bold truncate">{role.name}</span>
                                                </div>
                                                <ChevronRight size={14} className="opacity-50" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Role Editor */}
                                <div className="flex-1 bg-[#1e1f22] rounded-xl p-6 border border-white/5 overflow-y-auto max-h-[70vh] no-scrollbar">
                                    {selectedRole ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-white uppercase tracking-wider text-xs">Edytuj rolę - {selectedRole.name}</h3>
                                                <button onClick={() => handleDeleteRole(selectedRole.id)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all"><Trash2 size={16}/></button>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa roli</label>
                                                <input 
                                                    value={selectedRole.name} 
                                                    onChange={e => handleUpdateRole(selectedRole.id, { name: e.target.value })} 
                                                    className="w-full bg-black/20 p-3 rounded-lg text-white font-medium outline-none focus:border-indigo-500 border border-transparent" 
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kolor roli</label>
                                                <div className="flex items-center gap-4">
                                                    <input 
                                                        type="color" 
                                                        value={selectedRole.color} 
                                                        onChange={e => handleUpdateRole(selectedRole.id, { color: e.target.value })} 
                                                        className="w-16 h-10 bg-transparent cursor-pointer border-none"
                                                    />
                                                    <span className="text-sm font-mono text-slate-400 uppercase">{selectedRole.color}</span>
                                                </div>
                                            </div>

                                            <div className="h-px bg-white/5 my-4" />
                                            
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Uprawnienia</label>
                                                <div className="space-y-2">
                                                    {PERMISSIONS_LIST.map(perm => (
                                                        <div key={perm.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-white/5">
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-200">{perm.label}</div>
                                                                <div className="text-[10px] text-slate-500">{perm.description}</div>
                                                            </div>
                                                            <button 
                                                                onClick={() => togglePermission(selectedRole, perm.id)}
                                                                className={`w-10 h-5 rounded-full transition-all relative ${selectedRole.permissions.includes(perm.id) ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${selectedRole.permissions.includes(perm.id) ? 'left-5.5' : 'left-0.5'}`} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                                            <Shield size={48} className="mb-4" />
                                            <span className="text-sm font-bold">Wybierz rolę, aby edytować</span>
                                        </div>
                                    )}
                                </div>
                             </div>
                        )}

                        {activeTab === 'MEMBERS' && (
                             <div className="animate-in slide-in-from-bottom-4 duration-300">
                                <h2 className="text-2xl font-black text-white mb-6">Członkowie</h2>
                                <div className="mb-4 relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        placeholder="Szukaj użytkowników..."
                                        className="w-full bg-[#1e1f22] py-2.5 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-slate-600 outline-none border border-white/5 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-1 pb-20">
                                    {editedServer.members.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-[#1e1f22] rounded-xl transition-all group border border-transparent hover:border-white/5">
                                            <div className="flex items-center gap-3">
                                                <img src={member.avatar} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white">{member.username}</span>
                                                        {member.isBot && <span className="text-[9px] bg-indigo-500 text-white px-1 rounded uppercase font-bold">BOT</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {member.roleIds?.map(rid => {
                                                            const r = editedServer.roles.find(role => role.id === rid);
                                                            if(!r) return null;
                                                            return (
                                                                <div key={rid} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: r.color}} />
                                                                    <span className="text-[9px] font-bold text-slate-300">{r.name}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                 <button 
                                                    onClick={() => setEditingMemberId(editingMemberId === member.id ? null : member.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-all"
                                                    title="Zarządzaj rolami"
                                                 >
                                                     <Plus size={16} />
                                                 </button>
                                                 
                                                 {/* Role Assignment Dropdown */}
                                                 {editingMemberId === member.id && (
                                                     <div className="absolute right-0 top-full mt-2 w-48 bg-[#111214] border border-white/10 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95">
                                                         <div className="text-[10px] font-black uppercase text-slate-500 px-2 py-1 mb-1">Przypisz role</div>
                                                         <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                                                             {editedServer.roles.map(role => {
                                                                 const hasRole = member.roleIds?.includes(role.id);
                                                                 return (
                                                                    <button 
                                                                        key={role.id}
                                                                        onClick={() => toggleMemberRole(member.id, role.id)}
                                                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${hasRole ? 'bg-indigo-600/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: role.color}} />
                                                                            <span className="truncate max-w-[100px]">{role.name}</span>
                                                                        </div>
                                                                        {hasRole && <Check size={12} className="text-indigo-400" />}
                                                                    </button>
                                                                 )
                                                             })}
                                                         </div>
                                                     </div>
                                                 )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const UserSettingsModal = ({ onClose, currentUser, onSubmit }: { onClose: () => void, currentUser: User, onSubmit: (d: any) => void }) => {
    // ... (rest of UserSettingsModal code)
    // Assuming unchanged for brevity as per instructions to only return updated files
    // But since this is a monolithic replacement in XML, I must include the rest of the file content correctly.
    // Re-inserting the UserSettingsModal and DeviceSettingsModal logic.

    const [activeTab, setActiveTab] = useState('ACCOUNT');
    const [theme, setTheme] = useState(currentUser.settings.theme);

    // Profile Edit State
    const [pUsername, setPUsername] = useState(currentUser.username);
    const [pAvatar, setPAvatar] = useState(currentUser.avatar || '');
    const [pBanner, setPBanner] = useState(currentUser.bannerColor || '#1a1818');
    const [pAbout, setPAbout] = useState(currentUser.aboutMe || '');
    const [pCustomStatus, setPCustomStatus] = useState(currentUser.customStatus || '');

    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setPAvatar(base64);
        }
    };

    const handleSaveProfile = () => {
        onSubmit({ 
            username: pUsername, 
            avatar: pAvatar, 
            bannerColor: pBanner, 
            aboutMe: pAbout,
            customStatus: pCustomStatus 
        });
        onClose();
    };

    return (
        <div className="flex h-full w-full bg-v1 text-white">
             <aside className="w-60 bg-v2 p-6 shrink-0 border-r border-white/5 flex flex-col justify-between">
                <div>
                     <div className="mb-6 px-4">
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">USTAWIENIA UŻYTKOWNIKA</h3>
                    </div>
                    <nav className="space-y-0.5">
                        <NavItem icon={<Settings size={18}/>} label="Moje konto" active={activeTab === 'ACCOUNT'} onClick={() => setActiveTab('ACCOUNT')} />
                        <NavItem icon={<UserPen size={18}/>} label="Profile" active={activeTab === 'PROFILE'} onClick={() => setActiveTab('PROFILE')} />
                        <NavItem icon={<Palette size={18}/>} label="Wygląd" active={activeTab === 'APPEARANCE'} onClick={() => setActiveTab('APPEARANCE')} />
                        <NavItem icon={<Volume2 size={18}/>} label="Głos i wideo" active={activeTab === 'VOICE'} onClick={() => setActiveTab('VOICE')} />
                    </nav>
                </div>
                <button onClick={onClose} className="flex items-center gap-2 text-slate-400 hover:text-white p-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wide">
                    <LogOut size={16} /> Wyloguj
                </button>
            </aside>
            <main className="flex-1 p-12 overflow-y-auto relative no-scrollbar">
                 <button onClick={onClose} className="fixed top-8 right-8 p-2 text-slate-400 hover:text-white border-2 border-slate-400/20 rounded-full hover:border-white transition-all z-50">
                    <X size={24} />
                </button>

                <div className="max-w-3xl animate-in slide-in-from-bottom-5">
                    {activeTab === 'ACCOUNT' && (
                        <>
                             <h2 className="text-xl font-bold text-white mb-6">Moje konto</h2>
                             <div className="bg-[#1e1f22] rounded-xl overflow-hidden border border-white/5 mb-8">
                                 <div className="h-24" style={{ backgroundColor: pBanner }}></div>
                                 <div className="px-4 pb-4">
                                     <div className="flex justify-between items-end -mt-10 mb-4">
                                         <div className="relative">
                                             <img src={currentUser.avatar} className="w-24 h-24 rounded-full border-[6px] border-[#1e1f22] bg-[#1e1f22] object-cover" />
                                             <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#1e1f22]" />
                                         </div>
                                         <button onClick={() => setActiveTab('PROFILE')} className="bg-indigo-600 px-4 py-2 rounded-md text-white text-xs font-bold hover:bg-indigo-500 transition-all mb-2">Edytuj profil</button>
                                     </div>
                                     <div className="bg-black/20 p-4 rounded-lg">
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-xs font-bold text-slate-400 uppercase">Nazwa użytkownika</span>
                                             <span className="text-sm font-medium text-white">{currentUser.username} <span className="text-slate-500">#{currentUser.discriminator}</span></span>
                                         </div>
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-xs font-bold text-slate-400 uppercase">Email</span>
                                             <span className="text-sm font-medium text-white">{currentUser.settings.email || '*****@gmail.com'} <span className="text-indigo-400 text-xs ml-2 cursor-pointer hover:underline">Odkryj</span></span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                             <span className="text-xs font-bold text-slate-400 uppercase">Telefon</span>
                                             <span className="text-sm font-medium text-white">{currentUser.settings.phone || '*******89'} <span className="text-indigo-400 text-xs ml-2 cursor-pointer hover:underline">Odkryj</span></span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </>
                    )}

                    {activeTab === 'PROFILE' && (
                        <div className="flex flex-col lg:flex-row gap-12">
                             <div className="flex-1 space-y-6">
                                <h2 className="text-xl font-bold text-white mb-2">Profil użytkownika</h2>
                                
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa wyświetlana</label>
                                    <input 
                                        value={pUsername} 
                                        onChange={e => setPUsername(e.target.value)}
                                        className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none border border-white/5 focus:border-indigo-500 transition-all" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Awatar</label>
                                        <button onClick={() => avatarInputRef.current?.click()} className="text-[11px] font-bold text-indigo-400 hover:underline">Zmień awatar</button>
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <img src={pAvatar || currentUser.avatar} className="w-16 h-16 rounded-full object-cover border border-white/10" />
                                        <button onClick={() => setPAvatar('')} className="text-xs text-rose-400 hover:underline">Usuń awatar</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kolor banera</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-8 rounded border border-white/10" style={{ backgroundColor: pBanner }} />
                                        <input 
                                            type="color" 
                                            value={pBanner} 
                                            onChange={e => setPBanner(e.target.value)}
                                            className="bg-transparent border-none w-8 h-8 cursor-pointer" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">O mnie</label>
                                    <textarea 
                                        value={pAbout} 
                                        onChange={e => setPAbout(e.target.value)}
                                        className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none border border-white/5 focus:border-indigo-500 transition-all min-h-[100px] resize-none text-sm" 
                                        placeholder="Napisz coś o sobie..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-end">
                                     <button 
                                        onClick={handleSaveProfile}
                                        className="bg-emerald-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg"
                                     >
                                         Zapisz zmiany
                                     </button>
                                </div>
                             </div>
                             
                             {/* Preview */}
                             <div className="w-[300px] shrink-0">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Podgląd</h3>
                                <div className="bg-[#111214] rounded-xl overflow-hidden shadow-2xl border border-white/5 select-none pointer-events-none transform scale-100">
                                     <div className="h-24 w-full" style={{ backgroundColor: pBanner }} />
                                     <div className="px-4 pb-4 relative">
                                         <div className="absolute -top-10 left-4">
                                             <img src={pAvatar || currentUser.avatar} className="w-20 h-20 rounded-full border-[6px] border-[#111214] bg-[#111214] object-cover" />
                                             <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-[#111214]" />
                                         </div>
                                         <div className="mt-12 bg-[#1e1f22] rounded-lg p-3 border border-white/5">
                                             <h3 className="font-bold text-white text-lg">{pUsername || currentUser.username}</h3>
                                             <p className="text-xs text-slate-400 mb-2">#{currentUser.discriminator}</p>
                                             
                                             <div className="h-px bg-white/5 my-2" />
                                             
                                             <div className="mb-2">
                                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">O MNIE</span>
                                                 <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{pAbout || "Użytkownik Cordis."}</p>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'APPEARANCE' && (
                        <>
                             <h2 className="text-xl font-bold text-white mb-6">Wygląd</h2>
                             <div className="space-y-4">
                                 <div className="flex gap-4">
                                     {[Theme.DARK, Theme.LIGHT, Theme.AMOLED].map(t => (
                                         <div 
                                            key={t}
                                            onClick={() => { setTheme(t); onSubmit({ settings: { ...currentUser.settings, theme: t } }); }}
                                            className={`flex-1 h-32 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center relative overflow-hidden group ${theme === t ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-[#1e1f22]'}`}
                                         >
                                             <span className="font-bold text-slate-300 capitalize z-10">{t}</span>
                                             {theme === t && <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><Check size={12} className="text-white"/></div>}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

const DeviceSettingsModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-60 bg-v2 p-6 shrink-0 border-r border-white/5">
                 <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">USTAWIENIA GŁOSU</h3>
                 <nav className="space-y-0.5">
                    <NavItem icon={<Volume2 size={18}/>} label="Głos i wideo" active={true} onClick={() => {}} />
                 </nav>
            </aside>
            <main className="flex-1 p-12 overflow-y-auto relative">
                <button onClick={onClose} className="fixed top-8 right-8 p-2 text-slate-400 hover:text-white border-2 border-slate-400/20 rounded-full hover:border-white transition-all">
                    <X size={24} />
                </button>
                
                <div className="max-w-2xl space-y-8">
                    <h2 className="text-xl font-bold text-white">Ustawienia głosu</h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Urządzenie wejściowe</label>
                            <select className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none border border-white/5">
                                <option>Default - Microphone (Built-in)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Urządzenie wyjściowe</label>
                            <select className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none border border-white/5">
                                <option>Default - Speakers (Built-in)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Czułość wejścia</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-[#1e1f22] rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[60%]" />
                            </div>
                            <span className="text-xs font-mono text-slate-400">-45dB</span>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5">
                        <h3 className="text-sm font-bold text-white mb-4">Ustawienia wideo</h3>
                        <div className="bg-black aspect-video rounded-xl border border-white/5 flex items-center justify-center text-slate-500 text-sm">
                             Podgląd kamery niedostępny
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
