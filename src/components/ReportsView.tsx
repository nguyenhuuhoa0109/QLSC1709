import React, { useState } from 'react';
import {
  StockBalance,
  ReceiptDocument,
  IssueDocument,
  StockMovement,
  Warehouse,
  MaterialGroup,
  MaterialSystem,
  Material
} from '../types';
import { formatCurrency, formatNumber } from '../api';
import {
  BarChart3,
  Boxes,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Filter,
  DollarSign,
  TrendingDown,
  Layers,
  PieChart,
  Users
} from 'lucide-react';

interface ReportsViewProps {
  balances: StockBalance[];
  receipts: ReceiptDocument[];
  issues: IssueDocument[];
  movements: StockMovement[];
  warehouses: Warehouse[];
  materials: Material[];
  groups: MaterialGroup[];
  systems: MaterialSystem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  balances,
  receipts,
  issues,
  movements,
  warehouses,
  materials,
  groups,
  systems
}) => {
  const [reportType, setReportType] = useState<
    'stock_valuation' | 'in_out_balance' | 'low_stock' | 'pending_docs' | 'department_usage'
  >('stock_valuation');

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Filter balances based on selections
  const filteredBalances = balances.filter(b => {
    const matchWh = selectedWarehouse === 'all' || b.warehouse_id === selectedWarehouse;
    const mat = materials.find(m => m.id === b.material_id);
    const matchGroup = selectedGroup === 'all' || mat?.group_id === selectedGroup;
    return matchWh && matchGroup;
  });

  // Calculate KPIs
  const totalStockValue = filteredBalances.reduce((sum, b) => sum + b.total_value, 0);
  const lowStockBalances = filteredBalances.filter(b => b.stock_status === 'low' || b.stock_status === 'out');
  const pendingReceipts = receipts.filter(r => r.status === 'pending_approval');
  const pendingIssues = issues.filter(i => i.status === 'pending_approval');
  const waitingStockIssues = issues.filter(i => i.status === 'approved_insufficient_stock');

  // Department usage breakdown from posted issues
  const departmentUsageMap: Record<string, { count: number; totalValue: number }> = {};
  issues
    .filter(i => i.status === 'posted')
    .forEach(i => {
      const dept = i.department || 'Bộ phận khác';
      if (!departmentUsageMap[dept]) {
        departmentUsageMap[dept] = { count: 0, totalValue: 0 };
      }
      departmentUsageMap[dept].count += 1;
      departmentUsageMap[dept].totalValue += i.total_amount;
    });

  // Material In-Out-Balance aggregated data
  const inOutBalances = filteredBalances.map(b => {
    const matMovements = movements.filter(
      m => m.material_id === b.material_id && (selectedWarehouse === 'all' || m.warehouse_id === selectedWarehouse)
    );

    const totalInQty = matMovements
      .filter(m => m.movement_type === 'receipt' || m.movement_type === 'adjustment_increase')
      .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

    const totalOutQty = matMovements
      .filter(m => m.movement_type === 'issue' || m.movement_type === 'adjustment_decrease')
      .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

    return {
      ...b,
      totalInQty,
      totalOutQty
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Báo Cáo & Thống Kê Kho</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              Sơn Trà 1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp giá trị tài sản kho, báo cáo nhập xuất tồn, cảnh báo định mức và phân bổ chi phí vật tư.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> In Báo Cáo
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'stock_valuation', label: '1. Báo cáo Tồn Kho & Giá Trị' },
          { id: 'in_out_balance', label: '2. Báo cáo Nhập Xuất Tồn' },
          { id: 'low_stock', label: `3. Cảnh Báo Tồn Dưới Định Mức (${lowStockBalances.length})` },
          { id: 'pending_docs', label: `4. Phiếu Chờ Xử Lý & Thiếu Tồn (${pendingReceipts.length + pendingIssues.length + waitingStockIssues.length})` },
          { id: 'department_usage', label: '5. Phân Bổ Xuất Dùng Theo Tổ Đội' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              reportType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">KHO BÁO CÁO:</label>
          <select
            value={selectedWarehouse}
            onChange={e => setSelectedWarehouse(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white font-medium"
          >
            <option value="all">Toàn bộ kho (Sơn Trà 1)</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                [{w.code}] {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">NHÓM VẬT TƯ:</label>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white font-medium"
          >
            <option value="all">Tất cả nhóm vật tư</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REPORT 1: Stock Valuation */}
      {reportType === 'stock_valuation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Báo Cáo Tồn Kho & Tổng Giá Trị Tài Sản</h3>
            <span className="text-xs font-bold text-cyan-800">
              Tổng giá trị: {formatCurrency(totalStockValue)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mã Vật Tư</th>
                  <th className="py-3 px-4">Tên Vật Tư</th>
                  <th className="py-3 px-4">Kho</th>
                  <th className="py-3 px-4 text-right">Số Lượng Tồn</th>
                  <th className="py-3 px-4 text-right">Đơn Giá Bình Quân</th>
                  <th className="py-3 px-4 text-right">Tổng Giá Trị (VNĐ)</th>
                  <th className="py-3 px-4 text-center">Định Mức Min</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBalances.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-700">{b.material_code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.material_name}</td>
                    <td className="py-3 px-4 text-slate-600">{b.warehouse_name}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatNumber(b.quantity)} {b.unit_name}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      {formatCurrency(b.average_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatCurrency(b.total_value)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {formatNumber(b.min_stock)} {b.unit_name}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-right text-slate-700 uppercase text-[11px]">
                    TỔNG CỘNG GIÁ TRỊ TỒN KHO:
                  </td>
                  <td className="py-3 px-4 text-right text-base text-slate-950">
                    {formatCurrency(totalStockValue)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: In-Out-Balance */}
      {reportType === 'in_out_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Báo Cáo Tổng Hợp Nhập - Xuất - Tồn</h3>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi luân chuyển vật tư và phát sinh trong kỳ hoạt động.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mã & Tên Vật Tư</th>
                  <th className="py-3 px-4">Kho</th>
                  <th className="py-3 px-4 text-right">Tổng Nhập Trong Kỳ</th>
                  <th className="py-3 px-4 text-right">Tổng Xuất Trong Kỳ</th>
                  <th className="py-3 px-4 text-right">Tồn Hiện Tại</th>
                  <th className="py-3 px-4 text-right">Đơn Giá Bình Quân</th>
                  <th className="py-3 px-4 text-right">Giá Trị Tồn Cuối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inOutBalances.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{b.material_name}</div>
                      <div className="font-mono text-[10px] text-cyan-700">{b.material_code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">[{b.warehouse_code}] {b.warehouse_name}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      +{formatNumber(b.totalInQty)} {b.unit_name}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      -{formatNumber(b.totalOutQty)} {b.unit_name}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatNumber(b.quantity)} {b.unit_name}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {formatCurrency(b.average_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatCurrency(b.total_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: Low Stock Warning */}
      {reportType === 'low_stock' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Danh Sách Vật Tư Dưới Định Mức Tồn Tối Thiểu (Cảnh Báo Vận Hành)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các vật tư có số lượng tồn nhỏ hơn hoặc bằng định mức an toàn, cần ưu tiên lập kế hoạch mua sắm bổ sung.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              {lowStockBalances.length} mặt hàng cảnh báo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mã & Tên Vật Tư</th>
                  <th className="py-3 px-4">Kho Lưu Trữ</th>
                  <th className="py-3 px-4 text-right">Tồn Hiện Tại</th>
                  <th className="py-3 px-4 text-right">Mức Min Quy Định</th>
                  <th className="py-3 px-4 text-right">Số Lượng Cần Bổ Sung</th>
                  <th className="py-3 px-4 text-center">Mức Độ Cảnh Báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockBalances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tất cả vật tư đều đạt hoặc vượt định mức tồn kho an toàn!
                    </td>
                  </tr>
                ) : (
                  lowStockBalances.map(b => {
                    const deficit = Math.max(0, b.min_stock - b.quantity);
                    const isOut = b.quantity === 0;

                    return (
                      <tr key={b.id} className="hover:bg-amber-50/40">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{b.material_name}</div>
                          <div className="font-mono text-[10px] text-cyan-700">{b.material_code}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{b.warehouse_name}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-rose-600 text-sm">
                          {formatNumber(b.quantity)} {b.unit_name}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {formatNumber(b.min_stock)} {b.unit_name}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-amber-700">
                          +{formatNumber(deficit)} {b.unit_name}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isOut ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              Hết Hàng Hoàn Toàn (Khẩn cấp)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Dưới Định Mức An Toàn
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: Pending Documents */}
      {reportType === 'pending_docs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Báo Cáo Tiến Độ Xử Lý & Phiếu Tắc Nghẽn
            </h3>
            <p className="text-xs text-slate-500">
              Tổng hợp các phiếu đề nghị nhập/xuất kho đang chờ duyệt hoặc bị chặn do chưa đủ tồn kho.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-xs font-semibold text-amber-800">Phiếu Nhập Chờ Duyệt</span>
                <div className="text-2xl font-black text-amber-900 mt-1">{pendingReceipts.length}</div>
              </div>

              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                <span className="text-xs font-semibold text-cyan-800">Phiếu Xuất Chờ Duyệt</span>
                <div className="text-2xl font-black text-cyan-900 mt-1">{pendingIssues.length}</div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-xs font-semibold text-rose-800">Phiếu Xuất Bị Chặn Do Thiếu Tồn</span>
                <div className="text-2xl font-black text-rose-900 mt-1">{waitingStockIssues.length}</div>
              </div>
            </div>
          </div>

          {/* Table of blocked issues */}
          {waitingStockIssues.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <h4 className="font-bold text-xs text-rose-900 uppercase">
                  Chi Tiết Phiếu Xuất Đã Duyệt Nhưng Đang Chờ Tồn Kho:
                </h4>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {waitingStockIssues.map(i => (
                  <div key={i.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 font-mono text-sm">{i.code}</div>
                      <div className="text-slate-500 text-[11px]">
                        Kho: {i.warehouse_name} • Người nhận: {i.recipient_name} ({i.department})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-full text-[11px]">
                        Bị chặn: Tồn không đủ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORT 5: Department Usage */}
      {reportType === 'department_usage' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" />
              Báo Cáo Phân Bổ Giá Trị Xuất Dùng Theo Tổ / Đội Nghiệp Vụ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thống kê tổng giá trị vật tư thực tế đã xuất kho phục vụ vận hành, sửa chữa tổ máy.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tổ / Đội / Bộ Phận</th>
                  <th className="py-3 px-4 text-center">Số Lượt Xuất Kho</th>
                  <th className="py-3 px-4 text-right">Tổng Giá Trị Vật Tư (VNĐ)</th>
                  <th className="py-3 px-4">Đánh Giá Tỷ Trọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(departmentUsageMap).map(([dept, data]) => (
                  <tr key={dept} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{dept}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">{data.count} phiếu</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-950 text-sm">
                      {formatCurrency(data.totalValue)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      Phục vụ bảo dưỡng, vận hành kỹ thuật nhà máy
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
