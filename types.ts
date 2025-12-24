
export enum DeviceType {
  SWITCH = 'SWITCH',
  FIREWALL = 'FIREWALL',
  WIFI = 'WIFI',
  MODEM = 'MODEM'
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export interface DeviceConnectionState {
  status: ConnectionStatus;
  lastConnected?: Date;
}

export interface ConfigRequest {
  deviceType: DeviceType;
  description: string;
  parameters: Record<string, any>;
}

export interface GeneratedConfig {
  cliCommands: string;
  explanation: string;
  bestPractices: string[];
}

export interface TranscriptionItem {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
