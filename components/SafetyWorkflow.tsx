
import React, { useState } from 'react';
import { GeneratedConfig, HardwareStatus } from '../types';

interface SafetyWorkflowProps {
  config: GeneratedConfig;
  hardwareStatus: HardwareStatus;
  onDeploy: (commands: string) => Promise<void>;
}

const SafetyWorkflow: React.FC<SafetyWorkflowProps> = ({ config, hardwareStatus, onDeploy }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const runStep = async (cmds: string | string[], nextStep: typeof step | null) => {
    if (hardwareStatus !== 'READY') return;
    setIsProcessing(true);
    const cmdString = Array.isArray(cmds) ? cmds.join('\r\n') : cmds;
    await onDeploy(cmdString);
    setIsProcessing(false);
    if (nextStep) setStep(nextStep);
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-shield-check text-emerald-400"></i> Safety Deployment Workflow
        </h3>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-8 h-1 rounded-full ${step >= i ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Pre-check */}
        <div className={`p-4 rounded-xl border transition-all ${step === 1 ? 'bg-blue-500/10 border-blue-500/50 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-[10px] flex items-center justify-center font-bold">1</span>
            <span className="text-xs font-bold text-white uppercase">Pre-check</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-3">Kiểm tra trạng thái thiết bị trước khi cấu hình.</p>
          <button 
            disabled={step !== 1 || isProcessing}
            onClick={() => runStep(config.preCheckCommands, 2)}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all"
          >
            {isProcessing && step === 1 ? <i className="fas fa-spinner fa-spin"></i> : "Chạy Pre-check"}
          </button>
        </div>

        {/* Step 2: Push Config */}
        <div className={`p-4 rounded-xl border transition-all ${step === 2 ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-[10px] flex items-center justify-center font-bold">2</span>
            <span className="text-xs font-bold text-white uppercase">Deploy</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-3">Đẩy cấu hình chính vào Running-Config.</p>
          <button 
            disabled={step !== 2 || isProcessing}
            onClick={() => runStep(config.cliCommands, 3)}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all"
          >
            {isProcessing && step === 2 ? <i className="fas fa-spinner fa-spin"></i> : "Đẩy cấu hình"}
          </button>
        </div>

        {/* Step 3: Post-check */}
        <div className={`p-4 rounded-xl border transition-all ${step === 3 ? 'bg-purple-500/10 border-purple-500/50 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-purple-500 text-[10px] flex items-center justify-center font-bold">3</span>
            <span className="text-xs font-bold text-white uppercase">Verify</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-3">Xác nhận cấu hình đã hoạt động chính xác.</p>
          <button 
            disabled={step !== 3 || isProcessing}
            onClick={() => runStep(config.postCheckCommands, null)}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-all"
          >
            {isProcessing && step === 3 ? <i className="fas fa-spinner fa-spin"></i> : "Xác minh cuối"}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-undo-alt text-red-400 text-xs"></i>
            <span className="text-xs font-bold text-red-400 uppercase">Emergency Rollback</span>
          </div>
          <button 
            onClick={() => runStep(config.rollbackCommands, 1)}
            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-[10px] font-bold rounded-lg transition-all"
          >
            Đảo ngược cấu hình (Rollback)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyWorkflow;
