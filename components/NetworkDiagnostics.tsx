
import React, { useState, useEffect } from 'react';

interface NetworkInfo {
  ip: string;
  status: 'online' | 'offline';
  type: string;
  latency: number | null;
  downlink: number | null;
}

const NetworkDiagnostics: React.FC = () => {
  const [info, setInfo] = useState<NetworkInfo>({
    ip: 'Đang tải...',
    status: navigator.onLine ? 'online' : 'offline',
    type: 'N/A',
    latency: null,
    downlink: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDiagnostics = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    
    try {
      // Fetch Public IP
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      
      const end = performance.now();
      
      // Get connection info (Chrome/Edge/Opera supported)
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setInfo({
        ip: ipData.ip,
        status: navigator.onLine ? 'online' : 'offline',
        type: conn?.effectiveType || 'N/A',
        latency: Math.round(end - start),
        downlink: conn?.downlink || null
      });
    } catch (error) {
      setInfo(prev => ({ ...prev, ip: 'Lỗi kết nối', status: 'offline' }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    
    const handleStatus = () => setInfo(prev => ({ ...prev, status: navigator.onLine ? 'online' : 'offline' }));
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-network-wired text-emerald-400"></i> Chẩn Đoán Mạng
        </h3>
        <button 
          onClick={fetchDiagnostics}
          disabled={isRefreshing}
          className={`text-slate-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}
        >
          <i className="fas fa-sync-alt text-xs"></i>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Public IP</p>
          <p className="text-sm font-mono text-emerald-400 truncate">{info.ip}</p>
        </div>
        
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Trạng Thái</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${info.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></span>
            <span className={`text-sm font-bold ${info.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
              {info.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Loại Mạng</p>
          <p className="text-sm font-mono text-blue-400 uppercase">{info.type}</p>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Độ Trễ (Ping)</p>
          <p className="text-sm font-mono text-orange-400">
            {info.latency ? `${info.latency}ms` : '---'}
          </p>
        </div>
      </div>

      {info.downlink && (
        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 bg-slate-900/30 px-3 py-2 rounded-lg">
          <span className="flex items-center gap-2">
            <i className="fas fa-download text-blue-500/50"></i>
            Tốc độ tải xuống: <span className="text-slate-300">{info.downlink} Mbps</span>
          </span>
          <span className="italic">Thời gian thực</span>
        </div>
      )}
    </div>
  );
};

export default NetworkDiagnostics;
