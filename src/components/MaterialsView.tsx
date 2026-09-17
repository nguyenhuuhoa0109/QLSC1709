import React, { useState } from 'react';
import {
  Material,
  MaterialGroup,
  MaterialSystem,
  Unit,
  Warehouse,
  UserProfile
} from '../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Power,
  Layers,
  Cpu,
  Info
} from 'lucide-react';

interface MaterialsViewProps {
  materials: Material[];
  groups: MaterialGroup[];
  systems: MaterialSystem[];
  units: Unit[];
  warehouses: Warehouse[];
  currentUser: UserProfile;
  onCreateMaterial: (payload: Partial<Material>) => Promise<void>;
  onUpdateMaterial: (id: string, payload: Partial<Material>) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  groups,
  systems,
  units,
  warehouses,
  currentUser,
  onCreateMaterial,
  onUpdateMaterial,
  onToggleStatus
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    group_id: '',
    system_id: '',
    unit_id: '',
    specification: '',
    description: '',
    manufacturer: '',
    origin: '',
    min_stock_defaults: {} as Record<string, number>
  });

  const canEdit = currentUser.role === 'admin';

  // Filtered materials
  const filteredMaterials = materials.filter(m => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      (m.specification || '').toLowerCase().includes(search.toLowerCase());
    const matchGroup = selectedGroup === 'all' || m.group_id === selectedGroup;
    const matchSystem = selectedSystem === 'all' || m.system_id === selectedSystem;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && m.is_active) ||
      (statusFilter === 'inactive' && !m.is_active);

    return matchSearch && matchGroup && matchSystem && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    const initialMinStock: Record<string, number> = {};
    warehouses.forEach(w => {
      initialMinStock[w.id] = 0;
    });
    setFormData({
      code: '',
      name: '',
      group_id: groups[0]?.id || '',
      system_id: systems[0]?.id || '',
      unit_id: units[0]?.id || '',
      specification: '',
      description: '',
      manufacturer: '',
      origin: '',
      min_stock_defaults: initialMinStock
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      code: m.code,
      name: m.name,
      group_id: m.group_id,
      system_id: m.system_id,
      unit_id: m.unit_id,
      specification: m.specification || '',
      description: m.description || '',
      manufacturer: m.manufacturer || '',
      origin: m.origin || '',
      min_stock_defaults: { ...m.min_stock_defaults }
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      await onUpdateMaterial(editingMaterial.id, formData);
    } else {
      await onCreateMaterial(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Danh Mục Vật Tư Nhà Máy</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredMaterials.length} vật tư
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý mã, quy cách kỹ thuật, hệ thống sử dụng và định mức tồn tối thiểu theo từng kho.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Thêm Vật Tư Mới
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, quy cách..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
            >
              <option value="all">Tất cả nhóm vật tư</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* System Filter */}
          <div>
            <select
              value={selectedSystem}
              onChange={e => setSelectedSystem(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
            >
              <option value="all">Tất cả hệ thống thiết bị</option>
              {systems.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang sử dụng</option>
              <option value="inactive">Ngừng sử dụng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy vật tư phù hợp</p>
            <p className="text-xs text-slate-500">Hãy thử thay đổi điều kiện tìm kiếm hoặc bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã & Tên Vật Tư</th>
                  <th className="py-3 px-4">Nhóm & Hệ Thống</th>
                  <th className="py-3 px-4">ĐVT</th>
                  <th className="py-3 px-4">Quy Cách & Xuất Xứ</th>
                  <th className="py-3 px-4">Mức Tồn Tối Thiểu</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  {canEdit && <th className="py-3 px-4 text-right">Thao Tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                      <div className="font-mono text-[11px] font-semibold text-cyan-700">{m.code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{m.group_name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Cpu className="w-3 h-3 text-slate-400" /> {m.system_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-900">
                      {m.unit_name}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-700 font-medium truncate" title={m.specification}>
                        {m.specification || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.manufacturer ? `${m.manufacturer} (${m.origin})` : '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        {warehouses.map(w => {
                          const minVal = m.min_stock_defaults?.[w.id] || 0;
                          return (
                            <div key={w.id} className="text-[11px] flex items-center gap-1 text-slate-600">
                              <span className="font-mono font-semibold text-slate-800">{w.code}:</span>
                              <span>{minVal} {m.unit_name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {m.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang dùng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5" /> Ngừng dùng
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                            title="Chỉnh sửa vật tư"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleStatus(m.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              m.is_active
                                ? 'border-amber-200 hover:bg-amber-50 text-amber-700'
                                : 'border-emerald-200 hover:bg-emerald-50 text-emerald-700'
                            }`}
                            title={m.is_active ? 'Chuyển sang Ngừng sử dụng' : 'Kích hoạt lại'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">
                  {editingMaterial ? 'Chỉnh Sửa Thông Tin Vật Tư' : 'Thêm Vật Tư Mới Vào Danh Mục'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã Vật Tư <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingMaterial}
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: DMN-TB46"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono font-semibold focus:outline-none focus:border-cyan-500 disabled:bg-slate-100"
                  />
                  {editingMaterial && (
                    <span className="text-[10px] text-slate-400">Mã vật tư là định danh không được thay đổi.</span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên Vật Tư <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Dầu tua bin Shell Turbo T 46"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nhóm Vật Tư <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.group_id}
                    onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hệ Thống Thiết Bị <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.system_id}
                    onChange={e => setFormData({ ...formData, system_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    {systems.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Đơn Vị Tính <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.unit_id}
                    onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quy Cách Kỹ Thuật</label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={e => setFormData({ ...formData, specification: e.target.value })}
                  placeholder="VD: ISO VG 46, ASTM D4304, độ nhớt 46 cSt tại 40°C"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhà Sản Xuất</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="VD: Shell, Hydac, Eaton..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Xuất Xứ</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={e => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="VD: Singapore, Đức, Việt Nam..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô Tả Ứng Dụng</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ứng dụng tại gối trục tua-bin, trạm phân phối 110kV..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Mức tồn tối thiểu theo từng kho */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-600" />
                  Mức Tồn Tối Thiểu Theo Từng Kho:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {warehouses.map(w => (
                    <div key={w.id}>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1 truncate" title={w.name}>
                        [{w.code}] {w.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.min_stock_defaults[w.id] ?? 0}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            min_stock_defaults: {
                              ...formData.min_stock_defaults,
                              [w.id]: Number(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-cyan-500 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  {editingMaterial ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
