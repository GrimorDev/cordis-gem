
import React, { useState, useRef, useEffect } from 'react';
import { User, UserStatus, Server } from '../types';
import { MessageSquare, MoreHorizontal, Moon, Minus, Phone, Video, User as UserIcon, UserPlus, Ban, X } from 'lucide-react';
import { getUserRoleColor } from '../utils/helpers';

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  const baseClasses = "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-black flex items-center justify-center transition-all duration-300 shadow-lg";
  
  switch (status) {
    case UserStatus.ONLINE:
      return (
        <div className={`${baseClasses} bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]`} title="Dostępny">
          <div className="w-1.5 h-1.5 bg-emerald-200/40 rounded-full animate-pulse" />
        </div>
      );
    case UserStatus.IDLE:
      return (
        <div className={`${baseClasses} bg-amber-400`} title="Zaraz wracam">
           <div className="absolute inset-0 flex items-center justify-center text-amber-900">
              <Moon size={8} fill="currentColor" strokeWidth={0} className="-rotate-12" />
           </div>
        </div>
      );
    case UserStatus.DND:
      return (
        <div className={`${baseClasses} bg-rose-500`} title="Nie przeszkadzać">
          <div className="w-2 h-[2px] bg-white rounded-full opacity-90" />
        </div>
      );
    case UserStatus.IN_CALL:
      return (
        <div className={`${baseClasses} bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse`} title="W trakcie rozmowy">
           <Phone size={7} fill="white" strokeWidth={0} className="text-white" />
        </div>
      );
    case UserStatus.OFFLINE:
    default:
      return (
        <div className={`${baseClasses} bg-slate-600 border-black ring-1 ring-white/5`} title="Niewidoczny">
           <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
        </div>
      );
  }
};

interface UserMenuProps {
  user: User;
  onClose: () => void;
  onAction?: (action: string) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, onAction }) => {
  return (
    <div className="absolute right-full mr-2 top-0 w-56 bg-[#111214] border border-white/10 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-50 py-2 animate-in fade-in zoom-in-95 slide-in-from-right-2 duration-150">
      <div className="px-3 py-2 border-b border-white/5 mb-1">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Opcje użytkownika</p>
      </div>
      
      <button onClick={() => { onAction?.('PROFILE'); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition-all text-left group">
        <UserIcon size={14} className="text-slate-500 group-hover:text-white" /> Zobacz profil
      </button>
      
      <button onClick={() => { onAction?.('MESSAGE'); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition-all text-left group">
        <MessageSquare size={14} className="text-slate-500 group-hover:text-white" /> Napisz wiadomość
      </button>

      <div className="h-px bg-white/5 my-1" />

      <button onClick={() => { onAction?.('CALL_VOICE'); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition-all text-left group">
        <Phone size={14} className="text-slate-500 group-hover:text-white" /> Połączenie głosowe
      </button>
      
      <button onClick={() => { onAction?.('CALL_VIDEO'); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition-all text-left group">
        <Video size={14} className="text-slate-500 group-hover:text-white" /> Połączenie wideo
      </button>

      <div className="h-px bg-white/5 my-1" />

      <button onClick={() => { onAction?.('ADD_FRIEND'); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all text-left group">
        <UserPlus size={14} className="text-emerald-500 group-hover:text-white" /> Dodaj do znajomych
      </button>
      
      <button onClick={() => { onAction?.('BLOCK'); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-600 hover:text-white transition-all text-left group">
        <Ban size={14} className="text-rose-500 group-hover:text-white" /> Zablokuj
      </button>
    </div>
  );
};

const UserItem: React.FC<{ user: User; server?: Server; onUserAction?: (user: User, action: string) => void }> = ({ user, server, onUserAction }) => {
  const roleColor = getUserRoleColor(user, server);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  return (
    <div 
      className="flex items-center gap-4 px-6 py-4 hover:bg-white/10 hover:scale-[1.02] cursor-pointer group transition-all duration-200 ease-out rounded-2xl mx-2 mb-1 border border-transparent hover:border-white/10 active:scale-[0.98] relative shadow-sm hover:shadow-lg"
      onContextMenu={(e) => {
        e.preventDefault();
        setIsMenuOpen(true);
      }}
    >
      <div className="relative shrink-0">
        <div className="relative">
          <img 
            src={user.avatar} 
            className={`w-11 h-11 rounded-xl object-cover shadow-2xl border border-white/10 transition-transform duration-300 group-hover:scale-105 ${user.status === UserStatus.OFFLINE ? 'grayscale opacity-60' : ''}`} 
            alt={user.username} 
          />
          <StatusBadge status={user.status} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
            <h4 
              className={`font-black text-[13px] truncate tracking-tight transition-colors ${user.status === UserStatus.OFFLINE ? 'opacity-50' : ''}`}
              style={{ color: roleColor || 'var(--text-main)' }}
            >
              {user.username}
            </h4>
            <div className="flex items-center gap-2">
               {user.isBot && (
                 <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 rounded uppercase font-black tracking-tighter">Bot</span>
               )}
               <div className="relative" ref={menuRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-white"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {isMenuOpen && <UserMenu user={user} onClose={() => setIsMenuOpen(false)} onAction={(action) => onUserAction?.(user, action)} />}
               </div>
            </div>
        </div>
        <p className="text-[10px] text-slate-500 font-black truncate tracking-widest uppercase opacity-60 mt-0.5">
          {user.customStatus ? user.customStatus : (user.status === UserStatus.IN_CALL ? "W trakcie rozmowy" : user.isBot ? "Neural Network" : user.id === 'u1' ? "System Admin" : "W Cordis")}
        </p>
      </div>
    </div>
  );
};

export const UserList: React.FC<UserListProps> = ({ members, server, onUserAction }) => {
  const onlineMembers = members.filter(m => m.status !== UserStatus.OFFLINE);
  const offlineMembers = members.filter(m => m.status === UserStatus.OFFLINE);

  return (
    <div className="py-6 bg-black h-full overflow-y-auto no-scrollbar border-l border-white/5">
      <div className="px-8 mb-8 flex items-center justify-between text-slate-600">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Użytkownicy</span>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-widest">{onlineMembers.length} aktywnych</span>
        </div>
      </div>

      <div className="mb-10">
        <div className="px-8 mb-4 flex items-center gap-4">
            <span className="text-[9px] font-black text-indigo-500/80 uppercase tracking-widest shrink-0">Dostępni</span>
            <div className="w-full h-[1px] bg-gradient-to-r from-indigo-500/20 to-transparent" />
        </div>
        {onlineMembers.map(user => <UserItem key={user.id} user={user} server={server} onUserAction={onUserAction} />)}
      </div>

      {offlineMembers.length > 0 && (
        <div>
          <div className="px-8 mb-4 flex items-center gap-4">
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest shrink-0">Niedostępni</span>
              <div className="w-full h-[1px] bg-gradient-to-r from-slate-500/10 to-transparent" />
          </div>
          {offlineMembers.map(user => <UserItem key={user.id} user={user} server={server} onUserAction={onUserAction} />)}
        </div>
      )}
    </div>
  );
};

interface UserListProps {
  members: User[];
  server?: Server;
  onUserAction?: (user: User, action: string) => void;
}
