import React, { useState } from 'react';
import {
  ReceiptDocument,
  ReceiptItem,
  Material,
  Warehouse,
  UserProfile
} from '../types';
import { formatCurrency, formatNumber } from '../api';
import {
  ArrowDownToLine,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Check,
  X,
  FileCheck,
  Building2,
  Calendar,
  Layers,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';

interface ReceiptsViewProps {
  receipts: ReceiptDocument[];
  materials: Material[];
  warehouses: Warehouse[];
  currentUser: UserProfile;
  onCreateReceipt: (payload: any) => Promise<void>;
  onSubmitReceipt: (id: string) => Promise<void>;
  onApproveReceipt: (id: string) => Promise<void>;
  onRejectReceipt: (id: string, reason: string) => Promise<void>;
  onPostReceipt: (id: string) => Promise<void>;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  receipts,
  materials,
  warehouses,
  currentUser,
  onCreateReceipt,
  onSubmitReceipt,
  onApproveReceipt,
  onRejectReceipt,
  onPostReceipt
}) => {
  const [statusTab, setStatusTab] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDocument | null>(null);

  // Modal create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [formData, setFormData] = useState({
    warehouse_id: warehouses[0]?.id || '',
    receipt_type: 'purchase_new',
    supplier_name: '',
    invoice_number: '',
    notes: '',
    items: [
      {
        material_id: materials.find(m => m.is_active)?.id || '',
        quantity: 1,
        unit_price: 100000,
        storage_location: 'Kệ A-01',
        notes: ''
      }
    ]
  });

  const activeMaterials = materials.filter(m => m.is_active);

  const filteredReceipts = receipts.filter(r => {
    if (statusTab === 'all') return true;
    return r.status === statusTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Bản Nháp', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'pending_approval':
        return { label: 'Chờ Phê Duyệt', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'approved':
        return { label: 'Đã Duyệt (Sẵn sàng nhập)', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'posted':
        return { label: 'Đã Nhập Kho (Đã tăng tồn)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'rejected':
        return { label: 'Từ Chối', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getReceiptTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase_new': return 'Mua sắm mới';
      case 'internal_transfer': return 'Điều chuyển nội bộ';
      case 'recovery_after_repair': return 'Thu hồi sau sửa chữa';
      default: return 'Khác';
    }
  };

  const handleAddItem = () => {
    const defaultMat = activeMaterials[0];
    if (!defaultMat) return;
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          material_id: defaultMat.id,
          quantity: 1,
          unit_price: 50000,
          storage_location: 'Kệ A-01',
          notes: ''
        }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    const next = [...formData.items];
    next.splice(index, 1);
    setFormData({ ...formData, items: next });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const next = [...formData.items];
    next[index] = { ...next[index], [field]: value };
    setFormData({ ...formData, items: next });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateReceipt(formData);
    setIsCreateOpen(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalId || !rejectReason.trim()) return;
    await onRejectReceipt(rejectModalId, rejectReason);
    setRejectModalId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Quản Lý Nhập Kho</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {receipts.length} phiếu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình: Lập phiếu → Trình duyệt → Phê duyệt → Ghi nhận nhập kho (Tăng tồn kho & bình quân gia quyền).
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              warehouse_id: warehouses[0]?.id || '',
              receipt_type: 'purchase_new',
              supplier_name: '',
              invoice_number: '',
              notes: '',
              items: [
                {
                  material_id: activeMaterials[0]?.id || '',
                  quantity: 1,
                  unit_price: 100000,
                  storage_location: 'Kệ A-01',
                  notes: ''
                }
              ]
            });
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Lập Phiếu Nhập Mới
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'draft', label: 'Bản nháp' },
          { id: 'pending_approval', label: 'Chờ duyệt' },
          { id: 'approved', label: 'Đã duyệt' },
          { id: 'posted', label: 'Đã nhập kho' },
          { id: 'rejected', label: 'Từ chối' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              statusTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ArrowDownToLine className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có phiếu nhập nào trong mục này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã Phiếu & Ngày Lập</th>
                  <th className="py-3 px-4">Kho Nhập</th>
                  <th className="py-3 px-4">Loại Nhập & Đơn Vị Giao</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền</th>
                  <th className="py-3 px-4">Người Lập / Duyệt</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Hành Động Nghiệp Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map(r => {
                  const badge = getStatusBadge(r.status);
                  const isCreator = currentUser.id === r.creator_id;
                  const canSubmit = (currentUser.role === 'admin' || currentUser.role === 'storekeeper' || isCreator) && r.status === 'draft';
                  const canApprove = (currentUser.role === 'admin' || currentUser.role === 'storekeeper') && r.status === 'pending_approval' && !isCreator;
                  const canPost = (currentUser.role === 'admin' || currentUser.role === 'storekeeper') && r.status === 'approved';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs text-cyan-800">{r.code}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {new Date(r.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">[{r.warehouse_code}]</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{r.warehouse_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{getReceiptTypeLabel(r.receipt_type)}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.supplier_name ? `NCC: ${r.supplier_name}` : '—'}
                          {r.invoice_number ? ` • HĐ: ${r.invoice_number}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                        {formatCurrency(r.total_amount)}
                        <div className="text-[10px] text-slate-500 font-normal">{r.items.length} dòng vật tư</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">Lập: {r.creator_name}</div>
                        {r.approver_name && (
                          <div className="text-[11px] text-slate-500">Duyệt: {r.approver_name}</div>
                        )}
                        {r.rejection_reason && (
                          <div className="text-[10px] text-rose-600 font-medium max-w-[150px] truncate" title={r.rejection_reason}>
                            Lý do: {r.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setSelectedReceipt(r)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Xem chi tiết phiếu"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Action 1: Submit draft for approval */}
                          {canSubmit && (
                            <button
                              onClick={() => onSubmitReceipt(r.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-xs"
                            >
                              Gửi duyệt
                            </button>
                          )}

                          {/* Action 2: Approve or Reject (Admin or Authorized Storekeeper, different from creator) */}
                          {canApprove && (
                            <>
                              <button
                                onClick={() => onApproveReceipt(r.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Duyệt
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalId(r.id);
                                  setRejectReason('');
                                }}
                                className="px-2 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition"
                              >
                                Từ chối
                              </button>
                            </>
                          )}

                          {/* Action 3: POST RECEIPT -> updates stock balances & logs immutable movements */}
                          {canPost && (
                            <button
                              onClick={() => onPostReceipt(r.id)}
                              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
                              title="Ghi nhận vào sổ kho và cập nhật số dư tồn"
                            >
                              <FileCheck className="w-3.5 h-3.5" /> Nhập kho
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

      {/* Modal: View Receipt Details */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ArrowDownToLine className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base">Chi Tiết Phiếu Nhập Kho: {selectedReceipt.code}</h3>
                  <p className="text-xs text-slate-400">{getReceiptTypeLabel(selectedReceipt.receipt_type)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Kho tiếp nhận:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.warehouse_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Trạng thái:</span>
                  <span className="font-bold text-cyan-800">{getStatusBadge(selectedReceipt.status).label}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Nhà cung cấp / Đơn vị giao:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.supplier_name || 'Nội bộ'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Hóa đơn / Chứng từ:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.invoice_number || '—'}</span>
                </div>
              </div>

              {selectedReceipt.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <span className="font-bold">Lý do từ chối:</span> {selectedReceipt.rejection_reason}
                </div>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Tên & Mã Vật Tư</th>
                      <th className="py-2.5 px-3 text-right">Số Lượng</th>
                      <th className="py-2.5 px-3 text-right">Đơn Giá Nhập</th>
                      <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                      <th className="py-2.5 px-3">Vị Trí Lưu Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReceipt.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.material_name}</div>
                          <div className="font-mono text-[10px] text-cyan-700">{item.material_code}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {formatNumber(item.quantity)} {item.unit_name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(item.total_amount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {item.storage_location || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-right text-slate-700 uppercase text-[11px]">
                        Tổng Cộng Tiền Nhập Kho:
                      </td>
                      <td className="py-3 px-3 text-right text-slate-950 font-bold text-sm">
                        {formatCurrency(selectedReceipt.total_amount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedReceipt.notes && (
                <div className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Ghi chú phiếu:</span> {selectedReceipt.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Receipt */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">Lập Phiếu Đề Nghị Nhập Kho</h3>
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
                    Kho Tiếp Nhận <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.warehouse_id}
                    onChange={e => setFormData({ ...formData, warehouse_id: e.target.value })}
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
                    Loại Nhập Kho <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.receipt_type}
                    onChange={e => setFormData({ ...formData, receipt_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    <option value="purchase_new">Mua sắm mới định kỳ / đột xuất</option>
                    <option value="internal_transfer">Điều chuyển từ kho nội bộ khác</option>
                    <option value="recovery_after_repair">Thu hồi sau sửa chữa / gia công</option>
                    <option value="other">Nhập khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhà Cung Cấp / Đơn Vị Giao</label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={e => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="VD: Cty TNHH Thiết bị Thủy điện..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số Hóa Đơn / Phiếu Giao Hàng</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="VD: HĐ-001289"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Danh Sách Vật Tư Nhập Kho:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 transition"
                  >
                    + Thêm dòng vật tư
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 text-[11px]">Dòng {idx + 1}</span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-slate-500 mb-0.5">Vật tư *</label>
                          <select
                            value={item.material_id}
                            onChange={e => handleItemChange(idx, 'material_id', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:outline-none focus:border-cyan-500"
                          >
                            {activeMaterials.map(m => (
                              <option key={m.id} value={m.id}>
                                [{m.code}] {m.name} ({m.unit_name})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Số lượng *</label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            required
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Đơn giá nhập (VNĐ) *</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            required
                            value={item.unit_price}
                            onChange={e => handleItemChange(idx, 'unit_price', Number(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Vị trí lưu kho</label>
                          <input
                            type="text"
                            value={item.storage_location}
                            onChange={e => handleItemChange(idx, 'storage_location', e.target.value)}
                            placeholder="VD: Kệ A-01, Giá B-03..."
                            className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Ghi chú dòng</label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={e => handleItemChange(idx, 'notes', e.target.value)}
                            placeholder="Số lô, hạn bảo quản..."
                            className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Chung</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Mục đích nhập, tình trạng kiện hàng..."
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
                  Lập Phiếu Nháp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-700">Xác Nhận Từ Chối Phiếu</h3>
            <p className="text-xs text-slate-600">
              Vui lòng nêu rõ nguyên nhân từ chối để người lập phiếu cập nhật hoặc hủy bỏ theo đúng quy trình kiểm toán.
            </p>
            <div>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối (bắt buộc)..."
                className="w-full p-2.5 text-xs border border-rose-300 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalId(null)}
                className="px-4 py-2 text-xs border border-slate-300 text-slate-700 rounded-xl font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
