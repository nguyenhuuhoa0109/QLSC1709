import React from 'react';
import { AuditLog } from '../types';
import { FileText, X, Clock, User, ShieldAlert } from 'lucide-react';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'POST_RECEIPT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'POST_ISSUE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'APPROVE_RECEIPT':
      case 'APPROVE_ISSUE':
      case 'APPROVE_INVENTORY_COUNT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'REJECT_RECEIPT':
      case 'REJECT_ISSUE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'POST_INVENTORY_ADJUSTMENT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Nhật Ký Kiểm Toán (Audit Logs)</h3>
              <p className="text-xs text-slate-400">Ghi vết bất biến mọi hành động nghiệp vụ & phân quyền</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 transition">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Chưa có bản ghi nhật ký kiểm toán.</div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Người thực hiện</th>
                    <th className="py-3 px-4">Hành động</th>
                    <th className="py-3 px-4">Bảng & Bản ghi</th>
                    <th className="py-3 px-4">Dữ liệu ghi vết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                        {log.user_name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {log.table_name} <span className="text-slate-400">({log.record_id})</span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 font-mono max-w-xs truncate">
                        {log.after_data ? JSON.stringify(log.after_data) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
