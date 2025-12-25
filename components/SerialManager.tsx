
import React, { useState, useEffect } from 'react';
import { HardwareStatus } from '../types';

interface SerialManagerProps {
  onPortSelect: (port: any | null) => void;
  hardwareStatus: HardwareStatus;
}

const SerialManager: React.FC<SerialManagerProps> = ({ onPortSelect, hardwareStatus }) => {
  const [port, setPort] = useState<any>(null);

  const requestPort = async () => {
    try {
      if (!('serial' in navigator)) {
        alert("Trình duyệt của bạn không hỗ trợ Web Serial API. Vui lòng dùng Chrome hoặc Edge.");
        return;
      }

      // @ts-ignore
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 9600 });
      
      setPort(selectedPort);
      onPortSelect(selectedPort);
    } catch (err) {
      console.error("Lỗi kết nối Serial:", err);
    }
  };

  const disconnectPort = async () => {
    if (port) {
      await port.close();
      setPort(null);
      onPortSelect(null);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-microchip text-indigo-400"></i> Hardware Console Link
        </h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hardwareStatus === 'READY' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}></span>
          <span className="text-[10px] text-slate-500 font-bold uppercase">{hardwareStatus}</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          Kết nối ứng dụng trực tiếp với thiết bị Cisco thật thông qua cáp <b>Console (COM/USB)</b> trên laptop của bạn.
        </p>

        {!port ? (
          <button
            onClick={requestPort}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all"
          >
            <i className="fas fa-plug"></i> Chọn Cổng COM / Console
          </button>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-900 border border-indigo-500/30 rounded-xl px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">Port Active (9600 bps)</span>
              <i className="fas fa-check-circle text-indigo-500"></i>
            </div>
            <button
              onClick={disconnectPort}
              className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl transition-all"
              title="Ngắt kết nối phần cứng"
            >
              <i className="fas fa-power-off"></i>
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-500 bg-slate-950/30 p-2 rounded-lg border border-slate-800">
        <i className="fas fa-info-circle mt-0.5"></i>
        <span>Lưu ý: Đảm bảo Driver USB-to-Serial đã được cài đặt đúng trên Windows/macOS.</span>
      </div>
    </div>
  );
};

export default SerialManager;
