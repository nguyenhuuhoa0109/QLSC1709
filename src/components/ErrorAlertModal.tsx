import React from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { BusinessError } from '../types';

interface ErrorAlertModalProps {
  error: BusinessError | null;
  onClose: () => void;
}

export const ErrorAlertModal: React.FC<ErrorAlertModalProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-200">
        <div className="bg-rose-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-100" />
            <h3 className="font-bold text-base">Từ chối thao tác / Lỗi nghiệp vụ</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-rose-700 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
              MÃ LỖI: {error.code}
            </span>
          </div>

          <p className="text-slate-800 text-sm font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {error.message}
          </p>

          {error.details && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold">Chi tiết kiểm soát tồn kho:</div>
              {error.details.material_name && (
                <div>• Vật tư: <span className="font-semibold">{String(error.details.material_name)}</span></div>
              )}
              {error.details.material_code && (
                <div>• Mã: <span className="font-mono">{String(error.details.material_code)}</span></div>
              )}
              {error.details.current_quantity !== undefined && (
                <div>• Tồn kho thực tế hiện hữu: <span className="font-bold text-rose-600">{String(error.details.current_quantity)}</span></div>
              )}
              {error.details.requested_quantity !== undefined && (
                <div>• Số lượng yêu cầu xuất: <span className="font-bold text-slate-800">{String(error.details.requested_quantity)}</span></div>
              )}
              <div className="text-[11px] text-amber-800 italic pt-1">
                * Toàn bộ transaction được rollback tự động. Tuyệt đối không cho phép tồn kho âm.
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
