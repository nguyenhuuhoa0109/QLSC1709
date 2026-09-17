import {
  UserProfile,
  Warehouse,
  MaterialSystem,
  MaterialGroup,
  Unit,
  Material,
  StockBalance,
  ReceiptDocument,
  ReceiptItem,
  IssueDocument,
  IssueItem,
  InventoryCount,
  InventoryCountItem,
  StockMovement,
  AuditLog,
  BusinessError
} from '../src/types';

import {
  INITIAL_USERS,
  INITIAL_WAREHOUSES,
  INITIAL_SYSTEMS,
  INITIAL_GROUPS,
  INITIAL_UNITS,
  INITIAL_MATERIALS,
  INITIAL_STOCK_BALANCES,
  INITIAL_RECEIPTS,
  INITIAL_ISSUES,
  INITIAL_INVENTORY_COUNTS,
  INITIAL_MOVEMENTS,
  INITIAL_AUDIT_LOGS
} from './data/initialData';

// Database State Store
class InMemoryDatabase {
  users: UserProfile[] = JSON.parse(JSON.stringify(INITIAL_USERS));
  warehouses: Warehouse[] = JSON.parse(JSON.stringify(INITIAL_WAREHOUSES));
  systems: MaterialSystem[] = JSON.parse(JSON.stringify(INITIAL_SYSTEMS));
  groups: MaterialGroup[] = JSON.parse(JSON.stringify(INITIAL_GROUPS));
  units: Unit[] = JSON.parse(JSON.stringify(INITIAL_UNITS));
  materials: Material[] = JSON.parse(JSON.stringify(INITIAL_MATERIALS));
  stockBalances: StockBalance[] = JSON.parse(JSON.stringify(INITIAL_STOCK_BALANCES));
  receipts: ReceiptDocument[] = JSON.parse(JSON.stringify(INITIAL_RECEIPTS));
  issues: IssueDocument[] = JSON.parse(JSON.stringify(INITIAL_ISSUES));
  inventoryCounts: InventoryCount[] = JSON.parse(JSON.stringify(INITIAL_INVENTORY_COUNTS));
  movements: StockMovement[] = JSON.parse(JSON.stringify(INITIAL_MOVEMENTS));
  auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

  // Current session user (defaults to Admin for full experience, switchable)
  currentUser: UserProfile = this.users[0];

  // Concurrency Mutex for transactional atomicity
  private transactionLock = false;

  private async acquireLock(): Promise<() => void> {
    while (this.transactionLock) {
      await new Promise(r => setTimeout(r, 20));
    }
    this.transactionLock = true;
    return () => {
      this.transactionLock = false;
    };
  }

