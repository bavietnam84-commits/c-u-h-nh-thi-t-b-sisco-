
import React, { useState } from 'react';
import { parseDeviceNetworkInfo } from '../services/geminiService';
import { DeviceNetworkSummary, HardwareStatus } from '../types';

interface DeviceNetworkInfoProps {
  hardwareStatus: HardwareStatus;
  onSendCommand: (cmd: string) => Promise<void>;
}

const DeviceNetworkInfo: React.FC<DeviceNetworkInfoProps> = ({ hardwareStatus, onSendCommand }) => {
  const [info, setInfo] = useState<DeviceNetworkSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeviceInfo = async () => {
    if (hardwareStatus !== 'READY') return;
    
    setIsLoading(true);
    try {
      // Trong thực tế, chúng ta sẽ gửi lệnh và đọc phản hồi.
      // Ở đây chúng ta giả lập luồng gửi lệnh.
      await onSendCommand('terminal length 0');
      await onSendCommand('show ip interface brief');
      await onSendCommand('show version | include uptime');

      // Giả lập dữ liệu nhận được để AI phân tích
      const mockOutput = `
        Interface              IP-Address      OK? Method Status                Protocol
        GigabitEthernet0/0     192.168.1.1     YES NVRAM  up                    up      
        GigabitEthernet0/1     unassigned      YES NVRAM  down                  down    
        Vlan1                  10.0.0.1        YES NVRAM  up                    up      
        Loopback0              1.1.1.1         YES NVRAM  up                    up
        
        Router uptime is 2 weeks, 3 days, 14 hours, 5 minutes
        System image file is "flash:c2960-lanbasek9-mz.150-2.SE4.bin"
        Hostname: Core-Switch-01
      `;

      // Giả lập delay đọc dữ liệu từ Serial
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const parsed = await parseDeviceNetworkInfo(mockOutput);
      setInfo(parsed);
    } catch (error) {
      console.error("Failed to fetch device network info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-info-circle text-blue-400"></i> Device Network Status
        </h3>
        <button 
          onClick={fetchDeviceInfo}
          disabled={isLoading || hardwareStatus !== 'READY'}
          className={`text-[10px] px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-cloud-download-alt"></i>}
          Fetch Live Info
        </button>
      </div>

      {info ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Hostname</p>
              <p className="text-xs font-mono text-blue-400">{info.hostname}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Uptime</p>
              <p className="text-[10px] text-slate-300 truncate">{info.uptime || 'N/A'}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="pb-2 font-bold uppercase">Interface</th>
                  <th className="pb-2 font-bold uppercase">IP Address</th>
                  <th className="pb-2 font-bold uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {info.interfaces.map((iface, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-2 text-slate-300 font-mono">{iface.interface}</td>
                    <td className="py-2 text-emerald-400 font-mono">{iface.ipAddress}</td>
                    <td className="py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        iface.status.toLowerCase() === 'up' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {iface.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-slate-700 rounded-xl opacity-40">
          <i className="fas fa-microchip text-3xl mb-2 text-slate-600"></i>
          <p className="text-xs italic">Connect to a Cisco device and click "Fetch Live Info" to see real-time IP & interface status.</p>
        </div>
      )}
    </div>
  );
};

export default DeviceNetworkInfo;
