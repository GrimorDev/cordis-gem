
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
    <nav className="h-[72px] w-full bg-v1/80 backdrop-blur-xl border-b border-white/5 flex items-center px-6 gap-2 shrink-0 z-50 sticky top-0 shadow-2xl">
      {/* DM / Home Action */}
      <div className="relative group mr-2">
        <div 
          onClick={() => onSwitchServer('DM')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer border active:scale-90 shadow-lg ${
              activeServerId === 'DM' 
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/40 rounded-xl' 
              : 'bg-v2 border-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-400 hover:rounded-xl group-hover:shadow-indigo-600/20'
          }`}
          title="Prywatne wiadomości"
        >
          <MessageSquare size={22} className="transition-transform group-hover:scale-110" />
        </div>
        {activeServerId === 'DM' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-fade-in" />
        )}
      </div>

      <div className="h-8 w-[1px] bg-white/10 shrink-0 mx-2" />

      {/* Servers Container */}
      <div className="flex items-center gap-3 flex-1 overflow-x-auto no-scrollbar scroll-smooth py-2">
        {servers.map((server) => (
          <div key={server.id} className="relative group shrink-0">
            <div 
              className={`flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-95 group-hover:translate-y-[-2px] ${
                activeServerId === server.id 
                ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-black/20' 
                : 'bg-v2/40 border-white/5 hover:border-white/20 hover:bg-v2 shadow-sm'
              }`} 
              onClick={() => onSwitchServer(server.id)}
            >
              <div className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-inner transition-all duration-300 ${activeServerId === server.id ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-v1' : 'group-hover:rounded-lg'}`}>
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <span className={`text-[12px] font-black truncate max-w-[140px] tracking-tight transition-colors ${activeServerId === server.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {server.name}
              </span>
            </div>
            
            {activeServerId === server.id && (
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)] animate-fade-in" />
            )}
          </div>
        ))}

        {/* Add Server Button */}
        <button 
            onClick={onAddServer}
            className="w-10 h-10 shrink-0 bg-v2/30 rounded-2xl flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:rotate-90 active:scale-90"
            title="Dodaj serwer"
          >
            <Plus size={20} />
        </button>
      </div>

      {/* Right Side Actions */}
      <div className="hidden lg:flex items-center gap-4 ml-6">
         <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
                placeholder="Szukaj wszędzie..." 
                className="bg-v2/60 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-[12px] font-bold outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 w-48 xl:w-64 transition-all text-white placeholder:text-slate-600 shadow-inner"
            />
         </div>
         
         <button className="w-11 h-11 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 cursor-pointer hover:bg-indigo-600 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 group">
            <Sparkles size={20} className="group-hover:animate-spin-slow transition-transform" />
         </button>
      </div>
    </nav>
  );
};
