
import React, { useState } from 'react';
import { User, UserStatus } from '../types';
import { ChevronRight, Phone, Video, MoreHorizontal, ShieldCheck } from 'lucide-react';

interface UserProfileSidebarProps {
  user: User;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export const UserProfileSidebar: React.FC<UserProfileSidebarProps> = ({ user, onCall, onVideoCall }) => {
  const [note, setNote] = useState('');

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
        case UserStatus.ONLINE: return 'bg-emerald-500';
        case UserStatus.IDLE: return 'bg-amber-400';
        case UserStatus.DND: return 'bg-rose-500';
        case UserStatus.OFFLINE: return 'bg-slate-500';
        default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: UserStatus) => {
      switch (status) {
          case UserStatus.ONLINE: return 'Dostępny';
          case UserStatus.IDLE: return 'Zaraz wracam';
          case UserStatus.DND: return 'Nie przeszkadzać';
          case UserStatus.OFFLINE: return 'Niewidoczny';
      }
  };

  return (
    <div className="w-[320px] bg-v1 border-l border-white/5 h-full flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300 z-10">
      
      {/* Banner Area */}
      <div className="relative shrink-0">
        <div className={`h-28 w-full ${user.isBot ? 'bg-indigo-700' : 'bg-[#1a1818]'}`} />
        <div className="absolute -bottom-10 left-4 p-1 bg-v1 rounded-full shadow-2xl">
          <div className="relative">
            <img src={user.avatar} className="w-20 h-20 rounded-full object-cover border-4 border-v1" alt={user.username} />
            <div className={`absolute bottom-1 right-1 w-6 h-6 border-[4px] border-v1 rounded-full ${getStatusColor(user.status)}`} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 px-4 flex gap-2">
         <button 
          onClick={onCall}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-black transition-all shadow-lg shadow-indigo-600/20"
         >
            <Phone size={14} fill="currentColor" /> Zadzwoń
         </button>
         <button 
          onClick={onVideoCall}
          className="flex-1 flex items-center justify-center gap-2 bg-v2 hover:bg-v3 text-white py-2 rounded-lg text-xs font-black transition-all border border-white/5"
         >
            <Video size={14} fill="currentColor" /> Wideo
         </button>
         <button className="p-2 bg-v2 hover:bg-v3 text-v-muted rounded-lg border border-white/5">
            <MoreHorizontal size={18} />
         </button>
      </div>

      <div className="px-4 pb-8 mt-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                    {user.username}
                    {user.isBot && <ShieldCheck size={16} className="text-indigo-400" />}
                </h2>
                <span className="text-v-muted text-sm font-bold opacity-40">#{user.discriminator}</span>
            </div>
            {user.isBot && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest inline-block mb-3">AI Model</span>}
            
            <div className="h-px bg-white/5 my-4" />

            <div className="space-y-4">
                <div>
                    <div className="text-[10px] text-v-muted mb-1.5 font-black uppercase tracking-widest opacity-60">O mnie</div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {user.isBot 
                          ? "Jestem Twoim osobistym asystentem AI Cordis. Potrafię analizować pliki, generować odpowiedzi i pomagać Ci w codziennych zadaniach na serwerze."
                          : "Użytkownik Cordis. Brak opisu profilu."}
                    </p>
                </div>

                <div>
                    <div className="text-[10px] text-v-muted mb-1.5 font-black uppercase tracking-widest opacity-60">Członek od</div>
                    <div className="text-sm text-white font-medium">17 stycznia 2026</div>
                </div>

                <div>
                    <div className="text-[10px] text-v-muted mb-1.5 font-black uppercase tracking-widest opacity-60">Notatka</div>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Kliknij, aby dodać notatkę..."
                        className="w-full bg-v1/50 text-xs text-slate-300 placeholder:text-slate-600 outline-none resize-none h-auto min-h-[40px] p-2 rounded-lg border border-white/5 focus:border-indigo-500/30 transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Shared Servers */}
        <div>
             <div className="flex items-center justify-between mb-3 group cursor-pointer">
                <div className="text-[10px] text-v-muted font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Wspólne serwery — 1</div>
                <ChevronRight size={14} className="text-v-muted" />
             </div>
             <div className="flex items-center gap-3 p-3 bg-v2/30 hover:bg-v2/50 rounded-xl cursor-pointer transition-all border border-white/5">
                 <img src="https://picsum.photos/seed/react/100" className="w-9 h-9 rounded-lg" alt="Server" />
                 <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white truncate">React Developers</div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">System Admin</div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};
