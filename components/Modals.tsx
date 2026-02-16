
import React, { useState, useRef } from 'react';
import { 
  X, Shield, Users, Plus, Check, ChevronRight, 
  Ban, UserMinus, Settings, Bell, Upload, Video, VideoOff,
  Lock, Palette, Monitor, LogOut, Trash2, Volume2, Globe, Hash, Layers, Sliders, Trash, ChevronLeft, AlertCircle, Play, Music, UserPlus, Sparkles, Layout, Link as LinkIcon, Search, ArrowUpDown, UserPen, Image as ImageIcon
} from 'lucide-react';
import { ModalType, ChannelType, User, Server, Theme, Channel, Role, Permission } from '../types';
import { fileToBase64 } from '../utils/helpers';

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
    const [name, setName] = useState('');
    return (
        <div className="p-8 bg-v1 text-center">
            <h2 className="text-2xl font-black text-white mb-2">Stwórz swój serwer</h2>
            <p className="text-slate-400 text-sm mb-6">Twój serwer to miejsce, gdzie spotkasz się ze znajomymi. Stwórz go i zacznij rozmowę.</p>
            
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
            
            <div className="flex justify-between items-center bg-v2 -mx-8 -mb-8 p-4">
                <button onClick={onClose} className="text-white text-sm font-bold hover:underline">Wróć</button>
                <button 
                    onClick={() => name.trim() && onSubmit({ name, icon: `https://picsum.photos/seed/${name}/200` })} 
                    className="bg-indigo-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg"
                >
                    Stwórz
                </button>
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
    const [name, setName] = useState(server.name);
    
    const handleDelete = () => {
        if (confirm(`Czy na pewno chcesz usunąć serwer ${server.name}? Ta operacja jest nieodwracalna.`)) {
            onSubmit({ id: server.id, _action: 'DELETE_SERVER' });
        }
    };

    return (
        <div className="flex h-full w-full bg-v1">
            <aside className="w-60 bg-v2 p-6 shrink-0 border-r border-white/5 flex flex-col justify-between">
                <div>
                     <div className="mb-6 px-4">
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">{server.name}</h3>
                    </div>
                    <nav className="space-y-0.5">
                        <NavItem icon={<Settings size={18}/>} label="Przegląd" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
                        <NavItem icon={<Shield size={18}/>} label="Role" active={activeTab === 'ROLES'} onClick={() => setActiveTab('ROLES')} />
                        <NavItem icon={<Users size={18}/>} label="Członkowie" active={activeTab === 'MEMBERS'} onClick={() => setActiveTab('MEMBERS')} />
                    </nav>
                </div>
                <button onClick={handleDelete} className="flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wide">
                    <Trash2 size={16} /> Usuń serwer
                </button>
            </aside>
            <main className="flex-1 p-12 overflow-y-auto relative">
                <button onClick={onClose} className="fixed top-8 right-8 p-2 text-slate-400 hover:text-white border-2 border-slate-400/20 rounded-full hover:border-white transition-all">
                    <X size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 hover:opacity-100">ESC</span>
                </button>
                
                <div className="max-w-2xl">
                    <h2 className="text-xl font-bold text-white mb-8">Przegląd serwera</h2>
                    <div className="flex gap-8">
                         <div className="shrink-0 flex flex-col items-center gap-2">
                             <div className="relative group">
                                <img src={server.icon} className="w-24 h-24 rounded-full object-cover shadow-2xl" />
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                    <span className="text-[10px] font-black uppercase text-white">Zmień</span>
                                </div>
                             </div>
                         </div>
                         <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nazwa serwera</label>
                                <input 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full bg-[#1e1f22] p-3 rounded-lg text-white font-medium outline-none focus:border-indigo-500 border border-transparent transition-all" 
                                />
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                 <button 
                                    onClick={() => onSubmit({ ...server, name })}
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg"
                                 >
                                     Zapisz zmiany
                                 </button>
                            </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const UserSettingsModal = ({ onClose, currentUser, onSubmit }: { onClose: () => void, currentUser: User, onSubmit: (d: any) => void }) => {
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
        // Opcjonalnie zamknij modal lub pokaż komunikat sukcesu
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
