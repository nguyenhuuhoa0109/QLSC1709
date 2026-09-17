import React from 'react';
import { UserProfile, Warehouse } from '../types';
import { ShieldCheck, UserCheck, Database, FileText, Building2, Menu, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  warehouses: Warehouse[];
  selectedWarehouse: string;
  onSelectWarehouse: (id: string) => void;
  onOpenSwitchUser: () => void;
  onOpenAuditLogs: () => void;
  onOpenSqlModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  warehouses,
  selectedWarehouse,
  onSelectWarehouse,
  onOpenSwitchUser,
  onOpenAuditLogs,
  onOpenSqlModal,
  onToggleMobileMenu
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin Hệ Thống', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'storekeeper':
        return { label: 'Thủ Kho Chính', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'auditor':
        return { label: 'Người Kiểm Kê', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { label: 'Người Dùng Nội Bộ', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Mở menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-inner font-bold text-white tracking-wider text-sm">
                ST1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white">THỦY ĐIỆN SƠN TRÀ 1</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    60 MW
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Hệ thống Quản lý Kho Vật tư Nội bộ</p>
              </div>
            </div>
          </div>

          {/* Center / Right: Warehouse Filter & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Warehouse Filter */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Kho:</span>
              <select
                id="header-warehouse-select"
                value={selectedWarehouse}
                onChange={e => onSelectWarehouse(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-slate-900 text-white">Tất cả các kho (Toàn nhà máy)</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supabase SQL DDL button */}
            <button
              onClick={onOpenSqlModal}
              title="Xem SQL Schema Supabase / PostgreSQL DDL & RPCs"
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-medium">Supabase DDL</span>
            </button>

            {/* Audit Log for Admin */}
            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenAuditLogs}
                title="Nhật ký kiểm toán hệ thống"
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline font-medium">Audit Log</span>
              </button>
            )}

            {/* User Profile Pill & Role Switcher */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={onOpenSwitchUser}
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 px-2.5 py-1.5 rounded-lg transition text-left group"
                title="Bấm để đổi vai trò (Admin / Thủ kho / Kỹ thuật viên / Kiểm kê)"
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{currentUser.full_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-normal ${roleInfo.bg}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{currentUser.department}</div>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
