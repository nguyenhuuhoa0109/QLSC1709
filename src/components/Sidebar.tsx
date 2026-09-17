import React from 'react';
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardCheck,
  History,
  BarChart3,
  Building2,
  AlertTriangle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Warehouse } from '../types';

export type NavTab = 'materials' | 'receipts' | 'issues' | 'stock' | 'inventory' | 'movements' | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  lowStockCount: number;
  waitingStockCount: number;
  warehouses: Warehouse[];
  selectedWarehouse: string;
  onSelectWarehouse: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  lowStockCount,
  waitingStockCount,
  warehouses,
  selectedWarehouse,
  onSelectWarehouse,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'materials' as NavTab,
      label: '1. Danh mục vật tư',
      sub: 'Mã, tên, nhóm, quy cách, định mức',
      icon: Package
    },
    {
      id: 'receipts' as NavTab,
      label: '2. Nhập kho',
      sub: 'Lập phiếu, duyệt & ghi nhận',
      icon: ArrowDownToLine,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} chờ` : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'issues' as NavTab,
      label: '3. Xuất kho',
      sub: 'Xuất dùng, kiểm soát vượt tồn',
      icon: ArrowUpFromLine,
      badge: waitingStockCount > 0 ? `${waitingStockCount} thiếu tồn` : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'stock' as NavTab,
      label: '4. Tồn kho',
      sub: 'Số dư, đơn giá bình quân, giá trị',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} cảnh báo` : undefined,
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 'inventory' as NavTab,
      label: '5. Kiểm kê',
      sub: 'Đợt kiểm kê, chênh lệch & chỉnh tồn',
      icon: ClipboardCheck
    },
    {
      id: 'movements' as NavTab,
      label: '6. Lịch sử nhập xuất',
      sub: 'Sổ nhật ký biến động bất biến',
      icon: History
    },
    {
      id: 'reports' as NavTab,
      label: '7. Báo cáo kho',
      sub: 'Tổng hợp nhập xuất tồn, tồn thấp',
      icon: BarChart3
    }
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Mobile warehouse filter */}
      <div className="lg:hidden p-4 border-b border-slate-800 bg-slate-950/40">
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          CHỌN KHO LÀM VIỆC:
        </label>
        <select
          value={selectedWarehouse}
          onChange={e => onSelectWarehouse(e.target.value)}
          className="w-full text-xs bg-slate-800 text-white border border-slate-700 rounded-lg p-2 font-medium"
        >
          <option value="all">Toàn bộ kho (Sơn Trà 1)</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>
              [{w.code}] {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          7 Nhóm Chức Năng Kho
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30 font-semibold'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs tracking-tight">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-cyan-100' : 'text-slate-500'}`}>
                    {item.sub}
                  </div>
                </div>
              </div>

              {item.badge ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ml-1 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isActive ? 'opacity-90' : ''}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Plant Info Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/50 text-xs">
        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Nhà máy Sơn Trà 1</span>
            <span className="text-emerald-400 font-semibold">Vận hành</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            Quy chuẩn kiểm soát kho: Không tồn âm, giao dịch nguyên tử, phê duyệt chặt chẽ.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900 border-r border-slate-800 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
