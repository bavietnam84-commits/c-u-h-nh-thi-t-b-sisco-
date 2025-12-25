
import React, { useState } from 'react';
import { DeviceType, DeviceHealth, ConnectionStatus } from '../types';
import { getDeviceHealthAdvice } from '../services/geminiService';

interface DeviceHealthCheckProps {
  deviceType: DeviceType;
  connectionStatus: ConnectionStatus;
}

const DeviceHealthCheck: React.FC<DeviceHealthCheckProps> = ({ deviceType, connectionStatus }) => {
  const [health, setHealth] = useState<DeviceHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runHealthCheck = async () => {
    if (connectionStatus !== 'CONNECTED') return;

    setIsChecking(true);
    // Simulate initial scan latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate simulated metrics
    const mockCpu = Math.floor(Math.random() * 40) + 5; // 5-45%
    const mockMem = Math.floor(Math.random() * 30) + 20; // 20-50%
    const mockTemp = Math.floor(Math.random() * 15) + 35; // 35-50°C
    
    const advice = await getDeviceHealthAdvice(deviceType, { cpu: mockCpu, memory: mockMem, temp: mockTemp });

    setHealth({
      cpu: mockCpu,
      memory: mockMem,
      temp: mockTemp,
      uptime: "14 days, 03:22:11",
      status: mockCpu > 80 || mockTemp > 70 ? 'Warning' : 'Healthy',
      logs: advice
    });
    setIsChecking(false);
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-heartbeat text-red-500"></i> Health Check
        </h3>
        <button 
          onClick={runHealthCheck}
          disabled={isChecking || connectionStatus !== 'CONNECTED'}
          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
            connectionStatus !== 'CONNECTED' 
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
            : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20'
          }`}
        >
          {isChecking ? <><i className="fas fa-spinner animate-spin"></i> Analyzing...</> : <><i className="fas fa-search"></i> Run Diagnostics</>}
        </button>
      </div>

      {!health && !isChecking ? (
        <div className="py-4 text-center opacity-40">
          <p className="text-xs italic">Run diagnostics to see device performance metrics.</p>
        </div>
      ) : isChecking ? (
        <div className="space-y-4 py-2">
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[shimmer_2s_infinite] w-full"></div>
          </div>
          <p className="text-[10px] text-center text-slate-500 animate-pulse">Scanning system registers and memory pools...</p>
        </div>
      ) : health && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">CPU Load</p>
              <div className="flex items-end justify-between">
                <span className="text-lg font-mono text-blue-400">{health.cpu}%</span>
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-blue-500" style={{ width: `${health.cpu}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Memory</p>
              <div className="flex items-end justify-between">
                <span className="text-lg font-mono text-emerald-400">{health.memory}%</span>
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-emerald-500" style={{ width: `${health.memory}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Temp</p>
              <span className="text-lg font-mono text-orange-400">{health.temp}°C</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-clipboard-list text-[10px] text-slate-500"></i>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Diagnostic Insight</span>
            </div>
            <ul className="space-y-2">
              {health.logs.map((log, i) => (
                <li key={i} className="flex gap-2 text-[11px] text-slate-300">
                  <span className="text-blue-500">›</span> {log}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default DeviceHealthCheck;
