
import React, { useState } from 'react';
import { DeviceType, GeneratedConfig, ConnectionStatus } from '../types';
import { generateCiscoConfig } from '../services/geminiService';

interface ConfigGeneratorProps {
  deviceType: DeviceType;
  onConfigGenerated: (config: GeneratedConfig) => void;
  setIsGenerating: (val: boolean) => void;
  connectionStatus: ConnectionStatus;
}

const ConfigGenerator: React.FC<ConfigGeneratorProps> = ({ deviceType, onConfigGenerated, setIsGenerating, connectionStatus }) => {
  const [prompt, setPrompt] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus !== 'CONNECTED') {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateCiscoConfig(deviceType, prompt);
      onConfigGenerated(result);
    } catch (error) {
      console.error("Config generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplates = () => {
    switch(deviceType) {
      case DeviceType.SWITCH:
        return ["Setup VLAN 10 and 20 with Trunking", "Enable Port Security on G0/1", "Configure SSH and Telnet"];
      case DeviceType.FIREWALL:
        return ["Configure Site-to-Site VPN", "Basic NAT and ACL rules", "Interface IP & Static Routing"];
      case DeviceType.WIFI:
        return ["Cấu hình SSID 'Cisco_Guest' VLAN 20", "Thiết lập WPA3 Personal Security", "Bật Band Steering 5GHz"];
      case DeviceType.MODEM:
        return ["Cấu hình PPPoE WAN & Static IP", "Thiết lập Port Forwarding (80/443)", "Bật DHCP Server Pool"];
      default:
        return [];
    }
  };

  const templates = getTemplates();

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-keyboard text-blue-400"></i> Configuration Prompt
        </h3>
        {connectionStatus === 'CONNECTED' ? (
          <span className="text-[10px] text-green-400 flex items-center gap-1">
            <i className="fas fa-check-circle"></i> Ready for commands
          </span>
        ) : (
          <span className="text-[10px] text-red-400 flex items-center gap-1">
            <i className="fas fa-exclamation-triangle"></i> Link required
          </span>
        )}
      </div>

      {showError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <i className="fas fa-circle-exclamation text-red-500 mt-1"></i>
          <div>
            <h4 className="text-sm font-bold text-red-400">Thiết bị chưa được kết nối!</h4>
            <p className="text-xs text-red-400/80 mt-1">
              Bạn cần thực hiện kết nối (Connect Device) ở thanh Sidebar bên trái trước khi tạo cấu hình.
            </p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={connectionStatus !== 'CONNECTED'}
            placeholder={connectionStatus === 'CONNECTED' 
              ? `Describe the ${deviceType.toLowerCase()} config... e.g., "Tạo SSID khách với mật khẩu abc123"`
              : "Vui lòng kết nối thiết bị để bắt đầu nhập lệnh..."
            }
            className={`w-full bg-slate-900 border rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[120px] resize-none ${
              connectionStatus !== 'CONNECTED' ? 'border-slate-800 cursor-not-allowed opacity-50' : 'border-slate-700'
            }`}
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              type="submit"
              disabled={!prompt.trim() || connectionStatus !== 'CONNECTED'}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
            >
              Generate <i className="fas fa-magic"></i>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl}
              type="button"
              disabled={connectionStatus !== 'CONNECTED'}
              onClick={() => setPrompt(tpl)}
              className="text-[10px] uppercase tracking-wider font-bold bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {tpl}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};

export default ConfigGenerator;
