import React, { useState } from 'react';
import {
  InventoryCount,
  InventoryCountItem,
  Material,
  Warehouse,
  StockBalance,
  UserProfile
} from '../types';
import { formatNumber } from '../api';
import {
  ClipboardCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Check,
  Calendar,
  Building2,
  FileCheck,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

interface InventoryCountViewProps {
  counts: InventoryCount[];
  materials: Material[];
  warehouses: Warehouse[];
  stockBalances: StockBalance[];
  currentUser: UserProfile;
  onCreateCount: (payload: any) => Promise<void>;
  onSubmitCount: (id: string) => Promise<void>;
  onApproveCount: (id: string) => Promise<void>;
  onPostAdjustment: (id: string, payload: { adjustment_reason: string; adjustment_document_ref: string }) => Promise<void>;
}

export const InventoryCountView: React.FC<InventoryCountViewProps> = ({
  counts,
  materials,
  warehouses,
  stockBalances,
  currentUser,
  onCreateCount,
  onSubmitCount,
  onApproveCount,
  onPostAdjustment
}) => {
  const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustReason, setAdjustReason] = useState('Khớp số liệu kiểm kê thực tế theo biên bản kiểm kê');
  const [adjustRef, setAdjustRef] = useState('BB-KK-2025-01');

  // Form for creating count batch
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');
  const [countPurpose, setCountPurpose] = useState('quarterly');
  const [participants, setParticipants] = useState('Ban Kiểm Kê Thủy Điện Sơn Trà 1 (Đại diện Kế hoạch, Kỹ thuật, Thủ kho)');
  const [countNotes, setCountNotes] = useState('');
  const [countItems, setCountItems] = useState<{ material_id: string; actual_quantity: number; reason: string; proposal: string }[]>([]);

  // When warehouse changes in create modal, prefill items with current book balances
  const handleInitCreateModal = (whId: string) => {
    setSelectedWarehouseId(whId);
    const whBalances = stockBalances.filter(b => b.warehouse_id === whId);
    const items = whBalances.map(b => ({
      material_id: b.material_id,
      actual_quantity: b.quantity, // default to book quantity
      reason: '',
      proposal: ''
    }));
    setCountItems(items);
    setIsCreateOpen(true);
  };

  const handleActualQtyChange = (idx: number, qty: number) => {
    const next = [...countItems];
    next[idx] = { ...next[idx], actual_quantity: qty };
    setCountItems(next);
  };

  const handleReasonChange = (idx: number, reason: string) => {
    const next = [...countItems];
    next[idx] = { ...next[idx], reason };
    setCountItems(next);
  };

  const handleProposalChange = (idx: number, proposal: string) => {
    const next = [...countItems];
    next[idx] = { ...next[idx], proposal };
    setCountItems(next);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateCount({
      warehouse_id: selectedWarehouseId,
      purpose: countPurpose,
      participants,
      notes: countNotes,
      items: countItems
    });
    setIsCreateOpen(false);
  };

  const handleConfirmAdjust = async () => {
    if (!selectedCount || !adjustReason.trim() || !adjustRef.trim()) return;
    await onPostAdjustment(selectedCount.id, {
      adjustment_reason: adjustReason,
      adjustment_document_ref: adjustRef
    });
    setIsAdjustModalOpen(false);
    setSelectedCount(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Bản Nháp', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'in_progress':
        return { label: 'Đang Kiểm Đếm', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'completed':
        return { label: 'Chờ Duyệt Kết Quả', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'approved':
        return { label: 'Đã Duyệt (Chờ Điều Chỉnh Tồn)', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'adjusted':
        return { label: 'Đã Điều Chỉnh Khớp Sổ Kho', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getPurposeLabel = (p: string) => {
    switch (p) {
      case 'monthly': return 'Định kỳ hàng tháng';
      case 'quarterly': return 'Định kỳ quý';
      case 'annual': return 'Kiểm kê cuối năm';
      case 'surprise': return 'Kiểm kê đột xuất';
      default: return 'Khác';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Quản Lý Kiểm Kê Kho</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {counts.length} đợt kiểm kê
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            So chiếu Tồn Sổ Sách vs Tồn Thực Tế. Tự động tính chênh lệch và điều chỉnh tồn kho khi được Admin phê chuẩn.
          </p>
        </div>

        <button
          onClick={() => handleInitCreateModal(warehouses[0]?.id || '')}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Lập Đợt Kiểm Kê Mới
        </button>
      </div>

      {/* Counts List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {counts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có đợt kiểm kê nào được lập</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã Đợt & Ngày Lập</th>
                  <th className="py-3 px-4">Kho Kiểm Kê</th>
                  <th className="py-3 px-4">Mục Đích & Hội Đồng</th>
                  <th className="py-3 px-4 text-center">Số Mặt Hàng</th>
                  <th className="py-3 px-4">Người Lập / Duyệt</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {counts.map(c => {
                  const badge = getStatusBadge(c.status);
                  const canSubmit = c.status === 'draft' || c.status === 'in_progress';
                  const canApprove = currentUser.role === 'admin' && c.status === 'completed';
                  const canAdjust = currentUser.role === 'admin' && c.status === 'approved';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs text-cyan-800">{c.code}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {new Date(c.count_date).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">[{c.warehouse_code}]</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{c.warehouse_name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{getPurposeLabel(c.purpose)}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={c.participants}>
                          {c.participants}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900">{c.items.length}</span>
                        <div className="text-[10px] text-slate-400">vật tư</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">Lập: {c.creator_name}</div>
                        {c.approver_name && (
                          <div className="text-[11px] text-slate-500">Duyệt: {c.approver_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCount(c)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Xem bảng chi tiết chênh lệch"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canSubmit && (
                            <button
                              onClick={() => onSubmitCount(c.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-xs"
                            >
                              Chốt kết quả
                            </button>
                          )}

                          {canApprove && (
                            <button
                              onClick={() => onApproveCount(c.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Phê duyệt
                            </button>
                          )}

                          {canAdjust && (
                            <button
                              onClick={() => {
                                setSelectedCount(c);
                                setIsAdjustModalOpen(true);
                              }}
                              className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                              title="Tự động ghi nhận điều chỉnh sổ kho và cập nhật tồn kho theo kết quả kiểm kê"
                            >
                              <FileCheck className="w-3.5 h-3.5" /> Điều chỉnh tồn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal for Count */}
      {selectedCount && !isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base">Bảng Đối Chiếu Kiểm Kê: {selectedCount.code}</h3>
                  <p className="text-xs text-slate-400">Kho: {selectedCount.warehouse_name} • Ngày: {new Date(selectedCount.count_date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCount(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Tên & Mã Vật Tư</th>
                      <th className="py-2.5 px-3 text-right">Tồn Sổ Sách</th>
                      <th className="py-2.5 px-3 text-right">Thực Tế Kiểm Đếm</th>
                      <th className="py-2.5 px-3 text-right">Chênh Lệch</th>
                      <th className="py-2.5 px-3">Nguyên Nhân & Đề Xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCount.items.map((item, idx) => {
                      const diff = item.difference_quantity;
                      let diffColor = 'text-slate-700';
                      if (diff > 0) diffColor = 'text-emerald-600 font-bold';
                      if (diff < 0) diffColor = 'text-rose-600 font-bold';

                      return (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.material_name}</div>
                            <div className="font-mono text-[10px] text-cyan-700">{item.material_code}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                            {formatNumber(item.book_quantity)} {item.unit_name}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatNumber(item.actual_quantity)} {item.unit_name}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${diffColor}`}>
                            {diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)} {item.unit_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            <div>{item.discrepancy_reason || '—'}</div>
                            {item.action_proposal && (
                              <div className="text-slate-400 text-[10px] italic">Đề xuất: {item.action_proposal}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedCount.notes && (
                <div className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Ghi chú đợt:</span> {selectedCount.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              {currentUser.role === 'admin' && selectedCount.status === 'approved' && (
                <button
                  onClick={() => setIsAdjustModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" /> Tiến hành điều chỉnh tồn kho
                </button>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => setSelectedCount(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Count Batch */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">Lập Biên Bản Kiểm Kê Kho</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kho Cần Kiểm Kê <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={e => handleInitCreateModal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        [{w.code}] {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mục Đích Kiểm Kê <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={countPurpose}
                    onChange={e => setCountPurpose(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    <option value="quarterly">Định kỳ quý</option>
                    <option value="monthly">Định kỳ hàng tháng</option>
                    <option value="annual">Kiểm kê cuối năm</option>
                    <option value="surprise">Kiểm kê đột xuất</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hội Đồng / Thành Phần Tham Gia Kiểm Kê *</label>
                <input
                  type="text"
                  required
                  value={participants}
                  onChange={e => setParticipants(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Items Actual Quantities */}
              <div className="space-y-2 pt-2">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Nhập Số Liệu Kiểm Đếm Thực Tế Tại Kho:
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Vật tư</th>
                        <th className="py-2 px-3 text-right">Tồn Sổ Sách</th>
                        <th className="py-2 px-3 text-right w-36">Thực Tế</th>
                        <th className="py-2 px-3">Nguyên nhân chênh lệch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {countItems.map((item, idx) => {
                        const mat = materials.find(m => m.id === item.material_id);
                        const bal = stockBalances.find(b => b.warehouse_id === selectedWarehouseId && b.material_id === item.material_id);
                        const bookQty = bal ? bal.quantity : 0;

                        return (
                          <tr key={item.material_id}>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900">{mat?.name}</div>
                              <div className="font-mono text-[10px] text-cyan-700">{mat?.code}</div>
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-700">
                              {formatNumber(bookQty)} {mat?.unit_name}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                required
                                value={item.actual_quantity}
                                onChange={e => handleActualQtyChange(idx, Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-slate-300 rounded-lg text-right font-bold focus:outline-none focus:border-cyan-500"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.reason}
                                onChange={e => handleReasonChange(idx, e.target.value)}
                                placeholder="Ghi nhận nếu có thừa/thiếu..."
                                className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Đợt Kiểm Kê</label>
                <textarea
                  rows={2}
                  value={countNotes}
                  onChange={e => setCountNotes(e.target.value)}
                  placeholder="Ghi chú thêm về điều kiện kiểm kê, tình trạng niêm phong kho..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Lưu Biên Bản Kiểm Kê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Inventory Modal (Admin only) */}
      {isAdjustModalOpen && selectedCount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Xác Nhận Điều Chỉnh Tồn Kho Theo Kiểm Kê
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hành động này sẽ tự động sinh các bút toán điều chỉnh tăng/giảm trong sổ biến động kho, đồng thời cập nhật số dư tồn kho của các mặt hàng khớp 100% với số lượng thực tế kiểm đếm.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý Do Điều Chỉnh Tồn Kho <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số Quyết Định / Biên Bản Phê Duyệt <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={adjustRef}
                onChange={e => setAdjustRef(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 text-xs border border-slate-300 text-slate-700 rounded-xl font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
              >
                Ghi Nhận Điều Chỉnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
