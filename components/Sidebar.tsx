
import React from 'react';
import { DeviceType, ConnectionStatus } from '../types';

interface SidebarProps {
  activeDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  connections: Record<DeviceType, ConnectionStatus>;
  onConnect: (type: DeviceType) => void;
  onOpenGuide: () => void;
}

const CiscoLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="32" width="6" height="18" rx="3" fill="currentColor" />
    <rect x="22" y="22" width="6" height="28" rx="3" fill="currentColor" />
    <rect x="34" y="12" width="6" height="38" rx="3" fill="currentColor" />
    <rect x="46" y="2" width="6" height="48" rx="3" fill="currentColor" />
    <rect x="58" y="12" width="6" height="38" rx="3" fill="currentColor" />
    <rect x="70" y="22" width="6" height="28" rx="3" fill="currentColor" />
    <rect x="82" y="32" width="6" height="18" rx="3" fill="currentColor" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ activeDevice, onDeviceChange, connections, onConnect, onOpenGuide }) => {
  const menuItems = [
    { type: DeviceType.SWITCH, icon: 'fa-server', label: 'Switch (IOS)' },
    { type: DeviceType.FIREWALL, icon: 'fa-shield-halved', label: 'Firewall (ASA)' },
    { type: DeviceType.WIFI, icon: 'fa-wifi', label: 'WiFi (WLC/AP)' },
    { type: DeviceType.MODEM, icon: 'fa-tower-broadcast', label: 'Modem (Router)' }
  ];

  return (
    <aside className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-all">
      <div className="p-6 flex items-center gap-4">
        <div className="flex-shrink-0 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
          <CiscoLogo className="w-10 h-8" />
        </div>
        <div className="hidden lg:block">
          <h2 className="text-xl font-black text-white leading-none tracking-tighter italic">CISCO<span className="text-blue-500">AI</span></h2>
          <p className="text-[9px] text-slate-500 font-bold mt-1 tracking-[0.2em] uppercase">Enterprise Pro</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <div key={item.type} className="space-y-1">
            <button
              onClick={() => onDeviceChange(item.type)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all group ${
                activeDevice === item.type 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fas ${item.icon} w-5 text-center ${activeDevice === item.type ? 'text-blue-500' : 'text-slate-500'}`}></i>
                <span className="hidden lg:block font-medium text-sm">{item.label}</span>
              </div>
              <div className={`w-2 h-2 rounded-full hidden lg:block ${
                connections[item.type] === 'CONNECTED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                connections[item.type] === 'CONNECTING' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-700'
              }`}></div>
            </button>
            
            {activeDevice === item.type && (
              <div className="hidden lg:block px-2 pb-2">
                <button
                  onClick={() => onConnect(item.type)}
                  disabled={connections[item.type] === 'CONNECTING'}
                  className={`w-full py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    connections[item.type] === 'CONNECTED' 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                    : connections[item.type] === 'CONNECTING'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                  }`}
                >
                  {connections[item.type] === 'CONNECTED' ? (
                    <><i className="fas fa-unlink"></i> Disconnect</>
                  ) : connections[item.type] === 'CONNECTING' ? (
                    <><i className="fas fa-sync fa-spin"></i> Linking...</>
                  ) : (
                    <><i className="fas fa-link"></i> Connect Device</>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-900 space-y-4">
        <button 
          onClick={onOpenGuide}
          className="flex w-full items-center justify-center lg:justify-start gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all group"
          title="Hướng dẫn sử dụng"
        >
          <i className="fas fa-circle-question text-blue-400 group-hover:scale-110 transition-transform text-lg lg:text-base"></i>
          <span className="text-sm font-medium hidden lg:block">Hướng dẫn sử dụng</span>
        </button>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 hidden lg:block">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-bold">System Health</p>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span>Core Engine</span>
            <span className="text-green-500 font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span>Security Module</span>
            <span className="text-blue-400 font-bold">LOCKED</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="w-[85%] h-full bg-blue-500"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
