
import React, { useState } from 'react';
import { auditConfiguration } from '../services/geminiService';
import { ComplianceIssue } from '../types';

interface ComplianceAuditProps {
  currentConfig: string;
}

const ComplianceAudit: React.FC<ComplianceAuditProps> = ({ currentConfig }) => {
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAudit = async () => {
    setIsAuditing(true);
    const result = await auditConfiguration(currentConfig);
    setIssues(result);
    setIsAuditing(false);
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-user-shield text-orange-400"></i> Security Compliance Audit
        </h3>
        <button 
          onClick={runAudit}
          disabled={isAuditing || !currentConfig}
          className="text-xs px-3 py-1.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white rounded-lg border border-orange-500/20 font-bold transition-all"
        >
          {isAuditing ? <i className="fas fa-spinner animate-spin"></i> : "Quét bảo mật"}
        </button>
      </div>

      {issues.length > 0 ? (
        <div className="space-y-3">
          {issues.map((issue, i) => (
            <div key={i} className="p-3 bg-slate-900/60 border-l-4 border-orange-500 rounded-r-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  issue.severity === 'high' ? 'bg-red-500 text-white' : 
                  issue.severity === 'medium' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {issue.severity}
                </span>
                <span className="text-[11px] font-bold text-slate-200">{issue.issue}</span>
              </div>
              <p className="text-[10px] text-slate-400 ml-2 italic">Gợi ý: {issue.remediation}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center opacity-40">
          <p className="text-xs italic">Chưa phát hiện vi phạm bảo mật nào.</p>
        </div>
      )}
    </div>
  );
};

export default ComplianceAudit;
