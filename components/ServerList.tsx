import React from 'react';
import { Plus, Search, MessageSquare, Sparkles } from 'lucide-react';
import { Server } from '../types';

interface ServerListProps {
  servers: Server[];
  activeServerId: string | 'DM';
  onSwitchServer: (id: string | 'DM') => void;
  onAddServer: () => void;
}

export const ServerList: React.FC<ServerListProps> = ({ servers, activeServerId, onSwitchServer, onAddServer }) => {
  return (
    <nav className="h-[64px] w-full bg-v1 border-b border-white/5 flex items-center px-4 gap-4 shrink-0 overflow-x-auto no-scrollbar z-20">
      {/* DM / Home Action */}
      <div 
        onClick={() => onSwitchServer('DM')}
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
            activeServerId === 'DM' 
            ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
            : 'bg-v2 border-white/5 text-slate-400 hover:text-white hover:bg-v3'
        }`}
        title="Prywatne wiadomości"
      >
        <MessageSquare size={20} />
      </div>

      <div className="h-6 w-[1px] bg-white/10 shrink-0 mx-1" />

      <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
        {servers.map((server) => (
          <div 
            key={server.id} 
            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              activeServerId === server.id 
              ? 'bg-indigo-600/10 border-indigo-500/50' 
              : 'bg-v2/50 border-white/5 hover:border-white/10 hover:bg-v2'
            }`} 
            onClick={() => onSwitchServer(server.id)}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-lg">
              <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
            </div>
            <span className={`text-[11px] font-black truncate max-w-[120px] tracking-tight ${activeServerId === server.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {server.name}
            </span>
            {activeServerId === server.id && (
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            )}
          </div>
        ))}

        <button 
            onClick={onAddServer}
            className="w-8 h-8 shrink-0 bg-v2 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-v3 border border-white/5 transition-all"
            title="Dodaj serwer"
          >
            <Plus size={18} />
        </button>
      </div>

      <div className="hidden sm:flex items-center gap-3 ml-4">
         <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
                placeholder="Szukaj..." 
                className="bg-v2/50 border border-white/5 rounded-lg py-1.5 pl-9 pr-3 text-[11px] font-bold outline-none focus:border-indigo-500/50 w-32 md:w-48 transition-all text-white placeholder:text-slate-600"
            />
         </div>
         <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 cursor-pointer hover:bg-indigo-600/30">
            {/* Added Sparkles import to fix the error */}
            <Sparkles size={16} />
         </div>
      </div>
    </nav>
  );
};