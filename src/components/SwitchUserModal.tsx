import React from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, User, X, Check, Key } from 'lucide-react';

interface SwitchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (userId: string) => void;
}

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser
}) => {
  if (!isOpen) return null;

  const getRoleDesc = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Quản trị viên (Admin)',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          permissions: 'Toàn quyền: Quản lý vật tư, duyệt phiếu, ghi nhận nhập/xuất, kiểm kê, xem báo cáo, xem audit log.'
        };
      case 'storekeeper':
        return {
          title: 'Thủ kho chính',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          permissions: 'Quyền thủ kho: Lập phiếu, kiểm tra tồn, phê duyệt (nếu được ủy quyền), ghi nhận nhập/xuất kho, thực hiện kiểm kê.'
        };
      case 'internal_user':
        return {
          title: 'Người dùng nội bộ / Kỹ thuật viên',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          permissions: 'Chỉ xem danh mục & tồn được phép, lập phiếu đề nghị nhập/xuất, theo dõi phiếu của mình. KHÔNG ĐƯỢC duyệt hoặc ghi nhận xuất nhập kho.'
        };
      case 'auditor':
        return {
          title: 'Người kiểm kê',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          permissions: 'Thực hiện kiểm kê, nhập số lượng thực tế, ghi nhận chênh lệch, lập đề nghị điều chỉnh tồn. Không tự ý chỉnh nếu chưa duyệt.'
        };
      default:
        return {
          title: 'Người dùng',
          badge: 'bg-slate-100 text-slate-800',
          permissions: ''
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-base">Chuyển đổi Tài khoản & Vai trò</h3>
              <p className="text-xs text-slate-400">Kiểm thử phân quyền RBAC Nhà máy Thủy điện Sơn Trà 1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 transition">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {users.map(u => {
            const roleInfo = getRoleDesc(u.role);
            const isCurrent = u.id === currentUser.id;

            return (
              <div
                key={u.id}
                onClick={() => {
                  onSelectUser(u.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                  isCurrent
                    ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                      {u.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{u.full_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${roleInfo.badge}`}>
                          {roleInfo.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{u.position} • {u.department}</div>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-cyan-700 bg-cyan-100 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" /> Đang hoạt động
                    </span>
                  ) : (
                    <button className="text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1 rounded-lg transition">
                      Chuyển sang vai này
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  <span className="font-semibold text-slate-700">Phạm vi quyền hạn:</span> {roleInfo.permissions}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
