export type RoleType = 'admin' | 'storekeeper' | 'internal_user' | 'auditor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  department: string;
  position: string;
  role: RoleType;
  phone?: string;
  avatar_url?: string;
  assigned_warehouses: string[]; // Warehouse IDs user has access to
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  manager_id?: string;
  manager_name?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseMember {
  id: string;
  warehouse_id: string;
  user_id: string;
  can_issue: boolean;
  can_receive: boolean;
  can_audit: boolean;
}

export interface MaterialSystem {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface MaterialGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  group_id: string;
  group_name?: string;
  system_id: string;
  system_name?: string;
  unit_id: string;
  unit_name?: string;
  specification?: string;
  description?: string;
  manufacturer?: string;
  origin?: string;
  is_active: boolean;
  notes?: string;
  min_stock_defaults: Record<string, number>; // warehouse_id -> min_stock
  created_at: string;
  updated_at: string;
}

export type ReceiptStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REJECTED';

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  material_id: string;
  material_code: string;
  material_name: string;
  unit_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string;
}

export interface ReceiptDocument {
  id: string;
  document_number: string;
  created_date: string;
  actual_date?: string;
  warehouse_id: string;
  warehouse_name?: string;
  source_type: string; // 'Mua sắm', 'Điều chuyển nội bộ', 'Tồn đầu kỳ', 'Nhà cung cấp bàn giao'
  supplier_name?: string;
  invoice_number?: string;
  creator_id: string;
  creator_name: string;
  approver_id?: string;
  approver_name?: string;
  posted_by_id?: string;
  posted_by_name?: string;
  status: ReceiptStatus;
  notes?: string;
  rejection_reason?: string;
  items: ReceiptItem[];
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export type IssueStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'APPROVED_WAITING_STOCK' | 'POSTED' | 'REJECTED';

export interface IssueItem {
  id: string;
  issue_id: string;
  material_id: string;
  material_code: string;
  material_name: string;
  unit_name: string;
  quantity: number;
  average_unit_price: number;
  total_amount: number;
  current_stock: number;
  shortage_quantity: number; // Max(0, quantity - current_stock)
  notes?: string;
}

export interface IssueDocument {
  id: string;
  document_number: string;
  created_date: string;
  actual_date?: string;
  warehouse_id: string;
  warehouse_name?: string;
  receiver_name: string;
  receiver_department: string;
  purpose: string;
  work_order_ref?: string; // Mã yêu cầu / công việc tham chiếu
  creator_id: string;
  creator_name: string;
  approver_id?: string;
  approver_name?: string;
  posted_by_id?: string;
  posted_by_name?: string;
  status: IssueStatus;
  notes?: string;
  rejection_reason?: string;
  items: IssueItem[];
  total_amount: number;
  has_stock_shortage: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockBalance {
  id: string;
  warehouse_id: string;
  warehouse_name?: string;
  warehouse_code?: string;
  material_id: string;
  material_code?: string;
  material_name?: string;
  group_name?: string;
  system_name?: string;
  unit_name?: string;
  quantity: number;
  average_unit_price: number;
  total_value: number;
  min_stock: number;
  stock_status: 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';
  updated_at: string;
}

export type MovementType = 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT_INCREASE' | 'ADJUSTMENT_DECREASE';

export interface StockMovement {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  warehouse_id: string;
  warehouse_name: string;
  material_id: string;
  material_code: string;
  material_name: string;
  unit_name: string;
  movement_type: MovementType;
  delta_quantity: number; // positive for in, negative for out
  quantity_before: number;
  quantity_after: number;
  unit_price: number;
  total_amount: number;
  source_document_type: 'RECEIPT' | 'ISSUE' | 'INVENTORY_COUNT';
  source_document_id: string;
  source_document_number: string;
  notes?: string;
}

export type InventoryCountStatus = 'DRAFT' | 'COUNTING' | 'SUBMITTED' | 'APPROVED' | 'ADJUSTED' | 'CANCELLED';

export interface InventoryCountItem {
  id: string;
  inventory_count_id: string;
  material_id: string;
  material_code: string;
  material_name: string;
  unit_name: string;
  book_quantity: number;
  actual_quantity: number;
  difference_quantity: number; // actual_quantity - book_quantity
  material_condition: string; // 'Tốt 100%', 'Bình thường', 'Hao mòn nhẹ', 'Cần bảo dưỡng'
  notes?: string;
}

export interface InventoryCount {
  id: string;
  code: string;
  warehouse_id: string;
  warehouse_name: string;
  count_date: string;
  manager_id: string;
  manager_name: string;
  auditor_id: string;
  auditor_name: string;
  scope: string; // 'Toàn bộ kho', 'Nhóm cơ khí', 'Nhóm dầu mỡ', etc.
  status: InventoryCountStatus;
  notes?: string;
  items: InventoryCountItem[];
  adjustment_reason?: string;
  adjustment_document_ref?: string;
  adjusted_by_id?: string;
  adjusted_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  table_name: string;
  record_id: string;
  before_data?: Record<string, unknown>;
  after_data?: Record<string, unknown>;
  trace_info?: string;
}

export type BusinessErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'WAREHOUSE_ACCESS_DENIED'
  | 'INVALID_STATUS'
  | 'INVALID_QUANTITY'
  | 'MATERIAL_INACTIVE'
  | 'INSUFFICIENT_STOCK'
  | 'DOCUMENT_ALREADY_POSTED'
  | 'DUPLICATE_MATERIAL'
  | 'APPROVAL_REQUIRED'
  | 'SELF_APPROVAL_NOT_ALLOWED'
  | 'INVALID_WAREHOUSE'
  | 'INVALID_MATERIAL';

export interface BusinessError {
  code: BusinessErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