  // Audit Logger
  logAudit(userId: string, action: string, tableName: string, recordId: string, beforeData?: any, afterData?: any) {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    const log: AuditLog = {
      id: `adt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      user_id: user.id,
      user_name: user.full_name,
      action,
      table_name: tableName,
      record_id: recordId,
      before_data: beforeData,
      after_data: afterData,
      trace_info: `Phân hệ Quản lý Kho - Nhà máy Thủy điện Sơn Trà 1`
    };
    this.auditLogs.unshift(log);
  }

  // Permission & Warehouse Access Verification
  checkWarehouseAccess(user: UserProfile, warehouseId: string): boolean {
    if (user.role === 'admin') return true;
    return user.assigned_warehouses.includes(warehouseId);
  }

  // -------------------------------------------------------------
  // RPC: MATERIAL MANAGEMENT
  // -------------------------------------------------------------
  createMaterial(userId: string, payload: Partial<Material>): Material {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin') {
      throw { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền tạo danh mục vật tư' };
    }

    if (!payload.code || !payload.code.trim()) {
      throw { code: 'INVALID_MATERIAL', message: 'Mã vật tư không được để trống' };
    }
    if (!payload.name || !payload.name.trim()) {
      throw { code: 'INVALID_MATERIAL', message: 'Tên vật tư không được để trống' };
    }
    if (!payload.unit_id) {
      throw { code: 'INVALID_MATERIAL', message: 'Đơn vị tính là bắt buộc' };
    }

    const exists = this.materials.some(m => m.code.trim().toUpperCase() === payload.code?.trim().toUpperCase());
    if (exists) {
      throw { code: 'DUPLICATE_MATERIAL', message: `Mã vật tư ${payload.code} đã tồn tại trong hệ thống` };
    }

    const group = this.groups.find(g => g.id === payload.group_id);
    const system = this.systems.find(s => s.id === payload.system_id);
    const unit = this.units.find(u => u.id === payload.unit_id);

    const newMaterial: Material = {
      id: `mat-${Date.now()}`,
      code: payload.code.trim().toUpperCase(),
      name: payload.name.trim(),
      group_id: payload.group_id || this.groups[0].id,
      group_name: group?.name,
      system_id: payload.system_id || this.systems[0].id,
      system_name: system?.name,
      unit_id: payload.unit_id,
      unit_name: unit?.name,
      specification: payload.specification || '',
      description: payload.description || '',
      manufacturer: payload.manufacturer || '',
      origin: payload.origin || '',
      is_active: true,
      min_stock_defaults: payload.min_stock_defaults || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.materials.push(newMaterial);

    // Initialize stock balance rows for all warehouses
    for (const wh of this.warehouses) {
      const minStock = newMaterial.min_stock_defaults[wh.id] || 0;
      this.stockBalances.push({
        id: `stk-${Date.now()}-${wh.id}`,
        warehouse_id: wh.id,
        warehouse_name: wh.name,
        warehouse_code: wh.code,
        material_id: newMaterial.id,
        material_code: newMaterial.code,
        material_name: newMaterial.name,
        group_name: newMaterial.group_name,
        system_name: newMaterial.system_name,
        unit_name: newMaterial.unit_name,
        quantity: 0,
        average_unit_price: 0,
        total_value: 0,
        min_stock: minStock,
        stock_status: minStock > 0 ? 'OUT_OF_STOCK' : 'NORMAL',
        updated_at: new Date().toISOString()
      });
    }

    this.logAudit(user.id, 'CREATE_MATERIAL', 'materials', newMaterial.id, undefined, newMaterial);
    return newMaterial;
  }

  updateMaterial(userId: string, materialId: string, payload: Partial<Material>): Material {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin') {
      throw { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền cập nhật danh mục vật tư' };
    }

    const material = this.materials.find(m => m.id === materialId);
    if (!material) {
      throw { code: 'INVALID_MATERIAL', message: 'Không tìm thấy vật tư' };
    }

    const beforeData = { ...material };
    if (payload.name) material.name = payload.name.trim();
    if (payload.group_id) {
      material.group_id = payload.group_id;
      material.group_name = this.groups.find(g => g.id === payload.group_id)?.name;
    }
    if (payload.system_id) {
      material.system_id = payload.system_id;
      material.system_name = this.systems.find(s => s.id === payload.system_id)?.name;
    }
    if (payload.unit_id) {
      material.unit_id = payload.unit_id;
      material.unit_name = this.units.find(u => u.id === payload.unit_id)?.name;
    }
    if (payload.specification !== undefined) material.specification = payload.specification;
    if (payload.description !== undefined) material.description = payload.description;
    if (payload.manufacturer !== undefined) material.manufacturer = payload.manufacturer;
    if (payload.origin !== undefined) material.origin = payload.origin;
    if (payload.min_stock_defaults) {
      material.min_stock_defaults = payload.min_stock_defaults;
      // Update min_stock in stockBalances
      for (const sb of this.stockBalances.filter(s => s.material_id === material.id)) {
        sb.min_stock = payload.min_stock_defaults[sb.warehouse_id] || 0;
        if (sb.quantity <= 0) sb.stock_status = sb.min_stock > 0 ? 'OUT_OF_STOCK' : 'NORMAL';
        else if (sb.quantity <= sb.min_stock) sb.stock_status = 'LOW';
        else sb.stock_status = 'NORMAL';
      }
    }
    material.updated_at = new Date().toISOString();

    this.logAudit(user.id, 'UPDATE_MATERIAL', 'materials', material.id, beforeData, material);
    return material;
  }

  deactivateMaterial(userId: string, materialId: string): Material {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin') {
      throw { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền đổi trạng thái vật tư' };
    }
    const material = this.materials.find(m => m.id === materialId);
    if (!material) {
      throw { code: 'INVALID_MATERIAL', message: 'Không tìm thấy vật tư' };
    }
    material.is_active = !material.is_active;
    material.updated_at = new Date().toISOString();

    this.logAudit(user.id, 'TOGGLE_STATUS_MATERIAL', 'materials', material.id, undefined, { is_active: material.is_active });
    return material;
  }

  // -------------------------------------------------------------
  // RPC: RECEIPT (NHẬP KHO)
  // -------------------------------------------------------------
  createReceipt(userId: string, payload: {
    warehouse_id: string;
    source_type: string;
    supplier_name?: string;
    invoice_number?: string;
    notes?: string;
    items: Array<{ material_id: string; quantity: number; unit_price: number; notes?: string }>;
  }): ReceiptDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (!this.checkWarehouseAccess(user, payload.warehouse_id)) {
      throw { code: 'WAREHOUSE_ACCESS_DENIED', message: 'Bạn không được phân quyền tại kho này' };
    }
    if (!payload.items || payload.items.length === 0) {
      throw { code: 'INVALID_QUANTITY', message: 'Phiếu nhập kho phải có ít nhất một dòng vật tư' };
    }

    const warehouse = this.warehouses.find(w => w.id === payload.warehouse_id);
    if (!warehouse) throw { code: 'INVALID_WAREHOUSE', message: 'Kho không tồn tại' };

    const docCount = this.receipts.length + 1;
    const docNumber = `PNK-${new Date().getFullYear()}-${String(docCount).padStart(3, '0')}`;

    let totalAmount = 0;
    const receiptId = `rcp-${Date.now()}`;
    const receiptItems: ReceiptItem[] = [];

    for (const item of payload.items) {
      if (item.quantity <= 0) {
        throw { code: 'INVALID_QUANTITY', message: 'Số lượng nhập phải lớn hơn 0' };
      }
      if (item.unit_price < 0) {
        throw { code: 'INVALID_QUANTITY', message: 'Đơn giá không được âm' };
      }

      const mat = this.materials.find(m => m.id === item.material_id);
      if (!mat) throw { code: 'INVALID_MATERIAL', message: `Vật tư ID ${item.material_id} không tồn tại` };
      if (!mat.is_active) {
        throw { code: 'MATERIAL_INACTIVE', message: `Vật tư ${mat.name} (${mat.code}) đã ngừng sử dụng, không thể tạo phiếu` };
      }

      const lineTotal = item.quantity * item.unit_price;
      totalAmount += lineTotal;

      receiptItems.push({
        id: `rcp-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        receipt_id: receiptId,
        material_id: mat.id,
        material_code: mat.code,
        material_name: mat.name,
        unit_name: mat.unit_name || 'Cái',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: lineTotal,
        notes: item.notes || ''
      });
    }

    const newReceipt: ReceiptDocument = {
      id: receiptId,
      document_number: docNumber,
      created_date: new Date().toISOString().split('T')[0],
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.name,
      source_type: payload.source_type || 'Mua sắm nội bộ',
      supplier_name: payload.supplier_name || '',
      invoice_number: payload.invoice_number || '',
      creator_id: user.id,
      creator_name: user.full_name,
      status: 'DRAFT',
      notes: payload.notes || '',
      items: receiptItems,
      total_amount: totalAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.receipts.unshift(newReceipt);
    this.logAudit(user.id, 'CREATE_RECEIPT', 'receipt_documents', newReceipt.id, undefined, { document_number: docNumber, totalAmount });
    return newReceipt;
  }

  submitReceipt(userId: string, receiptId: string): ReceiptDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    const receipt = this.receipts.find(r => r.id === receiptId);
    if (!receipt) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu nhập' };
    if (receipt.status !== 'DRAFT') {
      throw { code: 'INVALID_STATUS', message: 'Chỉ phiếu ở trạng thái Nháp mới có thể gửi phê duyệt' };
    }

    receipt.status = 'PENDING_APPROVAL';
    receipt.updated_at = new Date().toISOString();
    this.logAudit(user.id, 'SUBMIT_RECEIPT', 'receipt_documents', receipt.id);
    return receipt;
  }

  approveReceipt(userId: string, receiptId: string): ReceiptDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin' && user.role !== 'storekeeper') {
      throw { code: 'FORBIDDEN', message: 'Bạn không có quyền phê duyệt phiếu nhập' };
    }
    const receipt = this.receipts.find(r => r.id === receiptId);
    if (!receipt) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu nhập' };

    if (receipt.status !== 'PENDING_APPROVAL') {
      throw { code: 'INVALID_STATUS', message: 'Phiếu không ở trạng thái chờ phê duyệt' };
    }

    // Quy tắc: Người lập phiếu không được tự phê duyệt
    if (receipt.creator_id === user.id) {
      throw { code: 'SELF_APPROVAL_NOT_ALLOWED', message: 'Người lập phiếu không được phép tự phê duyệt phiếu của chính mình' };
    }

    receipt.status = 'APPROVED';
    receipt.approver_id = user.id;
    receipt.approver_name = user.full_name;
    receipt.updated_at = new Date().toISOString();
    this.logAudit(user.id, 'APPROVE_RECEIPT', 'receipt_documents', receipt.id);
    return receipt;
  }

  rejectReceipt(userId: string, receiptId: string, reason: string): ReceiptDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin' && user.role !== 'storekeeper') {
      throw { code: 'FORBIDDEN', message: 'Bạn không có quyền từ chối phiếu' };
    }
    const receipt = this.receipts.find(r => r.id === receiptId);
    if (!receipt) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu nhập' };
    if (receipt.status !== 'PENDING_APPROVAL') {
      throw { code: 'INVALID_STATUS', message: 'Chỉ phiếu chờ phê duyệt mới có thể từ chối' };
    }

    receipt.status = 'REJECTED';
    receipt.approver_id = user.id;
    receipt.approver_name = user.full_name;
    receipt.rejection_reason = reason || 'Không đạt yêu cầu kỹ thuật/hồ sơ';
    receipt.updated_at = new Date().toISOString();
    this.logAudit(user.id, 'REJECT_RECEIPT', 'receipt_documents', receipt.id, undefined, { reason });
    return receipt;
  }

  async postReceipt(userId: string, receiptId: string): Promise<ReceiptDocument> {
    const unlock = await this.acquireLock();
    try {
      const user = this.users.find(u => u.id === userId) || this.currentUser;
      if (user.role !== 'admin' && user.role !== 'storekeeper') {
        throw { code: 'FORBIDDEN', message: 'Chỉ Thủ kho hoặc Admin mới có quyền ghi nhận nhập kho' };
      }

      const receipt = this.receipts.find(r => r.id === receiptId);
      if (!receipt) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu nhập' };

      if (receipt.status === 'POSTED') {
        throw { code: 'DOCUMENT_ALREADY_POSTED', message: 'Phiếu nhập kho này đã được ghi nhận trước đó' };
      }
      if (receipt.status !== 'APPROVED') {
        throw { code: 'APPROVAL_REQUIRED', message: 'Chỉ phiếu đã phê duyệt mới được ghi nhận nhập kho' };
      }

      // Xử lý từng vật tư trong phiếu nhập kho
      for (const item of receipt.items) {
        let sb = this.stockBalances.find(s => s.warehouse_id === receipt.warehouse_id && s.material_id === item.material_id);
        const oldQty = sb ? sb.quantity : 0;
        const oldValue = sb ? sb.total_value : 0;

        const newQty = oldQty + item.quantity;
        const itemAmount = item.quantity * item.unit_price;
        const newValue = oldValue + itemAmount;
        const newAvgPrice = newQty > 0 ? Math.round((newValue / newQty) * 100) / 100 : item.unit_price;

        if (!sb) {
          const mat = this.materials.find(m => m.id === item.material_id);
          sb = {
            id: `stk-${Date.now()}-${item.material_id}`,
            warehouse_id: receipt.warehouse_id,
            warehouse_name: receipt.warehouse_name,
            material_id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            group_name: mat?.group_name,
            system_name: mat?.system_name,
            unit_name: item.unit_name,
            quantity: newQty,
            average_unit_price: newAvgPrice,
            total_value: newValue,
            min_stock: mat?.min_stock_defaults[receipt.warehouse_id] || 0,
            stock_status: 'NORMAL',
            updated_at: new Date().toISOString()
          };
          this.stockBalances.push(sb);
        } else {
          sb.quantity = newQty;
          sb.average_unit_price = newAvgPrice;
          sb.total_value = newValue;
          sb.updated_at = new Date().toISOString();
        }

        // Update status
        if (sb.quantity <= 0) sb.stock_status = sb.min_stock > 0 ? 'OUT_OF_STOCK' : 'NORMAL';
        else if (sb.quantity <= sb.min_stock) sb.stock_status = 'LOW';
        else sb.stock_status = 'NORMAL';

        // Ghi nhận biến động tồn kho (Stock Movement)
        const movement: StockMovement = {
          id: `mvm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          user_id: user.id,
          user_name: user.full_name,
          warehouse_id: receipt.warehouse_id,
          warehouse_name: receipt.warehouse_name || '',
          material_id: item.material_id,
          material_code: item.material_code,
          material_name: item.material_name,
          unit_name: item.unit_name,
          movement_type: 'RECEIPT',
          delta_quantity: item.quantity,
          quantity_before: oldQty,
          quantity_after: newQty,
          unit_price: item.unit_price,
          total_amount: itemAmount,
          source_document_type: 'RECEIPT',
          source_document_id: receipt.id,
          source_document_number: receipt.document_number,
          notes: item.notes || `Nhập kho theo ${receipt.document_number}`
        };
        this.movements.unshift(movement);
      }

      receipt.status = 'POSTED';
      receipt.actual_date = new Date().toISOString();
      receipt.posted_by_id = user.id;
      receipt.posted_by_name = user.full_name;
      receipt.updated_at = new Date().toISOString();

      this.logAudit(user.id, 'POST_RECEIPT', 'receipt_documents', receipt.id, undefined, {
        document_number: receipt.document_number,
        total_amount: receipt.total_amount
      });

      return receipt;
    } finally {
      unlock();
    }
  }

  // -------------------------------------------------------------
  // RPC: ISSUE (XUẤT KHO)
  // -------------------------------------------------------------
  createIssue(userId: string, payload: {
    warehouse_id: string;
    receiver_name: string;
    receiver_department: string;
    purpose: string;
    work_order_ref?: string;
    notes?: string;
    items: Array<{ material_id: string; quantity: number; notes?: string }>;
  }): IssueDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (!this.checkWarehouseAccess(user, payload.warehouse_id)) {
      throw { code: 'WAREHOUSE_ACCESS_DENIED', message: 'Bạn không được phân quyền tại kho này' };
    }
    if (!payload.items || payload.items.length === 0) {
      throw { code: 'INVALID_QUANTITY', message: 'Phiếu xuất kho phải có ít nhất một dòng vật tư' };
    }

    const warehouse = this.warehouses.find(w => w.id === payload.warehouse_id);
    if (!warehouse) throw { code: 'INVALID_WAREHOUSE', message: 'Kho không tồn tại' };

    const docCount = this.issues.length + 1;
    const docNumber = `PXK-${new Date().getFullYear()}-${String(docCount).padStart(3, '0')}`;

    let totalAmount = 0;
    let hasStockShortage = false;
    const issueId = `iss-${Date.now()}`;
    const issueItems: IssueItem[] = [];

    for (const item of payload.items) {
      if (item.quantity <= 0) {
        throw { code: 'INVALID_QUANTITY', message: 'Số lượng xuất phải lớn hơn 0' };
      }

      const mat = this.materials.find(m => m.id === item.material_id);
      if (!mat) throw { code: 'INVALID_MATERIAL', message: `Vật tư ID ${item.material_id} không tồn tại` };
      if (!mat.is_active) {
        throw { code: 'MATERIAL_INACTIVE', message: `Vật tư ${mat.name} (${mat.code}) đã ngừng sử dụng, không thể lập phiếu xuất` };
      }

      const sb = this.stockBalances.find(s => s.warehouse_id === payload.warehouse_id && s.material_id === mat.id);
      const currentStock = sb ? sb.quantity : 0;
      const avgPrice = sb ? sb.average_unit_price : 0;
      const shortage = Math.max(0, item.quantity - currentStock);

      if (shortage > 0) {
        hasStockShortage = true;
      }

      const lineTotal = item.quantity * avgPrice;
      totalAmount += lineTotal;

      issueItems.push({
        id: `iss-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        issue_id: issueId,
        material_id: mat.id,
        material_code: mat.code,
        material_name: mat.name,
        unit_name: mat.unit_name || 'Cái',
        quantity: item.quantity,
        average_unit_price: avgPrice,
        total_amount: lineTotal,
        current_stock: currentStock,
        shortage_quantity: shortage,
        notes: item.notes || ''
      });
    }

    const newIssue: IssueDocument = {
      id: issueId,
      document_number: docNumber,
      created_date: new Date().toISOString().split('T')[0],
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.name,
      receiver_name: payload.receiver_name,
      receiver_department: payload.receiver_department,
      purpose: payload.purpose,
      work_order_ref: payload.work_order_ref || '',
      creator_id: user.id,
      creator_name: user.full_name,
      status: 'DRAFT',
      notes: payload.notes || '',
      items: issueItems,
      total_amount: totalAmount,
      has_stock_shortage: hasStockShortage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.issues.unshift(newIssue);
    this.logAudit(user.id, 'CREATE_ISSUE', 'issue_documents', newIssue.id, undefined, { document_number: docNumber, hasStockShortage });
    return newIssue;
  }

  submitIssue(userId: string, issueId: string): IssueDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu xuất' };
    if (issue.status !== 'DRAFT') {
      throw { code: 'INVALID_STATUS', message: 'Chỉ phiếu ở trạng thái Nháp mới có thể gửi phê duyệt' };
    }

    issue.status = 'PENDING_APPROVAL';
    issue.updated_at = new Date().toISOString();
    this.logAudit(user.id, 'SUBMIT_ISSUE', 'issue_documents', issue.id);
    return issue;
  }

  approveIssue(userId: string, issueId: string): IssueDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin' && user.role !== 'storekeeper') {
      throw { code: 'FORBIDDEN', message: 'Bạn không có quyền phê duyệt phiếu xuất' };
    }
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu xuất' };

    if (issue.status !== 'PENDING_APPROVAL') {
      throw { code: 'INVALID_STATUS', message: 'Phiếu không ở trạng thái chờ phê duyệt' };
    }

    // Quy tắc: Người lập phiếu không được tự phê duyệt
    if (issue.creator_id === user.id) {
      throw { code: 'SELF_APPROVAL_NOT_ALLOWED', message: 'Người lập phiếu không được phép tự phê duyệt phiếu của chính mình' };
    }

    // Kiểm tra xem hiện tại có dòng nào thiếu tồn không
    let hasShortage = false;
    for (const item of issue.items) {
      const sb = this.stockBalances.find(s => s.warehouse_id === issue.warehouse_id && s.material_id === item.material_id);
      const stock = sb ? sb.quantity : 0;
      item.current_stock = stock;
      item.shortage_quantity = Math.max(0, item.quantity - stock);
      if (item.shortage_quantity > 0) {
        hasShortage = true;
      }
    }
    issue.has_stock_shortage = hasShortage;

    // Quy tắc quan trọng:
    // Phiếu xuất vượt tồn vẫn được phê duyệt, nhưng chuyển trạng thái: APPROVED_WAITING_STOCK nếu thiếu tồn, hoặc APPROVED nếu đủ tồn
    issue.status = hasShortage ? 'APPROVED_WAITING_STOCK' : 'APPROVED';
    issue.approver_id = user.id;
    issue.approver_name = user.full_name;
    issue.updated_at = new Date().toISOString();

    this.logAudit(user.id, 'APPROVE_ISSUE', 'issue_documents', issue.id, undefined, { status: issue.status, hasShortage });
    return issue;
  }

  rejectIssue(userId: string, issueId: string, reason: string): IssueDocument {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin' && user.role !== 'storekeeper') {
      throw { code: 'FORBIDDEN', message: 'Bạn không có quyền từ chối phiếu xuất' };
    }
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu xuất' };
    if (issue.status !== 'PENDING_APPROVAL' && issue.status !== 'APPROVED_WAITING_STOCK') {
      throw { code: 'INVALID_STATUS', message: 'Chỉ phiếu chờ phê duyệt hoặc chờ tồn mới có thể từ chối' };
    }

    issue.status = 'REJECTED';
    issue.approver_id = user.id;
    issue.approver_name = user.full_name;
    issue.rejection_reason = reason || 'Không đủ điều kiện xuất';
    issue.updated_at = new Date().toISOString();
    this.logAudit(user.id, 'REJECT_ISSUE', 'issue_documents', issue.id, undefined, { reason });
    return issue;
  }

  async postIssue(userId: string, issueId: string): Promise<IssueDocument> {
    const unlock = await this.acquireLock();
    try {
      const user = this.users.find(u => u.id === userId) || this.currentUser;
      if (user.role !== 'admin' && user.role !== 'storekeeper') {
        throw { code: 'FORBIDDEN', message: 'Chỉ Thủ kho hoặc Admin mới có quyền ghi nhận xuất kho' };
      }

      const issue = this.issues.find(i => i.id === issueId);
      if (!issue) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy phiếu xuất' };

      if (issue.status === 'POSTED') {
        throw { code: 'DOCUMENT_ALREADY_POSTED', message: 'Phiếu xuất kho này đã được ghi nhận trước đó' };
      }
      if (issue.status !== 'APPROVED' && issue.status !== 'APPROVED_WAITING_STOCK') {
        throw { code: 'APPROVAL_REQUIRED', message: 'Phiếu xuất kho phải được phê duyệt trước khi ghi nhận' };
      }

      // QUY TẮC BẮT BUỘC: GIAO DỊCH NGUYÊN TỬ (ATOMIC TRANSACTION)
      // Khóa và đọc tồn kho thực tế mới nhất cho tất cả các dòng
      // Nếu BẤT KỲ dòng nào thiếu tồn -> ROLLBACK TOÀN BỘ, không trừ bất kỳ dòng nào!
      for (const item of issue.items) {
        const sb = this.stockBalances.find(s => s.warehouse_id === issue.warehouse_id && s.material_id === item.material_id);
        const currentStock = sb ? sb.quantity : 0;
        item.current_stock = currentStock;
        item.shortage_quantity = Math.max(0, item.quantity - currentStock);

        if (currentStock < item.quantity) {
          // Chuyển trạng thái sang APPROVED_WAITING_STOCK
          issue.status = 'APPROVED_WAITING_STOCK';
          issue.has_stock_shortage = true;
          issue.updated_at = new Date().toISOString();

          throw {
            code: 'INSUFFICIENT_STOCK',
            message: `Không đủ tồn kho để xuất vật tư "${item.material_name}" (${item.material_code}). Tồn hiện tại: ${currentStock} ${item.unit_name}, yêu cầu xuất: ${item.quantity} ${item.unit_name}. Toàn bộ giao dịch đã được hủy an toàn.`,
            details: {
              material_id: item.material_id,
              material_code: item.material_code,
              material_name: item.material_name,
              current_quantity: currentStock,
              requested_quantity: item.quantity
            }
          };
        }
      }

      // NẾU TẤT CẢ VẬT TƯ ĐỀU ĐỦ TỒN: THỰC HIỆN TRỪ TỒN TOÀN BỘ NGUYÊN TỬ
      let actualTotalAmount = 0;
      for (const item of issue.items) {
        const sb = this.stockBalances.find(s => s.warehouse_id === issue.warehouse_id && s.material_id === item.material_id)!;
        const oldQty = sb.quantity;
        const avgPrice = sb.average_unit_price;
        const lineTotal = Math.round(item.quantity * avgPrice * 100) / 100;
        actualTotalAmount += lineTotal;

        const newQty = oldQty - item.quantity;
        const newValue = Math.max(0, sb.total_value - lineTotal);

        // Update item price at time of posting
        item.average_unit_price = avgPrice;
        item.total_amount = lineTotal;
        item.shortage_quantity = 0;

        // Trừ tồn kho
        sb.quantity = newQty;
        sb.total_value = newValue;
        sb.updated_at = new Date().toISOString();

        if (sb.quantity <= 0) sb.stock_status = sb.min_stock > 0 ? 'OUT_OF_STOCK' : 'NORMAL';
        else if (sb.quantity <= sb.min_stock) sb.stock_status = 'LOW';
        else sb.stock_status = 'NORMAL';

        // Ghi nhận biến động xuất kho (Stock Movement)
        const movement: StockMovement = {
          id: `mvm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          user_id: user.id,
          user_name: user.full_name,
          warehouse_id: issue.warehouse_id,
          warehouse_name: issue.warehouse_name || '',
          material_id: item.material_id,
          material_code: item.material_code,
          material_name: item.material_name,
          unit_name: item.unit_name,
          movement_type: 'ISSUE',
          delta_quantity: -item.quantity,
          quantity_before: oldQty,
          quantity_after: newQty,
          unit_price: avgPrice,
          total_amount: lineTotal,
          source_document_type: 'ISSUE',
          source_document_id: issue.id,
          source_document_number: issue.document_number,
          notes: item.notes || `Xuất kho theo ${issue.document_number} (${issue.purpose})`
        };
        this.movements.unshift(movement);
      }

      issue.status = 'POSTED';
      issue.has_stock_shortage = false;
      issue.total_amount = actualTotalAmount;
      issue.actual_date = new Date().toISOString();
      issue.posted_by_id = user.id;
      issue.posted_by_name = user.full_name;
      issue.updated_at = new Date().toISOString();

      this.logAudit(user.id, 'POST_ISSUE', 'issue_documents', issue.id, undefined, {
        document_number: issue.document_number,
        total_amount: actualTotalAmount
      });

      return issue;
    } finally {
      unlock();
    }
  }

  // -------------------------------------------------------------
  // RPC: INVENTORY COUNT (KIỂM KÊ & ĐIỀU CHỈNH TỒN)
  // -------------------------------------------------------------
  createInventoryCount(userId: string, payload: {
    warehouse_id: string;
    scope: string;
    notes?: string;
    items: Array<{ material_id: string; actual_quantity: number; material_condition?: string; notes?: string }>;
  }): InventoryCount {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin' && user.role !== 'auditor' && user.role !== 'storekeeper') {
      throw { code: 'FORBIDDEN', message: 'Bạn không có quyền lập đợt kiểm kê' };
    }

    const warehouse = this.warehouses.find(w => w.id === payload.warehouse_id);
    if (!warehouse) throw { code: 'INVALID_WAREHOUSE', message: 'Kho không tồn tại' };

    const countNumber = `KK-${new Date().getFullYear()}-${String(this.inventoryCounts.length + 1).padStart(3, '0')}`;
    const countId = `inv-${Date.now()}`;
    const countItems: InventoryCountItem[] = [];

    for (const item of payload.items) {
      if (item.actual_quantity < 0) {
        throw { code: 'INVALID_QUANTITY', message: 'Số lượng thực tế không được âm' };
      }
      const mat = this.materials.find(m => m.id === item.material_id);
      if (!mat) throw { code: 'INVALID_MATERIAL', message: 'Vật tư không tồn tại' };

      const sb = this.stockBalances.find(s => s.warehouse_id === payload.warehouse_id && s.material_id === mat.id);
      const bookQty = sb ? sb.quantity : 0;
      const diff = item.actual_quantity - bookQty;

      countItems.push({
        id: `inv-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        inventory_count_id: countId,
        material_id: mat.id,
        material_code: mat.code,
        material_name: mat.name,
        unit_name: mat.unit_name || 'Cái',
        book_quantity: bookQty,
        actual_quantity: item.actual_quantity,
        difference_quantity: diff,
        material_condition: item.material_condition || 'Tốt 100%',
        notes: item.notes || ''
      });
    }

    const newCount: InventoryCount = {
      id: countId,
      code: countNumber,
      warehouse_id: warehouse.id,
      warehouse_name: warehouse.name,
      count_date: new Date().toISOString().split('T')[0],
      manager_id: warehouse.manager_id || user.id,
      manager_name: warehouse.manager_name || user.full_name,
      auditor_id: user.id,
      auditor_name: user.full_name,
      scope: payload.scope || 'Toàn bộ vật tư theo kế hoạch',
      status: 'DRAFT',
      notes: payload.notes || '',
      items: countItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.inventoryCounts.unshift(newCount);
    this.logAudit(user.id, 'CREATE_INVENTORY_COUNT', 'inventory_counts', newCount.id, undefined, { code: countNumber });
    return newCount;
  }

  submitInventoryCount(userId: string, countId: string): InventoryCount {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    const count = this.inventoryCounts.find(c => c.id === countId);
    if (!count) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy đợt kiểm kê' };

    count.status = 'SUBMITTED';
    count.updated_at = new Date().toISOString();
    this.logAudit(user.id, 'SUBMIT_INVENTORY_COUNT', 'inventory_counts', count.id);
    return count;
  }

  approveInventoryCount(userId: string, countId: string): InventoryCount {
    const user = this.users.find(u => u.id === userId) || this.currentUser;
    if (user.role !== 'admin') {
      throw { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền phê duyệt đợt kiểm kê' };
    }
    const count = this.inventoryCounts.find(c => c.id === countId);
    if (!count) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy đợt kiểm kê' };

    count.status = 'APPROVED';
    count.updated_at = new Date().toISOString();
    this.logAudit(user.id, 'APPROVE_INVENTORY_COUNT', 'inventory_counts', count.id);
    return count;
  }

  async postInventoryAdjustment(userId: string, payload: {
    count_id: string;
    adjustment_reason: string;
    adjustment_document_ref: string;
  }): Promise<InventoryCount> {
    const unlock = await this.acquireLock();
    try {
      const user = this.users.find(u => u.id === userId) || this.currentUser;
      if (user.role !== 'admin') {
        throw { code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền thực hiện điều chỉnh tồn kho' };
      }

      if (!payload.adjustment_reason || !payload.adjustment_reason.trim()) {
        throw { code: 'INVALID_STATUS', message: 'Điều chỉnh tồn kho bắt buộc phải có lý do cụ thể' };
      }

      const count = this.inventoryCounts.find(c => c.id === payload.count_id);
      if (!count) throw { code: 'INVALID_STATUS', message: 'Không tìm thấy đợt kiểm kê' };

      if (count.status !== 'APPROVED') {
        throw { code: 'APPROVAL_REQUIRED', message: 'Đợt kiểm kê phải được phê duyệt trước khi điều chỉnh tồn kho' };
      }

      // Xử lý từng dòng có chênh lệch
      for (const item of count.items) {
        if (item.difference_quantity === 0) continue;

        const sb = this.stockBalances.find(s => s.warehouse_id === count.warehouse_id && s.material_id === item.material_id);
        if (!sb) continue;

        const oldQty = sb.quantity;
        const newQty = item.actual_quantity;

        // CẤM TỒN KHO ÂM
        if (newQty < 0) {
          throw { code: 'INVALID_QUANTITY', message: `Điều chỉnh không được phép làm tồn kho của ${item.material_name} bị âm` };
        }

        const delta = item.difference_quantity;
        const avgPrice = sb.average_unit_price;
        const deltaAmount = Math.abs(delta) * avgPrice;

        sb.quantity = newQty;
        sb.total_value = Math.round(newQty * avgPrice * 100) / 100;
        sb.updated_at = new Date().toISOString();

        if (sb.quantity <= 0) sb.stock_status = sb.min_stock > 0 ? 'OUT_OF_STOCK' : 'NORMAL';
        else if (sb.quantity <= sb.min_stock) sb.stock_status = 'LOW';
        else sb.stock_status = 'NORMAL';

        // Ghi nhật ký Stock Movement
        const movement: StockMovement = {
          id: `mvm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          user_id: user.id,
          user_name: user.full_name,
          warehouse_id: count.warehouse_id,
          warehouse_name: count.warehouse_name,
          material_id: item.material_id,
          material_code: item.material_code,
          material_name: item.material_name,
          unit_name: item.unit_name,
          movement_type: delta > 0 ? 'ADJUSTMENT_INCREASE' : 'ADJUSTMENT_DECREASE',
          delta_quantity: delta,
          quantity_before: oldQty,
          quantity_after: newQty,
          unit_price: avgPrice,
          total_amount: deltaAmount,
          source_document_type: 'INVENTORY_COUNT',
          source_document_id: count.id,
          source_document_number: count.code,
          notes: `Điều chỉnh kiểm kê: ${payload.adjustment_reason} (BB: ${payload.adjustment_document_ref})`
        };
        this.movements.unshift(movement);
      }

      count.status = 'ADJUSTED';
      count.adjustment_reason = payload.adjustment_reason;
      count.adjustment_document_ref = payload.adjustment_document_ref;
      count.adjusted_by_id = user.id;
      count.adjusted_by_name = user.full_name;
      count.updated_at = new Date().toISOString();

      this.logAudit(user.id, 'POST_INVENTORY_ADJUSTMENT', 'inventory_counts', count.id, undefined, {
        reason: payload.adjustment_reason,
        ref: payload.adjustment_document_ref
      });

      return count;
    } finally {
      unlock();
    }
  }

  // -------------------------------------------------------------
  // REPORT VIEWS
  // -------------------------------------------------------------
  getReportSummary(warehouseId?: string) {
    let balances = this.stockBalances;
    let receipts = this.receipts;
    let issues = this.issues;
    let movements = this.movements;

    if (warehouseId && warehouseId !== 'all') {
      balances = balances.filter(b => b.warehouse_id === warehouseId);
      receipts = receipts.filter(r => r.warehouse_id === warehouseId);
      issues = issues.filter(i => i.warehouse_id === warehouseId);
      movements = movements.filter(m => m.warehouse_id === warehouseId);
    }

    const totalStockValue = balances.reduce((sum, b) => sum + b.total_value, 0);
    const totalMaterialsCount = new Set(balances.filter(b => b.quantity > 0).map(b => b.material_id)).size;
    const lowStockCount = balances.filter(b => b.stock_status === 'LOW' || b.stock_status === 'OUT_OF_STOCK').length;
    const pendingApprovalsCount =
      receipts.filter(r => r.status === 'PENDING_APPROVAL').length +
      issues.filter(i => i.status === 'PENDING_APPROVAL').length;
    const waitingStockIssuesCount = issues.filter(i => i.status === 'APPROVED_WAITING_STOCK').length;

    return {
      totalStockValue,
      totalMaterialsCount,
      lowStockCount,
      pendingApprovalsCount,
      waitingStockIssuesCount,
      warehouseCount: this.warehouses.length
    };
  }
}

export const db = new InMemoryDatabase();
