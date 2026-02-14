import React from 'react';
import { User, UserStatus, Server } from '../types';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import { getUserRoleColor } from '../utils/helpers';

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  switch (status) {
    case UserStatus.ONLINE:
      return (
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-black bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Dostępny" />
      );
    case UserStatus.IDLE:
      return (
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-black bg-amber-400" title="Zaraz wracam">
           <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-black rounded-full -translate-x-0.5 -translate-y-0.5 opacity-40" />
        </div>
      );
    case UserStatus.DND:
      return (
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-black bg-rose-500 flex items-center justify-center" title="Nie przeszkadzać">
          <div className="w-1.5 h-[2px] bg-white rounded-full" />
        </div>
      );
    case UserStatus.OFFLINE:
    default:
      return (
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-black bg-slate-600" title="Niewidoczny" />
      );
  }
};

const UserItem: React.FC<{ user: User; server?: Server }> = ({ user, server }) => {
  const roleColor = getUserRoleColor(user, server);
  
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 cursor-pointer group transition-all rounded-2xl mx-2 mb-1 border border-transparent hover:border-white/5">
      <div className="relative shrink-0">
        <img src={user.avatar} className="w-11 h-11 rounded-xl object-cover shadow-2xl border border-white/10" alt={user.username} />
        <StatusBadge status={user.status} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
            <h4 
              className="font-black text-[13px] truncate tracking-tight"
              style={{ color: roleColor || 'var(--text-main)' }}
            >
              {user.username}
            </h4>
            <MessageSquare size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[10px] text-slate-500 font-black truncate tracking-widest uppercase opacity-60 mt-0.5">
          {user.isBot ? "Neural Network" : user.id === 'u1' ? "System Admin" : "Playing Cordis v2.0"}
        </p>
      </div>
    </div>
  );
};

export const UserList: React.FC<UserListProps> = ({ members, server }) => {
  const onlineMembers = members.filter(m => m.status !== UserStatus.OFFLINE);
  const offlineMembers = members.filter(m => m.status === UserStatus.OFFLINE);

  return (
    <div className="py-6 bg-black h-full overflow-y-auto no-scrollbar">
      <div className="px-8 mb-8 flex items-center justify-between text-slate-600">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Użytkownicy</span>
        <MoreHorizontal size={16} className="cursor-pointer hover:text-white" />
      </div>

      <div className="mb-10">
        <div className="px-8 mb-4 flex items-center gap-4">
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest shrink-0">Dostępni — {onlineMembers.length}</span>
            <div className="w-full h-[1px] bg-white/5" />
        </div>
        {onlineMembers.map(user => <UserItem key={user.id} user={user} server={server} />)}
      </div>

      {offlineMembers.length > 0 && (
        <div>
          <div className="px-8 mb-4 flex items-center gap-4">
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest shrink-0">Offline — {offlineMembers.length}</span>
              <div className="w-full h-[1px] bg-white/5" />
          </div>
          {offlineMembers.map(user => <UserItem key={user.id} user={user} server={server} />)}
        </div>
      )}
    </div>
  );
};

interface UserListProps {
  members: User[];
  server?: Server;
}
