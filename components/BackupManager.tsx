
import React from 'react';
import { ConfigBackup } from '../types';

interface BackupManagerProps {
  backups: ConfigBackup[];
  onRestore: (backup: ConfigBackup) => void;
  onDelete: (id: string) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ backups, onRestore, onDelete }) => {
  const downloadAsFile = (backup: ConfigBackup) => {
    const element = document.createElement("a");
    const file = new Blob([backup.config.cliCommands], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `cisco_backup_${backup.name.replace(/\s+/g, '_')}_${backup.timestamp.split('T')[0]}.cfg`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-history text-blue-400"></i> Danh Sách Bản Sao Lưu
        </h3>
        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
          {backups.length} Saved
        </span>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {backups.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <i className="fas fa-cloud-upload-alt text-slate-700 text-3xl mb-2"></i>
            <p className="text-xs text-slate-500">Chưa có bản sao lưu nào được tạo.</p>
          </div>
        ) : (
          backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((backup) => (
            <div key={backup.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 group hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-200 truncate max-w-[150px]">{backup.name}</h4>
                  <p className="text-[10px] text-slate-500">
                    {new Date(backup.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {backup.deviceType}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onRestore(backup)}
                  className="flex-1 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-bold rounded-lg transition-all"
                >
                  <i className="fas fa-undo mr-1"></i> Khôi phục
                </button>
                <button 
                  onClick={() => downloadAsFile(backup)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all"
                  title="Tải xuống .cfg"
                >
                  <i className="fas fa-download"></i>
                </button>
                <button 
                  onClick={() => onDelete(backup.id)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BackupManager;
