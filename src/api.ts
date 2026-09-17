import {
  UserProfile,
  Warehouse,
  MaterialSystem,
  MaterialGroup,
  Unit,
  Material,
  StockBalance,
  ReceiptDocument,
  IssueDocument,
  InventoryCount,
  StockMovement,
  AuditLog,
  BusinessError
} from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  const data = await res.json();
  if (!res.ok) {
    const error: BusinessError = {
      code: data.code || 'UNKNOWN_ERROR',
      message: data.message || 'Đã có lỗi xảy ra',
      details: data.details
    };
    throw error;
  }
  return data as T;
}

export const api = {
  // Auth & Session
  getMe: () => request<UserProfile>('/api/auth/me'),
  getUsers: () => request<UserProfile[]>('/api/auth/users'),
  switchUser: (userId: string) => request<{ success: boolean; user: UserProfile }>('/api/auth/switch-user', {
    method: 'POST',
    body: JSON.stringify({ userId })
  }),

  // Meta
  getWarehouses: () => request<Warehouse[]>('/api/warehouses'),
  getSystems: () => request<MaterialSystem[]>('/api/material-systems'),
  getGroups: () => request<MaterialGroup[]>('/api/material-groups'),
  getUnits: () => request<Unit[]>('/api/units'),

  // Materials
  getMaterials: (params?: { search?: string; group_id?: string; system_id?: string; is_active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.group_id) query.set('group_id', params.group_id);
    if (params?.system_id) query.set('system_id', params.system_id);
    if (params?.is_active !== undefined) query.set('is_active', String(params.is_active));
    return request<Material[]>(`/api/materials?${query.toString()}`);
  },
  createMaterial: (payload: Partial<Material>) => request<Material>('/api/materials', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateMaterial: (id: string, payload: Partial<Material>) => request<Material>(`/api/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  toggleMaterialStatus: (id: string) => request<Material>(`/api/materials/${id}/toggle-status`, {
    method: 'POST'
  }),

  // Stock Balances
  getStockBalances: (params?: { warehouse_id?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set('warehouse_id', params.warehouse_id);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return request<StockBalance[]>(`/api/stock-balances?${query.toString()}`);
  },

  // Receipts
  getReceipts: (params?: { warehouse_id?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set('warehouse_id', params.warehouse_id);
    if (params?.status) query.set('status', params.status);
    return request<ReceiptDocument[]>(`/api/receipts?${query.toString()}`);
  },
  createReceipt: (payload: any) => request<ReceiptDocument>('/api/receipts', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  submitReceipt: (id: string) => request<ReceiptDocument>(`/api/receipts/${id}/submit`, {
    method: 'POST'
  }),
  approveReceipt: (id: string) => request<ReceiptDocument>(`/api/receipts/${id}/approve`, {
    method: 'POST'
  }),
  rejectReceipt: (id: string, reason: string) => request<ReceiptDocument>(`/api/receipts/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  postReceipt: (id: string) => request<ReceiptDocument>(`/api/receipts/${id}/post`, {
    method: 'POST'
  }),

  // Issues
  getIssues: (params?: { warehouse_id?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set('warehouse_id', params.warehouse_id);
    if (params?.status) query.set('status', params.status);
    return request<IssueDocument[]>(`/api/issues?${query.toString()}`);
  },
  createIssue: (payload: any) => request<IssueDocument>('/api/issues', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  submitIssue: (id: string) => request<IssueDocument>(`/api/issues/${id}/submit`, {
    method: 'POST'
  }),
  approveIssue: (id: string) => request<IssueDocument>(`/api/issues/${id}/approve`, {
    method: 'POST'
  }),
  rejectIssue: (id: string, reason: string) => request<IssueDocument>(`/api/issues/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  postIssue: (id: string) => request<IssueDocument>(`/api/issues/${id}/post`, {
    method: 'POST'
  }),

  // Inventory Counts
  getInventoryCounts: (params?: { warehouse_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set('warehouse_id', params.warehouse_id);
    return request<InventoryCount[]>(`/api/inventory-counts?${query.toString()}`);
  },
  createInventoryCount: (payload: any) => request<InventoryCount>('/api/inventory-counts', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  submitInventoryCount: (id: string) => request<InventoryCount>(`/api/inventory-counts/${id}/submit`, {
    method: 'POST'
  }),
  approveInventoryCount: (id: string) => request<InventoryCount>(`/api/inventory-counts/${id}/approve`, {
    method: 'POST'
  }),
  postInventoryAdjustment: (id: string, payload: { adjustment_reason: string; adjustment_document_ref: string }) =>
    request<InventoryCount>(`/api/inventory-counts/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Movements
  getStockMovements: (params?: { warehouse_id?: string; movement_type?: string; material_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set('warehouse_id', params.warehouse_id);
    if (params?.movement_type) query.set('movement_type', params.movement_type);
    if (params?.material_id) query.set('material_id', params.material_id);
    return request<StockMovement[]>(`/api/stock-movements?${query.toString()}`);
  },

  // Reports & Logs
  getReportSummary: (warehouse_id?: string) => {
    const query = new URLSearchParams();
    if (warehouse_id) query.set('warehouse_id', warehouse_id);
    return request<{
      totalStockValue: number;
      totalMaterialsCount: number;
      lowStockCount: number;
      pendingApprovalsCount: number;
      waitingStockIssuesCount: number;
      warehouseCount: number;
    }>(`/api/reports/summary?${query.toString()}`);
  },
  getAuditLogs: () => request<AuditLog[]>('/api/audit-logs')
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('vi-VN').format(val);
};
