
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ConfigGenerator from './components/ConfigGenerator';
import VoiceAssistant from './components/VoiceAssistant';
import ChatAssistant from './components/ChatAssistant';
import TerminalOutput from './components/TerminalOutput';
import ManualGuide from './components/ManualGuide';
import NetworkDiagnostics from './components/NetworkDiagnostics';
import UserGuide from './components/UserGuide';
import BackupManager from './components/BackupManager';
import DeviceHealthCheck from './components/DeviceHealthCheck';
import SerialManager from './components/SerialManager';
import SafetyWorkflow from './components/SafetyWorkflow';
import ComplianceAudit from './components/ComplianceAudit';
import TopologyDiscovery from './components/TopologyDiscovery';
import DeviceNetworkInfo from './components/DeviceNetworkInfo';
import TopologyMap from './components/TopologyMap';
import { DeviceType, GeneratedConfig, ConnectionStatus, ConfigBackup, HardwareStatus, TopologyData, TopologyNode } from './types';
import { parseVisualTopology } from './services/geminiService';

const STORAGE_KEYS = {
  CONFIG: 'cisco_ai_last_config',
  DEVICE: 'cisco_ai_last_device',
  CONNECTIONS: 'cisco_ai_connections',
  GUIDE_SEEN: 'cisco_ai_guide_seen',
  BACKUPS: 'cisco_ai_backups'
};

const HeaderLogo = () => (
  <svg viewBox="0 0 100 60" className="w-6 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="32" width="6" height="18" rx="3" fill="currentColor" />
    <rect x="22" y="22" width="6" height="28" rx="3" fill="currentColor" />
    <rect x="34" y="12" width="6" height="38" rx="3" fill="currentColor" />
    <rect x="46" y="2" width="6" height="48" rx="3" fill="currentColor" />
    <rect x="58" y="12" width="6" height="38" rx="3" fill="currentColor" />
    <rect x="70" y="22" width="6" height="28" rx="3" fill="currentColor" />
    <rect x="82" y="32" width="6" height="18" rx="3" fill="currentColor" />
  </svg>
);

