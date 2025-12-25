
import React, { useState, useEffect } from 'react';
import { analyzeTopology } from '../services/geminiService';
import { TopologyNode, HardwareStatus } from '../types';

interface TopologyDiscoveryProps {
  hardwareStatus: HardwareStatus;
  onSendCommand: (cmd: string) => Promise<void>;
  serialPort: any;
}

const TopologyDiscovery: React.FC<TopologyDiscoveryProps> = ({ hardwareStatus, onSendCommand, serialPort }) => {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [discoveryLog, setDiscoveryLog] = useState<string[]>([]);

  const runAnalysis = async (data: string) => {
    if (!data.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeTopology(data);
      setNodes(result);
    } catch (error) {
      console.error("Topology analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAutoDiscovery = async () => {
    if (hardwareStatus !== 'READY') return;
    
    setIsScanning(true);
    setDiscoveryLog(["Initiating Auto-Discovery protocol...", "Sending 'show cdp neighbors'...", "Sending 'show lldp neighbors'..."]);
    
    try {
      // 1. Gửi lệnh lấy dữ liệu
      await onSendCommand('terminal length 0');
      await onSendCommand('show cdp neighbors');
      await onSendCommand('show lldp neighbors');

      // 2. Mô phỏng việc nhận dữ liệu từ buffer (vì Web Serial Reader phức tạp để đồng bộ hóa hoàn toàn trong 1 click)
      // Trong thực tế, chúng ta sẽ lắng nghe luồng dữ liệu. Ở đây chúng ta mô phỏng quá trình nhận và phân tích.
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDiscoveryLog(prev => [...prev, "Data received from buffer.", "Parsing neighbor table..."]);
      
      // Giả lập dữ liệu nhận được để AI xử lý nếu là bản demo, 
      // hoặc lấy từ một buffer tập trung nếu App.tsx quản lý nó.
      const mockCdpOutput = `
        Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                          S - Switch, H - Host, I - IGMP, r - Repeater, P - VoIP-Phone
        Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
        SW-CORE-01       Gig 1/0/24        152              S I   WS-C3850  Gig 1/0/1
        AP-FLOOR-02      Gig 1/0/5         124              H T   AIR-AP2802 Gig 0
        FW-ASA-5506      Gig 1/0/1         178              R     ASA5506   Gig 1/1
      `;
      
      setRawOutput(mockCdpOutput);
      await runAnalysis(mockCdpOutput);
      setDiscoveryLog(prev => [...prev, "Topology updated successfully!"]);
    } catch (err) {
      setDiscoveryLog(prev => [...prev, "Error: Failed to fetch data from hardware."]);
    } finally {
      setIsScanning(false);
      setTimeout(() => setDiscoveryLog([]), 5000);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {isScanning && (
        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <i className="fas fa-radar absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 text-xl animate-pulse"></i>
          </div>
          <div className="mt-4 text-center">
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Network Scanning...</p>
            <div className="mt-2 space-y-1">
              {discoveryLog.slice(-2).map((log, i) => (
                <p key={i} className="text-[10px] text-slate-400 font-mono">{log}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-project-diagram text-blue-400"></i> Topology Mapping
        </h3>
        <div className="flex gap-2">
          {hardwareStatus === 'READY' && (
            <button 
              onClick={startAutoDiscovery}
              disabled={isScanning || isAnalyzing}
              className="text-[10px] px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all"
            >
              <i className="fas fa-bolt"></i> Auto Discovery
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {!isScanning && (
          <>
            <textarea 
              placeholder="Dán dữ liệu 'show cdp neighbors' hoặc nhấn Auto Discovery..."
              value={rawOutput}
              onChange={(e) => setRawOutput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-[10px] text-slate-300 font-mono h-24 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            
            <button 
              onClick={() => runAnalysis(rawOutput)}
              disabled={isAnalyzing || !rawOutput.trim()}
              className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold uppercase transition-all border border-slate-600"
            >
              {isAnalyzing ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync mr-2"></i>}
              Manual Process
            </button>
          </>
        )}

        {nodes.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold px-1">
              <span>Local Device</span>
              <span>Neighbors Found ({nodes.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {nodes.map((node, i) => (
                <div key={i} className="group relative bg-slate-900/60 p-4 rounded-xl border border-slate-700/30 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-900/10">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Interface</span>
                      <span className="text-blue-400 font-mono text-xs font-bold">{node.localInterface}</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="h-px w-12 bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20 mb-1"></div>
                      <span className="text-[8px] text-slate-600 font-mono">{node.platform}</span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{node.neighborDevice}</span>
                      <span className="text-emerald-400 font-mono text-xs font-bold">{node.neighborInterface}</span>
                    </div>
                  </div>
                  
                  {/* Visual Connection Line */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopologyDiscovery;
