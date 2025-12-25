
export enum DeviceType {
  SWITCH = 'SWITCH',
  FIREWALL = 'FIREWALL',
  WIFI = 'WIFI',
  MODEM = 'MODEM'
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
export type HardwareStatus = 'READY' | 'BUSY' | 'DISCONNECTED';

export interface GeneratedConfig {
  cliCommands: string;
  explanation: string;
  bestPractices: string[];
  preCheckCommands: string[];
  postCheckCommands: string[];
  rollbackCommands: string;
}

export interface ComplianceIssue {
  severity: 'high' | 'medium' | 'low';
  issue: string;
  remediation: string;
}

export interface TopologyNode {
  localInterface: string;
  neighborDevice: string;
  neighborInterface: string;
  platform: string;
}

export interface ConfigBackup {
  id: string;
  name: string;
  timestamp: string;
  deviceType: DeviceType;
  config: GeneratedConfig;
}

export interface DeviceHealth {
  cpu: number;
  memory: number;
  temp: number;
  uptime: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  logs: string[];
}

export interface TranscriptionItem {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