const App: React.FC = () => {
  const [activeDevice, setActiveDevice] = useState<DeviceType>(DeviceType.SWITCH);
  const [config, setConfig] = useState<GeneratedConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [backups, setBackups] = useState<ConfigBackup[]>([]);
  const [discoveredNeighbors, setDiscoveredNeighbors] = useState<TopologyNode[]>([]);
  const [visualTopology, setVisualTopology] = useState<TopologyData>({ nodes: [], links: [] });
  
  const [serialPort, setSerialPort] = useState<any>(null);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>('DISCONNECTED');

  const [connections, setConnections] = useState<Record<DeviceType, ConnectionStatus>>({
    [DeviceType.SWITCH]: 'DISCONNECTED',
    [DeviceType.FIREWALL]: 'DISCONNECTED',
    [DeviceType.WIFI]: 'DISCONNECTED',
    [DeviceType.MODEM]: 'DISCONNECTED'
  });

  useEffect(() => {
    const savedDevice = localStorage.getItem(STORAGE_KEYS.DEVICE);
    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const savedConnections = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
    const savedBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS);
    const guideSeen = localStorage.getItem(STORAGE_KEYS.GUIDE_SEEN);

    if (savedDevice && Object.values(DeviceType).includes(savedDevice as DeviceType)) {
      setActiveDevice(savedDevice as DeviceType);
    }
    if (savedConfig) {
      try { setConfig(JSON.parse(savedConfig)); } catch (e) {}
    }
    if (savedConnections) {
      try {
        const parsed = JSON.parse(savedConnections);
        setConnections(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
    if (savedBackups) {
      try { setBackups(JSON.parse(savedBackups)); } catch (e) {}
    }
    if (!guideSeen) {
      setShowGuide(true);
      localStorage.setItem(STORAGE_KEYS.GUIDE_SEEN, 'true');
    }
  }, []);

  useEffect(() => {
    const updateVisualMap = async () => {
      const data = await parseVisualTopology(config?.cliCommands || '', activeDevice, discoveredNeighbors);
      setVisualTopology(data);
    };
    if (config || discoveredNeighbors.length > 0) {
      updateVisualMap();
    }
  }, [config, activeDevice, discoveredNeighbors]);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEVICE, activeDevice); }, [activeDevice]);
  useEffect(() => { if (config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections)); }, [connections]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups)); }, [backups]);

  const handleConnect = async (type: DeviceType) => {
    if (connections[type] === 'CONNECTED') {
      setConnections(prev => ({ ...prev, [type]: 'DISCONNECTED' }));
      return;
    }
    setConnections(prev => ({ ...prev, [type]: 'CONNECTING' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnections(prev => ({ ...prev, [type]: 'CONNECTED' }));
  };

  const handleDeployRaw = async (commands: string) => {
    if (!serialPort) return;
    try {
      const writer = serialPort.writable.getWriter();
      const encoder = new TextEncoder();
      const lines = commands.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          await writer.write(encoder.encode(line + '\r\n'));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      await writer.releaseLock();
    } catch (err) {
      console.error("Deploy failed:", err);
      alert("Lỗi kết nối phần cứng.");
    }
  };

  const currentStatus = connections[activeDevice];

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-200">
      <UserGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <Sidebar 
        activeDevice={activeDevice} 
        onDeviceChange={setActiveDevice} 
        connections={connections}
        onConnect={handleConnect}
        onOpenGuide={() => setShowGuide(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 shadow-2xl relative">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="text-blue-500 flex items-center">
              <HeaderLogo />
            </div>
            <h1 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
              {activeDevice} <span className="text-slate-500 font-normal">|</span> PRO ENGINE
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentStatus === 'CONNECTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>{currentStatus}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="hidden md:flex items-center gap-2 text-emerald-400">
              <i className="fas fa-shield-halved"></i>
              Safety-First v2.1
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 content-start">
          <div className="space-y-6">
            <TopologyMap data={visualTopology} />
            <NetworkDiagnostics />
            {config && <SafetyWorkflow config={config} hardwareStatus={hardwareStatus} onDeploy={handleDeployRaw} />}
            <DeviceNetworkInfo hardwareStatus={hardwareStatus} onSendCommand={handleDeployRaw} />
            <ChatAssistant deviceType={activeDevice} />
            <ComplianceAudit currentConfig={config?.cliCommands || ''} />
            <TopologyDiscovery 
              hardwareStatus={hardwareStatus} 
              onSendCommand={handleDeployRaw} 
              serialPort={serialPort}
              onNodesFound={setDiscoveredNeighbors}
            />
            <SerialManager onPortSelect={(p) => { setSerialPort(p); setHardwareStatus(p ? 'READY' : 'DISCONNECTED'); }} hardwareStatus={hardwareStatus} />
            <DeviceHealthCheck deviceType={activeDevice} connectionStatus={currentStatus} />
            <ConfigGenerator deviceType={activeDevice} onConfigGenerated={setConfig} setIsGenerating={setIsGenerating} connectionStatus={currentStatus} />
            <BackupManager backups={backups} onRestore={(b) => { setActiveDevice(b.deviceType); setConfig(b.config); }} onDelete={(id) => setBackups(p => p.filter(x => x.id !== id))} />
            <ManualGuide deviceType={activeDevice} />
            <VoiceAssistant deviceType={activeDevice} />
          </div>

          <div className="lg:sticky lg:top-0 h-full max-h-[calc(100vh-120px)] overflow-hidden">
            <TerminalOutput 
              config={config} 
              isGenerating={isGenerating}
              onClear={() => setConfig(null)}
              onSaveBackup={(name) => {
                if (!config) return;
                const b: ConfigBackup = { id: crypto.randomUUID(), name, timestamp: new Date().toISOString(), deviceType: activeDevice, config };
                setBackups(p => [b, ...p]);
              }}
              connectionStatus={currentStatus}
              hardwareStatus={hardwareStatus}
              onDeployToHardware={async () => { if (config) await handleDeployRaw(config.cliCommands); }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
