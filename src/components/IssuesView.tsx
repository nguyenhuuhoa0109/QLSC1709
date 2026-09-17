import React, { useState } from 'react';
import {
  IssueDocument,
  IssueItem,
  Material,
  Warehouse,
  StockBalance,
  UserProfile
} from '../types';
import { formatCurrency, formatNumber } from '../api';
import {
  ArrowUpFromLine,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Check,
  X,
  FileCheck,
  Building2,
  Calendar,
  AlertTriangle,
  Eye,
  Trash2,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';

interface IssuesViewProps {
  issues: IssueDocument[];
  materials: Material[];
  warehouses: Warehouse[];
  stockBalances: StockBalance[];
  currentUser: UserProfile;
  onCreateIssue: (payload: any) => Promise<void>;
  onSubmitIssue: (id: string) => Promise<void>;
  onApproveIssue: (id: string) => Promise<void>;
  onRejectIssue: (id: string, reason: string) => Promise<void>;
  onPostIssue: (id: string) => Promise<void>;
}

export const IssuesView: React.FC<IssuesViewProps> = ({
  issues,
  materials,
  warehouses,
  stockBalances,
  currentUser,
  onCreateIssue,
  onSubmitIssue,
  onApproveIssue,
  onRejectIssue,
  onPostIssue
}) => {
  const [statusTab, setStatusTab] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<IssueDocument | null>(null);

  // Modal create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [formData, setFormData] = useState({
    warehouse_id: warehouses[0]?.id || '',
    purpose: 'regular_repair',
    recipient_name: '',
    department: 'Tổ Vận Hành Tổ Máy (TĐ Sơn Trà 1)',
    work_order_ref: '',
    notes: '',
    items: [
      {
        material_id: materials.find(m => m.is_active)?.id || '',
        quantity: 1,
        system_used: 'Hệ thống Tuabin Francis',
        installation_location: 'Gối trục trên tổ máy H1',
        notes: ''
      }
    ]
  });

  const activeMaterials = materials.filter(m => m.is_active);

  const filteredIssues = issues.filter(i => {
    if (statusTab === 'all') return true;
    return i.status === statusTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Bản Nháp', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'pending_approval':
        return { label: 'Chờ Phê Duyệt', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'approved':
        return { label: 'Đã Duyệt (Sẵn sàng xuất)', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'approved_insufficient_stock':
        return { label: 'Đã Duyệt - Chưa Đủ Tồn (Bị Chặn)', bg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' };
      case 'posted':
        return { label: 'Đã Xuất Kho (Đã trừ tồn)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'rejected':
        return { label: 'Từ Chối', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getPurposeLabel = (p: string) => {
    switch (p) {
      case 'regular_repair': return 'Sửa chữa thường xuyên';
      case 'major_overhaul': return 'Đại tu / Sửa chữa lớn';
      case 'incident_response': return 'Xử lý sự cố đột xuất';
      case 'routine_operation': return 'Vận hành định kỳ';
      default: return 'Khác';
    }
  };

  // Helper to check stock in current warehouse
  const getAvailableStock = (warehouseId: string, materialId: string): number => {
    const balance = stockBalances.find(b => b.warehouse_id === warehouseId && b.material_id === materialId);
    return balance ? balance.quantity : 0;
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
          system_used: 'Hệ thống Phân phối 110kV',
          installation_location: '',
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
    await onCreateIssue(formData);
    setIsCreateOpen(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalId || !rejectReason.trim()) return;
    await onRejectIssue(rejectModalId, rejectReason);
    setRejectModalId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Quản Lý Xuất Kho</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {issues.length} phiếu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm soát nguyên tử: Chỉ xuất khi đã duyệt, tồn kho đủ 100% tất cả các dòng, tuyệt đối không âm kho.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              warehouse_id: warehouses[0]?.id || '',
              purpose: 'regular_repair',
              recipient_name: '',
              department: 'Tổ Vận Hành Tổ Máy (TĐ Sơn Trà 1)',
              work_order_ref: '',
              notes: '',
              items: [
                {
                  material_id: activeMaterials[0]?.id || '',
                  quantity: 1,
                  system_used: 'Hệ thống Tuabin Francis',
                  installation_location: 'Gối trục tổ máy H1',
                  notes: ''
                }
              ]
            });
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Lập Phiếu Xuất Mới
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'draft', label: 'Bản nháp' },
          { id: 'pending_approval', label: 'Chờ duyệt' },
          { id: 'approved', label: 'Đã duyệt' },
          { id: 'approved_insufficient_stock', label: 'Đã duyệt - Chưa đủ tồn' },
          { id: 'posted', label: 'Đã xuất kho' },
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

      {/* Issues Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ArrowUpFromLine className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có phiếu xuất nào trong mục này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã Phiếu & Ngày Lập</th>
                  <th className="py-3 px-4">Kho Xuất</th>
                  <th className="py-3 px-4">Mục Đích & Đơn Vị Nhận</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền Xuất</th>
                  <th className="py-3 px-4">Người Lập / Duyệt</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Hành Động Nghiệp Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.map(i => {
                  const badge = getStatusBadge(i.status);
                  const isCreator = currentUser.id === i.creator_id;
                  const canSubmit = (currentUser.role === 'admin' || currentUser.role === 'storekeeper' || isCreator) && i.status === 'draft';
                  const canApprove = (currentUser.role === 'admin' || currentUser.role === 'storekeeper') && i.status === 'pending_approval' && !isCreator;
                  const canPost = (currentUser.role === 'admin' || currentUser.role === 'storekeeper') && (i.status === 'approved' || i.status === 'approved_insufficient_stock');

                  return (
                    <tr key={i.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs text-cyan-800">{i.code}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {new Date(i.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">[{i.warehouse_code}]</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{i.warehouse_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{getPurposeLabel(i.purpose)}</div>
                        <div className="text-[11px] text-slate-500">
                          Nhận: <span className="font-semibold text-slate-700">{i.recipient_name}</span> ({i.department})
                          {i.work_order_ref ? ` • Lệnh: ${i.work_order_ref}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                        {formatCurrency(i.total_amount)}
                        <div className="text-[10px] text-slate-500 font-normal">{i.items.length} dòng vật tư</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">Lập: {i.creator_name}</div>
                        {i.approver_name && (
                          <div className="text-[11px] text-slate-500">Duyệt: {i.approver_name}</div>
                        )}
                        {i.rejection_reason && (
                          <div className="text-[10px] text-rose-600 font-medium max-w-[150px] truncate" title={i.rejection_reason}>
                            Lý do: {i.rejection_reason}
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
                            onClick={() => setSelectedIssue(i)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Xem chi tiết phiếu xuất"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Action 1: Submit draft */}
                          {canSubmit && (
                            <button
                              onClick={() => onSubmitIssue(i.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-xs"
                            >
                              Gửi duyệt
                            </button>
                          )}

                          {/* Action 2: Approve or Reject */}
                          {canApprove && (
                            <>
                              <button
                                onClick={() => onApproveIssue(i.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Duyệt
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalId(i.id);
                                  setRejectReason('');
                                }}
                                className="px-2 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition"
                              >
                                Từ chối
                              </button>
                            </>
                          )}

                          {/* Action 3: POST ISSUE -> Strictly validates atomic stock availability */}
                          {canPost && (
                            <button
                              onClick={() => onPostIssue(i.id)}
                              className={`px-3 py-1.5 text-xs font-bold text-white rounded-lg transition shadow-xs flex items-center gap-1.5 ${
                                i.status === 'approved_insufficient_stock'
                                  ? 'bg-amber-600 hover:bg-amber-700'
                                  : 'bg-cyan-700 hover:bg-cyan-800'
                              }`}
                              title="Thực hiện ghi nhận xuất kho (Kiểm tra tồn kho nguyên tử)"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              {i.status === 'approved_insufficient_stock' ? 'Thử xuất lại' : 'Xuất kho'}
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

      {/* Modal: View Issue Details */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ArrowUpFromLine className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base">Chi Tiết Phiếu Xuất Kho: {selectedIssue.code}</h3>
                  <p className="text-xs text-slate-400">{getPurposeLabel(selectedIssue.purpose)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Kho xuất hàng:</span>
                  <span className="font-bold text-slate-900">{selectedIssue.warehouse_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Trạng thái:</span>
                  <span className="font-bold text-cyan-800">{getStatusBadge(selectedIssue.status).label}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Người nhận & Đơn vị:</span>
                  <span className="font-bold text-slate-900">{selectedIssue.recipient_name} ({selectedIssue.department})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lệnh / Phiếu công tác:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedIssue.work_order_ref || '—'}</span>
                </div>
              </div>

              {selectedIssue.status === 'approved_insufficient_stock' && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-start gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Cảnh báo kiểm soát tồn kho:</span> Phiếu đã được phê duyệt nhưng hiện tại một hoặc nhiều vật tư trong kho không có đủ số lượng đáp ứng. Hệ thống đã tự động chặn xuất và giữ nguyên số dư tồn kho.
                  </div>
                </div>
              )}

              {selectedIssue.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <span className="font-bold">Lý do từ chối:</span> {selectedIssue.rejection_reason}
                </div>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Tên & Mã Vật Tư</th>
                      <th className="py-2.5 px-3 text-right">Tồn Hiện Tại</th>
                      <th className="py-2.5 px-3 text-right">Số Lượng Xuất</th>
                      <th className="py-2.5 px-3 text-right">Đơn Giá Bình Quân</th>
                      <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                      <th className="py-2.5 px-3">Hệ Thống Lắp Đặt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedIssue.items.map((item, idx) => {
                      const avail = getAvailableStock(selectedIssue.warehouse_id, item.material_id);
                      const isShort = selectedIssue.status !== 'posted' && avail < item.quantity;

                      return (
                        <tr key={item.id} className={isShort ? 'bg-rose-50/60' : ''}>
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.material_name}</div>
                            <div className="font-mono text-[10px] text-cyan-700">{item.material_code}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`font-semibold ${isShort ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                              {selectedIssue.status === 'posted' ? '—' : `${formatNumber(avail)} ${item.unit_name}`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatNumber(item.quantity)} {item.unit_name}
                            {isShort && (
                              <div className="text-[10px] text-rose-600 font-bold flex items-center justify-end gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> Thiếu {formatNumber(item.quantity - avail)}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatCurrency(item.total_amount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            <div>{item.system_used || '—'}</div>
                            <div className="text-slate-400 text-[10px]">{item.installation_location}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="py-3 px-3 text-right text-slate-700 uppercase text-[11px]">
                        Tổng Cộng Giá Trị Xuất Kho:
                      </td>
                      <td className="py-3 px-3 text-right text-slate-950 font-bold text-sm">
                        {formatCurrency(selectedIssue.total_amount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedIssue.notes && (
                <div className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Ghi chú phiếu:</span> {selectedIssue.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedIssue(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Issue */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">Lập Phiếu Yêu Cầu Xuất Kho</h3>
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
                    Kho Xuất Vật Tư <span className="text-rose-600">*</span>
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
                    Mục Đích Xuất <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    <option value="regular_repair">Sửa chữa thường xuyên</option>
                    <option value="major_overhaul">Đại tu / Sửa chữa lớn</option>
                    <option value="incident_response">Xử lý sự cố đột xuất</option>
                    <option value="routine_operation">Vận hành định kỳ</option>
                    <option value="other">Xuất khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người Nhận Vật Tư <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_name}
                    onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                    placeholder="VD: Nguyễn Văn A (Trưởng ca)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Đơn Vị / Tổ / Đội Tiếp Nhận <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Tổ Cơ khí / Vận hành / Điện..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số Lệnh / Phiếu Công Tác</label>
                  <input
                    type="text"
                    value={formData.work_order_ref}
                    onChange={e => setFormData({ ...formData, work_order_ref: e.target.value })}
                    placeholder="VD: LCT-2025-014"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Danh Sách Vật Tư Xuất Dùng:
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
                  {formData.items.map((item, idx) => {
                    const availableStock = getAvailableStock(formData.warehouse_id, item.material_id);
                    const isExceeding = item.quantity > availableStock;

                    return (
                      <div
                        key={idx}
                        className={`p-3 border rounded-xl space-y-2 transition ${
                          isExceeding ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 text-[11px]">Dòng {idx + 1}</span>
                            <span className="text-[11px] text-slate-500">
                              Tồn kho hiện hữu: <strong className="text-slate-800">{formatNumber(availableStock)}</strong>
                            </span>
                            {isExceeding && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.2 rounded border border-rose-200">
                                ⚠ Yêu cầu vượt tồn hiện tại!
                              </span>
                            )}
                          </div>
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                            <label className="block text-[11px] text-slate-500 mb-0.5">Số lượng xuất *</label>
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-0.5">Hệ thống thiết bị sử dụng</label>
                            <input
                              type="text"
                              value={item.system_used}
                              onChange={e => handleItemChange(idx, 'system_used', e.target.value)}
                              placeholder="VD: Hệ thống Tuabin Francis H1"
                              className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-0.5">Vị trí lắp đặt / Ghi chú</label>
                            <input
                              type="text"
                              value={item.installation_location}
                              onChange={e => handleItemChange(idx, 'installation_location', e.target.value)}
                              placeholder="Gối trục, van đĩa hạ lưu..."
                              className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Yêu Cầu</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú chi tiết lý do xuất..."
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
                  Lập Phiếu Xuất Nháp
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
            <h3 className="text-base font-bold text-rose-700">Xác Nhận Từ Chối Phiếu Xuất</h3>
            <p className="text-xs text-slate-600">
              Vui lòng nêu rõ lý do từ chối phê duyệt để người lập phiếu công tác xử lý theo quy định.
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
