import React, { useState } from 'react';
import { Database, X, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- ====================================================================
-- HỆ THỐNG QUẢN LÝ KHO VẬT TƯ NỘI BỘ - NHÀ MÁY THỦY ĐIỆN SƠN TRÀ 1
-- SUPABASE / POSTGRESQL DATABASE SCHEMA & ATOMIC RPCS
-- ====================================================================

-- 1. BẢNG DANH MỤC VẬT TƯ & 20 BẢNG TOÀN DIỆN
-- Bao gồm: profiles, user_roles, warehouses, warehouse_members, material_systems,
-- material_groups, units, materials, warehouse_material_settings, receipt_documents,
-- receipt_items, issue_documents, issue_items, stock_balances, stock_movements,
-- inventory_counts, inventory_count_items, approvals, notifications, audit_logs.

-- CẬP NHẬT TỒN KHO AN TOÀN BẰNG POSTGRESQL FUNCTION / RPC:
-- 1. post_receipt(p_receipt_id, p_user_id) -> Đơn giá bình quân gia quyền & tăng tồn
-- 2. post_issue(p_issue_id, p_user_id) -> Kiểm tra đã duyệt, lock FOR UPDATE,
--    nếu thiếu bất kỳ vật tư nào -> ROLLBACK toàn bộ, trả về INSUFFICIENT_STOCK,
--    nếu đủ tất cả vật tư -> trừ tồn nguyên tử và ghi log biến động.
-- 3. post_inventory_adjustment(p_count_id, p_user_id, p_reason, p_ref)

-- Vui lòng xem toàn bộ mã nguồn tại tệp: /supabase_schema.sql trong dự án.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Cấu trúc Database Supabase / PostgreSQL</h3>
              <p className="text-xs text-slate-400">20 Bảng, RLS, Views và Stored Procedures (RPCs)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 transition">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {sqlCode}
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Đã đóng gói đầy đủ trong tệp: <code className="text-white bg-slate-950 px-1.5 py-0.5 rounded">/supabase_schema.sql</code>
            </div>
            <p className="text-slate-400 text-[11px]">
              Bạn có thể mở tệp <code className="text-slate-300">supabase_schema.sql</code> ở thư mục gốc để nạp trực tiếp vào Supabase SQL Editor khi triển khai lên môi trường sản xuất.
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép đoạn trích'}
            </button>

            <button
              onClick={onClose}
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition border border-slate-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
