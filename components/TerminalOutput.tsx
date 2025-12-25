
import React, { useState } from 'react';
import { GeneratedConfig, ConnectionStatus, HardwareStatus } from '../types';

interface TerminalOutputProps {
  config: GeneratedConfig | null;
  isGenerating: boolean;
  onClear: () => void;
  onSaveBackup: (name: string) => void;
  connectionStatus: ConnectionStatus;
  hardwareStatus: HardwareStatus;
  onDeployToHardware: () => Promise<void>;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ 
  config, 
  isGenerating, 
  onClear, 
  onSaveBackup, 
  connectionStatus, 
  hardwareStatus,
  onDeployToHardware
}) => {
  const [activeTab, setActiveTab] = useState<'cli' | 'guide'>('cli');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [backupName, setBackupName] = useState('');

  const copyToClipboard = () => {
    if (config) {
      navigator.clipboard.writeText(config.cliCommands);
      const btn = document.getElementById('copy-btn');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check text-green-400"></i>';
        setTimeout(() => btn.innerHTML = originalText, 2000);
      }
    }
  };

  const handleDeploy = async () => {
    if (hardwareStatus !== 'READY') return;
    setIsDeploying(true);
    await onDeployToHardware();
    setIsDeploying(false);
  };

  const handleSave = () => {
    if (!backupName.trim()) {
      onSaveBackup(`Backup ${new Date().toLocaleTimeString()}`);
    } else {
      onSaveBackup(backupName);
    }
    setIsSaving(false);
    setBackupName('');
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex gap-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500/30'}`}></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
          <div className="w-3 h-3 rounded-full bg-blue-500/30"></div>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('cli')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'cli' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            CLI
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'guide' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            GUIDE
          </button>
        </div>

        <div className="flex items-center gap-3">
          {config && (
            <>
              <button 
                onClick={handleDeploy}
                disabled={hardwareStatus !== 'READY' || isDeploying}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  hardwareStatus === 'READY' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                {isDeploying ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-bolt"></i>}
                <span className="hidden lg:inline">Deploy to Hardware</span>
              </button>
              <button 
                onClick={() => setIsSaving(true)}
                className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                title="Lưu bản sao lưu"
              >
                <i className="fas fa-save"></i>
              </button>
              <button 
                onClick={onClear}
                className="text-slate-500 hover:text-red-400 transition-colors text-sm"
                title="Xóa cấu hình"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </>
          )}
          <button 
            id="copy-btn"
            onClick={copyToClipboard}
            className="text-slate-400 hover:text-blue-400 transition-colors"
            title="Copy to clipboard"
          >
            <i className="fas fa-copy"></i>
          </button>
        </div>
      </div>

      {/* Save Backup Dialog Overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-20 bg-slate-950/90 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-xs shadow-2xl">
            <h4 className="text-white font-bold mb-4 text-sm">Lưu Bản Sao Lưu</h4>
            <input 
              autoFocus
              type="text"
              placeholder="Tên bản sao (VD: Core Switch Setup)"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setIsSaving(false)} className="flex-1 py-2 text-xs text-slate-400 hover:text-white transition-colors">Hủy</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">Lưu lại</button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#0B0E14] custom-scrollbar relative">
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-blue-400 font-mono text-sm animate-pulse">Compiling configuration...</p>
          </div>
        ) : config ? (
          activeTab === 'cli' ? (
            <div className="cli-font text-sm">
              <div className="text-slate-500 mb-4 flex justify-between items-center">
                <span>! Cisco Configuration Generated by AI</span>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">LINK ACTIVE</span>
                  {hardwareStatus === 'READY' && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">HW READY</span>
                  )}
                </div>
              </div>
              <pre className="text-green-400 leading-relaxed whitespace-pre-wrap">{config.cliCommands}</pre>
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest">Description</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{config.explanation}</p>
              </section>
              <section>
                <h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-2">Security Best Practices</h4>
                <ul className="space-y-2">
                  {config.bestPractices.map((bp, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-400">
                      <i className="fas fa-check-circle text-orange-500/50 mt-1"></i>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center opacity-40">
            {connectionStatus === 'CONNECTED' ? (
              <>
                <i className="fas fa-terminal text-6xl mb-4 text-green-500/50"></i>
                <p className="font-mono text-sm">Thiết bị ảo đã sẵn sàng. Hãy nhập yêu cầu cấu hình.</p>
              </>
            ) : (
              <>
                <i className="fas fa-link-slash text-6xl mb-4 text-red-500/30"></i>
                <p className="font-mono text-sm">Chưa có kết nối. Vui lòng kết nối thiết bị ở Sidebar.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex gap-4">
          <span>ENC: AES-256</span>
          <span className={connectionStatus === 'CONNECTED' ? 'text-green-500' : 'text-red-500'}>
            LINK: {connectionStatus}
          </span>
          {hardwareStatus === 'READY' && (
            <span className="text-indigo-400">HW: PORT ACTIVE</span>
          )}
        </div>
        <div>
          {config ? `LEN: ${config.cliCommands.length} Chars` : 'IDLE'}
        </div>
      </div>
    </div>
  );
};

export default TerminalOutput;
