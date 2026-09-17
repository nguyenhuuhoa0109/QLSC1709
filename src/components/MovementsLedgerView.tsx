import React, { useState } from 'react';
import { StockMovement, Warehouse, Material } from '../types';
import { formatCurrency, formatNumber } from '../api';
import {
  History,
  Search,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  Calendar,
  Building2,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface MovementsLedgerViewProps {
  movements: StockMovement[];
  warehouses: Warehouse[];
  materials: Material[];
  selectedWarehouse: string;
  onSelectWarehouse: (id: string) => void;
  filterMaterialId?: string | null;
  onClearMaterialFilter?: () => void;
}

export const MovementsLedgerView: React.FC<MovementsLedgerViewProps> = ({
  movements,
  warehouses,
  materials,
  selectedWarehouse,
  onSelectWarehouse,
  filterMaterialId,
  onClearMaterialFilter
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedMatFilter, setSelectedMatFilter] = useState<string>(filterMaterialId || 'all');

  const filteredMovements = movements.filter(m => {
    const matchWh = selectedWarehouse === 'all' || m.warehouse_id === selectedWarehouse;
    const matchType = selectedType === 'all' || m.movement_type === selectedType;
    const matchMat = selectedMatFilter === 'all' || m.material_id === selectedMatFilter;
    const matchSearch =
      (m.material_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.material_code || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.document_code || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.actor_name || '').toLowerCase().includes(search.toLowerCase());

    return matchWh && matchType && matchMat && matchSearch;
  });

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'receipt':
        return {
          label: 'Nhập kho',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: ArrowDownToLine,
          sign: '+'
        };
      case 'issue':
        return {
          label: 'Xuất kho',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: ArrowUpFromLine,
          sign: '-'
        };
      case 'adjustment_increase':
        return {
          label: 'Điều chỉnh tăng',
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: SlidersHorizontal,
          sign: '+'
        };
      case 'adjustment_decrease':
        return {
          label: 'Điều chỉnh giảm',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: SlidersHorizontal,
          sign: '-'
        };
      default:
        return {
          label: type,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: History,
          sign: ''
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Sổ Nhật Ký Biến Động Nhập Xuất</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredMovements.length} bản ghi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu bất biến ghi vết từng giao dịch: Thời điểm, thủ kho, mã chứng từ, số dư trước và sau biến động.
          </p>
        </div>

        {filterMaterialId && onClearMaterialFilter && (
          <button
            onClick={onClearMaterialFilter}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl hover:bg-rose-100 transition"
          >
            ✕ Bỏ lọc thẻ kho vật tư
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, vật tư, người lập..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Warehouse */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={e => onSelectWarehouse(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white font-medium"
            >
              <option value="all">Toàn bộ các kho</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  [{w.code}] {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white font-medium"
            >
              <option value="all">Tất cả loại giao dịch</option>
              <option value="receipt">Nhập kho (+)</option>
              <option value="issue">Xuất kho (-)</option>
              <option value="adjustment_increase">Điều chỉnh tăng (+)</option>
              <option value="adjustment_decrease">Điều chỉnh giảm (-)</option>
            </select>
          </div>

          {/* Material Select */}
          <div>
            <select
              value={selectedMatFilter}
              onChange={e => setSelectedMatFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white font-medium"
            >
              <option value="all">Tất cả vật tư</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.code}] {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-16 px-4">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có giao dịch biến động nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Thời Gian & Chứng Từ</th>
                  <th className="py-3 px-4">Vật Tư & Kho</th>
                  <th className="py-3 px-4">Loại Giao Dịch</th>
                  <th className="py-3 px-4 text-right">Số Lượng Biến Động</th>
                  <th className="py-3 px-4 text-right">Tồn Trước → Sau</th>
                  <th className="py-3 px-4 text-right">Đơn Giá & Thành Tiền</th>
                  <th className="py-3 px-4">Người Thực Hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map(m => {
                  const badge = getMovementTypeBadge(m.movement_type);
                  const Icon = badge.icon;
                  const isPositive = m.quantity_change > 0;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs text-cyan-800">
                          {m.document_code}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(m.created_at).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{m.material_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <span className="text-cyan-700 font-semibold">{m.material_code}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{m.warehouse_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                          <Icon className="w-3 h-3" /> {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-extrabold ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPositive ? `+${formatNumber(m.quantity_change)}` : formatNumber(m.quantity_change)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium ml-1">{m.unit_name}</span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-xs">
                        <span className="text-slate-500">{formatNumber(m.before_quantity)}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-bold text-slate-900">{formatNumber(m.after_quantity)}</span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatCurrency(m.total_amount)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Đơn giá: {formatCurrency(m.unit_price)}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{m.actor_name}</div>
                        {m.notes && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{m.notes}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Immutability Notice */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Cam kết bất biến dữ liệu (Append-Only):</span> Nhật ký biến động nhập xuất lưu giữ lịch sử kiểm toán tuyệt đối, không có chức năng xóa hay sửa đổi hồi tố. Mọi điều chỉnh thực tế bắt buộc phải lập biên bản kiểm kê và ghi nhận thành các bản ghi tăng/giảm mới đối ứng.
        </div>
      </div>
    </div>
  );
};
