import React, { useState } from 'react';
import { StockBalance, Warehouse } from '../types';
import { formatCurrency, formatNumber } from '../api';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  DollarSign,
  Package,
  Layers,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

interface StockBalancesViewProps {
  balances: StockBalance[];
  warehouses: Warehouse[];
  selectedWarehouse: string;
  onSelectWarehouse: (id: string) => void;
  onViewMovementsForMaterial?: (materialId: string) => void;
}

export const StockBalancesView: React.FC<StockBalancesViewProps> = ({
  balances,
  warehouses,
  selectedWarehouse,
  onSelectWarehouse,
  onViewMovementsForMaterial
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'low' | 'out'>('all');

  const filtered = balances.filter(b => {
    const matchSearch =
      (b.material_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.material_code || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.stock_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = filtered.reduce((acc, b) => acc + b.total_value, 0);
  const totalItems = filtered.reduce((acc, b) => acc + b.quantity, 0);
  const lowStockCount = filtered.filter(b => b.stock_status === 'low').length;
  const outOfStockCount = filtered.filter(b => b.stock_status === 'out').length;

  const getStatusPill = (status: 'normal' | 'low' | 'out', minStock: number) => {
    switch (status) {
      case 'out':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" /> Hết Hàng (0)
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Tồn Thấp (&lt; {minStock})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bình Thường
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng Giá Trị Tồn Kho</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalValue)}</div>
            <span className="text-[11px] text-cyan-700 font-semibold">Theo giá bình quân gia quyền</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Số Mặt Hàng Tồn Hiện Có</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{filtered.length} vật tư</div>
            <span className="text-[11px] text-slate-500">Phân bố tại các kho</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Cảnh Báo Tồn Dưới Định Mức</span>
            <div className="text-xl font-extrabold text-amber-600 mt-1">{lowStockCount} mặt hàng</div>
            <span className="text-[11px] text-amber-700 font-medium">Cần lập kế hoạch mua sắm</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Mặt Hàng Hết Tồn Kho</span>
            <div className="text-xl font-extrabold text-rose-600 mt-1">{outOfStockCount} mặt hàng</div>
            <span className="text-[11px] text-rose-700 font-medium">Số dư tồn = 0</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã vật tư..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Warehouse Selector */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={e => onSelectWarehouse(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white font-medium"
            >
              <option value="all">Toàn bộ các kho (Sơn Trà 1)</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  [{w.code}] {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white font-medium"
            >
              <option value="all">Tất cả trạng thái tồn</option>
              <option value="normal">Bình thường (Đủ định mức)</option>
              <option value="low">Tồn thấp (Dưới định mức)</option>
              <option value="out">Hết hàng (Tồn = 0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Balances Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy bản ghi tồn kho nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã & Tên Vật Tư</th>
                  <th className="py-3 px-4">Kho Lưu Giữ</th>
                  <th className="py-3 px-4 text-right">Số Lượng Tồn</th>
                  <th className="py-3 px-4 text-right">Đơn Giá Bình Quân</th>
                  <th className="py-3 px-4 text-right">Tổng Giá Trị</th>
                  <th className="py-3 px-4 text-center">Mức Tồn Min</th>
                  <th className="py-3 px-4 text-center">Trạng Thái Tồn</th>
                  {onViewMovementsForMaterial && <th className="py-3 px-4 text-right">Tra Cứu</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{b.material_name}</div>
                      <div className="font-mono text-[11px] font-semibold text-cyan-700">{b.material_code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">[{b.warehouse_code}]</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">{b.warehouse_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-sm font-extrabold text-slate-900">{formatNumber(b.quantity)}</span>
                      <span className="text-xs text-slate-500 font-medium ml-1">{b.unit_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-medium text-slate-700">
                      {formatCurrency(b.average_price)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-extrabold text-slate-900 text-sm">
                      {formatCurrency(b.total_value)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-slate-700">{formatNumber(b.min_stock)}</span>{' '}
                      <span className="text-[10px] text-slate-400">{b.unit_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusPill(b.stock_status, b.min_stock)}
                    </td>
                    {onViewMovementsForMaterial && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onViewMovementsForMaterial(b.material_id)}
                          className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg transition"
                        >
                          Sổ thẻ kho
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={4} className="py-3.5 px-4 text-right text-slate-700 uppercase text-[11px]">
                    Tổng Giá Trị Tồn Kho Toàn Bộ Dòng Đang Lọc:
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-950 font-bold text-base">
                    {formatCurrency(totalValue)}
                  </td>
                  <td colSpan={onViewMovementsForMaterial ? 3 : 2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Quy chuẩn kiểm soát số dư:</span> Số dư tồn kho trên hệ thống được bảo vệ nguyên tử, không thể sửa trực tiếp. Mọi biến động đều được cập nhật tự động khi phiếu Nhập kho/Xuất kho được phê duyệt và ghi nhận hoặc khi quyết định Điều chỉnh kiểm kê được Quản trị viên phê chuẩn.
        </div>
      </div>
    </div>
  );
};
