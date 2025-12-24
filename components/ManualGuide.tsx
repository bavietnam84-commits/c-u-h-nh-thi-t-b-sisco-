
import React, { useState } from 'react';
import { DeviceType } from '../types';

interface ManualGuideProps {
  deviceType: DeviceType;
}

const MANUAL_DATA = {
  [DeviceType.SWITCH]: [
    {
      title: "Cấu hình VLAN cơ bản",
      commands: [
        "vlan 10",
        "name IT_DEPT",
        "exit",
        "interface gigabitEthernet 0/1",
        "switchport mode access",
        "switchport access vlan 10"
      ]
    },
    {
      title: "Cấu hình Trunking",
      commands: [
        "interface gigabitEthernet 0/24",
        "switchport trunk encapsulation dot1q",
        "switchport mode trunk",
        "switchport trunk allowed vlan all"
      ]
    }
  ],
  [DeviceType.FIREWALL]: [
    {
      title: "Network Objects & NAT",
      commands: [
        "object network INTERNAL_NET",
        "subnet 192.168.1.0 255.255.255.0",
        "nat (inside,outside) dynamic interface"
      ]
    }
  ],
  [DeviceType.WIFI]: [
    {
      title: "Cấu hình SSID & Bảo mật",
      commands: [
        "wlan 'Cisco_Office' 1 'Cisco_Office'",
        "security wpa psk set-key ascii abc12345 1",
        "security wpa akm dot1x disable",
        "security wpa akm psk enable",
        "no shutdown"
      ]
    },
    {
      title: "Gán VLAN cho SSID",
      commands: [
        "wlan 'Cisco_Guest' 2 'Cisco_Guest'",
        "client vlan 20",
        "no shutdown"
      ]
    }
  ],
  [DeviceType.MODEM]: [
    {
      title: "Thiết lập PPPoE WAN",
      commands: [
        "interface Dialer1",
        "ip address negotiated",
        "encapsulation ppp",
        "dialer pool 1",
        "ppp pap sent-username user@isp password isp_pass"
      ]
    },
    {
      title: "Cấu hình Port Forwarding",
      commands: [
        "ip nat inside source static tcp 192.168.1.50 80 interface Dialer1 80",
        "ip nat inside source static tcp 192.168.1.50 443 interface Dialer1 443"
      ]
    }
  ]
};

const ManualGuide: React.FC<ManualGuideProps> = ({ deviceType }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const copyToClipboard = (commands: string[]) => {
    navigator.clipboard.writeText(commands.join('\n'));
  };

  const deviceData = MANUAL_DATA[deviceType] || [];

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-book text-yellow-400"></i> Hướng Dẫn Lệnh Thủ Công
        </h3>
        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 font-bold uppercase">
          Quick Reference
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {deviceData.map((item, idx) => (
          <div key={idx} className="border border-slate-700/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-700 transition-colors text-left"
            >
              <span className="text-sm font-medium text-slate-200">{item.title}</span>
              <i className={`fas fa-chevron-down text-[10px] text-slate-500 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}></i>
            </button>
            
            {openIndex === idx && (
              <div className="p-4 bg-slate-900/80 space-y-3 border-t border-slate-700/50">
                <div className="relative group">
                  <pre className="cli-font text-[12px] text-blue-300 leading-relaxed overflow-x-auto whitespace-pre">
                    {item.commands.join('\n')}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(item.commands)}
                    className="absolute top-0 right-0 p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy commands"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {deviceData.length === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-4">Chưa có hướng dẫn cho loại thiết bị này.</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-[10px] text-slate-500">
        <i className="fas fa-info-circle"></i>
        <span>Nhấn vào tiêu đề để xem chi tiết các lệnh mẫu cho {deviceType.toLowerCase()}.</span>
      </div>
    </div>
  );
};

export default ManualGuide;
