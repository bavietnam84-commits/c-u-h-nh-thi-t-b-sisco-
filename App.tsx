
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ConfigGenerator from './components/ConfigGenerator';
import VoiceAssistant from './components/VoiceAssistant';
import TerminalOutput from './components/TerminalOutput';
import ManualGuide from './components/ManualGuide';
import NetworkDiagnostics from './components/NetworkDiagnostics';
import { DeviceType, GeneratedConfig, ConnectionStatus } from './types';

const STORAGE_KEYS = {
  CONFIG: 'cisco_ai_last_config',
  DEVICE: 'cisco_ai_last_device',
  CONNECTIONS: 'cisco_ai_connections'
};

const App: React.FC = () => {
  const [activeDevice, setActiveDevice] = useState<DeviceType>(DeviceType.SWITCH);
  const [config, setConfig] = useState<GeneratedConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track connection status for each device
  const [connections, setConnections] = useState<Record<DeviceType, ConnectionStatus>>({
    [DeviceType.SWITCH]: 'DISCONNECTED',
    [DeviceType.FIREWALL]: 'DISCONNECTED',
    [DeviceType.WIFI]: 'DISCONNECTED',
    [DeviceType.MODEM]: 'DISCONNECTED'
  });

  // Load state on mount
  useEffect(() => {
    const savedDevice = localStorage.getItem(STORAGE_KEYS.DEVICE);
    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const savedConnections = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);

    if (savedDevice && Object.values(DeviceType).includes(savedDevice as DeviceType)) {
      setActiveDevice(savedDevice as DeviceType);
    }

    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }

    if (savedConnections) {
      try {
        const parsed = JSON.parse(savedConnections);
        // Merge with defaults to ensure new types exist
        setConnections(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  // Auto-save state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICE, activeDevice);
  }, [activeDevice]);

  useEffect(() => {
    if (config) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    }
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
  }, [connections]);

  const handleConnect = async (type: DeviceType) => {
    if (connections[type] === 'CONNECTED') {
      setConnections(prev => ({ ...prev, [type]: 'DISCONNECTED' }));
      return;
    }

    setConnections(prev => ({ ...prev, [type]: 'CONNECTING' }));
    
    // Simulate network handshake
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnections(prev => ({ ...prev, [type]: 'CONNECTED' }));
  };

  const handleClearConfig = () => {
    setConfig(null);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
  };

  const currentStatus = connections[activeDevice];

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-200">
      {/* Sidebar */}
      <Sidebar 
        activeDevice={activeDevice} 
        onDeviceChange={setActiveDevice} 
        connections={connections}
        onConnect={handleConnect}
      />

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 shadow-2xl relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              currentStatus === 'CONNECTED' ? 'bg-green-500' : 
              currentStatus === 'CONNECTING' ? 'bg-yellow-500 animate-ping' : 'bg-slate-600'
            }`}></div>
            <h1 className="text-lg font-semibold tracking-tight text-white uppercase">
              {activeDevice.replace('_', ' ')} CONFIGURATION
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              currentStatus === 'CONNECTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
              currentStatus === 'CONNECTING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }`}>
              {currentStatus}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1"><i className="fas fa-network-wired"></i> v1.1.0-auto</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20">
              <i className="fas fa-circle text-[8px]"></i> AI AGENT ONLINE
            </span>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 content-start">
          
          {/* Left Column: Input & Controls */}
          <div className="space-y-6">
            <NetworkDiagnostics />
            <ConfigGenerator 
              deviceType={activeDevice} 
              onConfigGenerated={setConfig} 
              setIsGenerating={setIsGenerating}
              connectionStatus={currentStatus}
            />
            <ManualGuide deviceType={activeDevice} />
            <VoiceAssistant deviceType={activeDevice} />
          </div>

          {/* Right Column: Output */}
          <div className="lg:sticky lg:top-0 h-full max-h-[calc(100vh-120px)] overflow-hidden">
            <TerminalOutput 
              config={config} 
              isGenerating={isGenerating}
              onClear={handleClearConfig}
              connectionStatus={currentStatus}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
