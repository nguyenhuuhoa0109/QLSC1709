import {
  UserProfile,
  Warehouse,
  WarehouseMember,
  MaterialSystem,
  MaterialGroup,
  Unit,
  Material,
  StockBalance,
  ReceiptDocument,
  IssueDocument,
  InventoryCount,
  StockMovement,
  AuditLog
} from '../../src/types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@sontra1.vn',
    full_name: 'Võ Quốc Tuấn',
    department: 'Phòng Kỹ thuật & Quản lý vận hành',
    position: 'Trưởng phòng Kỹ thuật',
    role: 'admin',
    phone: '0913.456.789',
    assigned_warehouses: ['wh-01', 'wh-02', 'wh-03']
  },
  {
    id: 'usr-store-01',
    email: 'thukho@sontra1.vn',
    full_name: 'Nguyễn Văn Thắng',
    department: 'Đội Quản lý Kho Vật tư',
    position: 'Thủ kho chính',
    role: 'storekeeper',
    phone: '0988.112.233',
    assigned_warehouses: ['wh-01', 'wh-02', 'wh-03']
  },
  {
    id: 'usr-internal-01',
    email: 'kythuat@sontra1.vn',
    full_name: 'Trần Đình Long',
    department: 'Phân xưởng Vận hành Thủy công & Gian máy',
    position: 'Kỹ sư Vận hành & Bảo dưỡng',
    role: 'internal_user',
    phone: '0977.334.455',
    assigned_warehouses: ['wh-01', 'wh-02']
  },
  {
    id: 'usr-auditor-01',
    email: 'kiemke@sontra1.vn',
    full_name: 'Lê Thị Mai',
    department: 'Ban Kiểm toán Nội bộ & Tài chính',
    position: 'Chuyên viên Kiểm kê',
    role: 'auditor',
    phone: '0905.667.788',
    assigned_warehouses: ['wh-01', 'wh-02', 'wh-03']
  }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-01',
    code: 'K-TT',
    name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    location: 'Cao trình +145.0m, Nhà máy Sơn Trà 1, Quảng Ngãi',
    manager_id: 'usr-store-01',
    manager_name: 'Nguyễn Văn Thắng',
    is_active: true,
    notes: 'Chứa vật tư cơ khí tổ máy Francis, phụ tùng tua bin, vật tư tiêu hao vận hành chính.',
    created_at: '2025-01-01T08:00:00Z',
    updated_at: '2025-01-01T08:00:00Z'
  },
  {
    id: 'wh-02',
    code: 'K-TBA',
    name: 'Kho Cơ điện & Trạm phân phối 110kV',
    location: 'Sân phân phối 110kV, Nhà máy Sơn Trà 1',
    manager_id: 'usr-store-01',
    manager_name: 'Nguyễn Văn Thắng',
    is_active: true,
    notes: 'Chứa rơ le, cầu chì trung thế, máy biến áp tự dùng, ắc quy trạm và thiết bị đo kiểm.',
    created_at: '2025-01-01T08:00:00Z',
    updated_at: '2025-01-01T08:00:00Z'
  },
  {
    id: 'wh-03',
    code: 'K-DAP',
    name: 'Kho Đập dâng & Cụm đầu mối Thủy công',
    location: 'Cụm công trình đầu mối Thủy điện Sơn Trà 1 (Đập dâng)',
    manager_id: 'usr-store-01',
    manager_name: 'Nguyễn Văn Thắng',
    is_active: true,
    notes: 'Chứa gioăng làm kín cánh van cung, cáp tời nâng hạ, dầu xi lanh thủy lực đập tràn.',
    created_at: '2025-01-01T08:00:00Z',
    updated_at: '2025-01-01T08:00:00Z'
  }
];

export const INITIAL_SYSTEMS: MaterialSystem[] = [
  { id: 'sys-01', code: 'SYS-TURBINE', name: 'Tổ máy Tua-bin Francis & Máy phát điện', description: 'Các bộ phận roto, stato, cánh hướng, ổ đỡ, ổ hướng' },
  { id: 'sys-02', code: 'SYS-GOV', name: 'Hệ thống Điều tốc & Dầu thủy lực áp lực', description: 'Governor, bộ nguồn thủy lực HPU, bình tích áp Nitơ' },
  { id: 'sys-03', code: 'SYS-TRAN', name: 'Trạm Biến áp nâng & Sân phân phối 110kV', description: 'Máy biến áp chính 110kV, dao cách ly, máy cắt chân không' },
  { id: 'sys-04', code: 'SYS-HYD', name: 'Công trình Thủy công, Đập tràn & Cửa nhận nước', description: 'Cánh van cung, van đĩa hạ lưu, cửa van sửa chữa' },
  { id: 'sys-05', code: 'SYS-AUX', name: 'Hệ thống Tự dùng & Nguồn DC 220V Phụ trợ', description: 'Dàn ắc quy kiềm/chì axit, tủ nạp UPS, máy phát diezen dự phòng' }
];

export const INITIAL_GROUPS: MaterialGroup[] = [
  { id: 'grp-01', code: 'VTTB-CO', name: 'Vật tư cơ khí & Thủy lực', description: 'Van, van an toàn, khớp nối mềm, đệm cao su, bạc lót' },
  { id: 'grp-02', code: 'VTTB-DIEN', name: 'Thiết bị điện & Tự động hóa', description: 'Rơ le, biến dòng TI/TU, cầu chì, contactor, rơle áp lực' },
  { id: 'grp-03', code: 'DMN-HOACHAT', name: 'Dầu mỡ nhờn & Hóa chất bôi trơn', description: 'Dầu tua bin, dầu biến thế, mỡ chịu nước gối trục' },
  { id: 'grp-04', code: 'VT-TIEUHAO', name: 'Vật tư tiêu hao & BHLĐ chuyên dùng', description: 'Găng cách điện, giẻ lau công nghiệp, xịt tiếp điểm, đai an toàn' },
  { id: 'grp-05', code: 'PT-THAYTHE', name: 'Phụ tùng thay thế định kỳ', description: 'Lõi lọc dầu, lọc gió, chổi than máy phát, gioăng làm kín' }
];

export const INITIAL_UNITS: Unit[] = [
  { id: 'unt-01', code: 'CAI', name: 'Cái' },
  { id: 'unt-02', code: 'BO', name: 'Bộ' },
  { id: 'unt-03', code: 'MET', name: 'Mét' },
  { id: 'unt-04', code: 'LIT', name: 'Lít' },
  { id: 'unt-05', code: 'THUNG', name: 'Thùng (209L)' },
  { id: 'unt-06', code: 'KG', name: 'Kg' },
  { id: 'unt-07', code: 'CUON', name: 'Cuộn' },
  { id: 'unt-08', code: 'HOP', name: 'Hộp' }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-01',
    code: 'DMN-TB46',
    name: 'Dầu tua bin Shell Turbo T 46',
    group_id: 'grp-03',
    group_name: 'Dầu mỡ nhờn & Hóa chất bôi trơn',
    system_id: 'sys-01',
    system_name: 'Tổ máy Tua-bin Francis & Máy phát điện',
    unit_id: 'unt-05',
    unit_name: 'Thùng (209L)',
    specification: 'ISO VG 46, tiêu chuẩn ASTM D4304, độ nhớt 46 cSt tại 40°C',
    description: 'Dầu bôi trơn và làm mát chuyên dụng cho gối trục và hệ thống điều tốc tua-bin thủy điện Sơn Trà 1.',
    manufacturer: 'Shell Vietnam',
    origin: 'Singapore / Việt Nam',
    is_active: true,
    min_stock_defaults: { 'wh-01': 5, 'wh-02': 0, 'wh-03': 0 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'mat-02',
    code: 'RL-SEL787',
    name: 'Rơ le bảo vệ so lệch máy biến áp SEL-787',
    group_id: 'grp-02',
    group_name: 'Thiết bị điện & Tự động hóa',
    system_id: 'sys-03',
    system_name: 'Trạm Biến áp nâng & Sân phân phối 110kV',
    unit_id: 'unt-01',
    unit_name: 'Cái',
    specification: 'Điện áp điều khiển 220VDC, dòng 5A, truyền thông IEC 61850',
    description: 'Thiết bị bảo vệ kỹ thuật số dự phòng cho Máy biến áp chính T1 Sơn Trà 1.',
    manufacturer: 'Schweitzer Engineering Laboratories (SEL)',
    origin: 'USA',
    is_active: true,
    min_stock_defaults: { 'wh-01': 0, 'wh-02': 1, 'wh-03': 0 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'mat-03',
    code: 'GK-VC32',
    name: 'Gioăng cao su chữ P làm kín cánh van cung đập tràn',
    group_id: 'grp-01',
    group_name: 'Vật tư cơ khí & Thủy lực',
    system_id: 'sys-04',
    system_name: 'Công trình Thủy công, Đập tràn & Cửa nhận nước',
    unit_id: 'unt-03',
    unit_name: 'Mét',
    specification: 'Cao su chịu mài mòn, bọc PTFE mặt trượt, quy cách P-seal 60x40mm',
    description: 'Chống rò rỉ nước tại khe cữ cánh van cung xả lũ Sơn Trà 1.',
    manufacturer: 'Cao su Kỹ thuật Đồng Nai',
    origin: 'Việt Nam',
    is_active: true,
    min_stock_defaults: { 'wh-01': 0, 'wh-02': 0, 'wh-03': 20 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'mat-04',
    code: 'LOC-OIL01',
    name: 'Lõi lọc dầu cao áp bộ điều tốc HPU (10 Micron)',
    group_id: 'grp-05',
    group_name: 'Phụ tùng thay thế định kỳ',
    system_id: 'sys-02',
    system_name: 'Hệ thống Điều tốc & Dầu thủy lực áp lực',
    unit_id: 'unt-01',
    unit_name: 'Cái',
    specification: 'Áp suất làm việc 160 Bar, độ mịn lọc 10 µm, lưu lượng 120 L/min',
    description: 'Lõi lọc sợi thủy tinh chịu áp cho hệ thống dầu điều tốc van đĩa tua-bin.',
    manufacturer: 'Hydac',
    origin: 'Germany',
    is_active: true,
    min_stock_defaults: { 'wh-01': 4, 'wh-02': 0, 'wh-03': 0 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'mat-05',
    code: 'CT-GEN01',
    name: 'Chổi than tiếp địa trục máy phát điện (Carbon Brush)',
    group_id: 'grp-05',
    group_name: 'Phụ tùng thay thế định kỳ',
    system_id: 'sys-01',
    system_name: 'Tổ máy Tua-bin Francis & Máy phát điện',
    unit_id: 'unt-02',
    unit_name: 'Bộ',
    specification: 'Quy cách 25x32x64mm, chất liệu graphit mạ đồng, chịu dòng tiếp địa 50A',
    description: 'Bảo vệ gối trục chống dòng điện xoáy trục tua-bin Francis.',
    manufacturer: 'Morgan Advanced Materials',
    origin: 'UK',
    is_active: true,
    min_stock_defaults: { 'wh-01': 6, 'wh-02': 0, 'wh-03': 0 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'mat-06',
    code: 'CC-24KV',
    name: 'Ống chì trung thế 24kV - 63A máy biến áp tự dùng',
    group_id: 'grp-02',
    group_name: 'Thiết bị điện & Tự động hóa',
    system_id: 'sys-03',
    system_name: 'Trạm Biến áp nâng & Sân phân phối 110kV',
    unit_id: 'unt-01',
    unit_name: 'Cái',
    specification: 'Điện áp danh định 24kV, dòng ngắt 63A, dòng cắt 50kA, chiều dài 442mm',
    description: 'Bảo vệ ngắn mạch cho máy biến áp tự dùng 22/0.4kV Nhà máy Sơn Trà 1.',
    manufacturer: 'Eaton Cooper Bussmann',
    origin: 'USA',
    is_active: true,
    min_stock_defaults: { 'wh-01': 0, 'wh-02': 3, 'wh-03': 0 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'mat-07',
    code: 'MO-NLGI2',
    name: 'Mỡ bôi trơn bạc trục chịu nước Kluberplex BEM 41-132',
    group_id: 'grp-03',
    group_name: 'Dầu mỡ nhờn & Hóa chất bôi trơn',
    system_id: 'sys-04',
    system_name: 'Công trình Thủy công, Đập tràn & Cửa nhận nước',
    unit_id: 'unt-06',
    unit_name: 'Kg',
    specification: 'Độ đặc NLGI 2, mỡ gốc tổng hợp chịu nước ngọt và áp lực lớn',
    description: 'Bôi trơn bạc đồng ngập nước cánh van xả cát và van nhận nước.',
    manufacturer: 'Kluber Lubrication',
    origin: 'Germany',
    is_active: true,
    min_stock_defaults: { 'wh-01': 10, 'wh-02': 0, 'wh-03': 15 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'mat-08',
    code: 'BHLD-G24',
    name: 'Găng tay cao su cách điện hạ thế & trung thế 24kV',
    group_id: 'grp-04',
    group_name: 'Vật tư tiêu hao & BHLĐ chuyên dùng',
    system_id: 'sys-05',
    system_name: 'Hệ thống Tự dùng & Nguồn DC 220V Phụ trợ',
    unit_id: 'unt-02',
    unit_name: 'Bộ',
    specification: 'Cấp bảo vệ Class 2 (thử nghiệm 20kV, sử dụng đến 17kV - 24kV), size 10',
    description: 'Trang bị an toàn kiểm tra tủ hợp bộ 22kV và trạm 110kV.',
    manufacturer: 'Regeltex',
    origin: 'France',
    is_active: true,
    min_stock_defaults: { 'wh-01': 2, 'wh-02': 2, 'wh-03': 1 },
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  }
];

export const INITIAL_STOCK_BALANCES: StockBalance[] = [
  {
    id: 'stk-01',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    warehouse_code: 'K-TT',
    material_id: 'mat-01',
    material_code: 'DMN-TB46',
    material_name: 'Dầu tua bin Shell Turbo T 46',
    group_name: 'Dầu mỡ nhờn & Hóa chất bôi trơn',
    system_name: 'Tổ máy Tua-bin Francis & Máy phát điện',
    unit_name: 'Thùng (209L)',
    quantity: 12,
    average_unit_price: 18500000,
    total_value: 222000000,
    min_stock: 5,
    stock_status: 'NORMAL',
    updated_at: '2025-05-15T09:00:00Z'
  },
  {
    id: 'stk-02',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    warehouse_code: 'K-TT',
    material_id: 'mat-04',
    material_code: 'LOC-OIL01',
    material_name: 'Lõi lọc dầu cao áp bộ điều tốc HPU (10 Micron)',
    group_name: 'Phụ tùng thay thế định kỳ',
    system_name: 'Hệ thống Điều tốc & Dầu thủy lực áp lực',
    unit_name: 'Cái',
    quantity: 2, // LOW STOCK (min is 4)
    average_unit_price: 4200000,
    total_value: 8400000,
    min_stock: 4,
    stock_status: 'LOW',
    updated_at: '2025-05-10T14:30:00Z'
  },
  {
    id: 'stk-03',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    warehouse_code: 'K-TT',
    material_id: 'mat-05',
    material_code: 'CT-GEN01',
    material_name: 'Chổi than tiếp địa trục máy phát điện (Carbon Brush)',
    group_name: 'Phụ tùng thay thế định kỳ',
    system_name: 'Tổ máy Tua-bin Francis & Máy phát điện',
    unit_name: 'Bộ',
    quantity: 8,
    average_unit_price: 850000,
    total_value: 6800000,
    min_stock: 6,
    stock_status: 'NORMAL',
    updated_at: '2025-05-01T08:00:00Z'
  },
  {
    id: 'stk-04',
    warehouse_id: 'wh-02',
    warehouse_name: 'Kho Cơ điện & Trạm phân phối 110kV',
    warehouse_code: 'K-TBA',
    material_id: 'mat-02',
    material_code: 'RL-SEL787',
    material_name: 'Rơ le bảo vệ so lệch máy biến áp SEL-787',
    group_name: 'Thiết bị điện & Tự động hóa',
    system_name: 'Trạm Biến áp nâng & Sân phân phối 110kV',
    unit_name: 'Cái',
    quantity: 1,
    average_unit_price: 145000000,
    total_value: 145000000,
    min_stock: 1,
    stock_status: 'NORMAL',
    updated_at: '2025-04-20T11:00:00Z'
  },
  {
    id: 'stk-05',
    warehouse_id: 'wh-02',
    warehouse_name: 'Kho Cơ điện & Trạm phân phối 110kV',
    warehouse_code: 'K-TBA',
    material_id: 'mat-06',
    material_code: 'CC-24KV',
    material_name: 'Ống chì trung thế 24kV - 63A máy biến áp tự dùng',
    group_name: 'Thiết bị điện & Tự động hóa',
    system_name: 'Trạm Biến áp nâng & Sân phân phối 110kV',
    unit_name: 'Cái',
    quantity: 0, // OUT OF STOCK
    average_unit_price: 1250000,
    total_value: 0,
    min_stock: 3,
    stock_status: 'OUT_OF_STOCK',
    updated_at: '2025-05-18T16:00:00Z'
  },
  {
    id: 'stk-06',
    warehouse_id: 'wh-03',
    warehouse_name: 'Kho Đập dâng & Cụm đầu mối Thủy công',
    warehouse_code: 'K-DAP',
    material_id: 'mat-03',
    material_code: 'GK-VC32',
    material_name: 'Gioăng cao su chữ P làm kín cánh van cung đập tràn',
    group_name: 'Vật tư cơ khí & Thủy lực',
    system_name: 'Công trình Thủy công, Đập tràn & Cửa nhận nước',
    unit_name: 'Mét',
    quantity: 28,
    average_unit_price: 680000,
    total_value: 19040000,
    min_stock: 20,
    stock_status: 'NORMAL',
    updated_at: '2025-03-12T10:00:00Z'
  },
  {
    id: 'stk-07',
    warehouse_id: 'wh-03',
    warehouse_name: 'Kho Đập dâng & Cụm đầu mối Thủy công',
    warehouse_code: 'K-DAP',
    material_id: 'mat-07',
    material_code: 'MO-NLGI2',
    material_name: 'Mỡ bôi trơn bạc trục chịu nước Kluberplex BEM 41-132',
    group_name: 'Dầu mỡ nhờn & Hóa chất bôi trơn',
    system_name: 'Công trình Thủy công, Đập tràn & Cửa nhận nước',
    unit_name: 'Kg',
    quantity: 35,
    average_unit_price: 490000,
    total_value: 17150000,
    min_stock: 15,
    stock_status: 'NORMAL',
    updated_at: '2025-04-05T09:00:00Z'
  }
];

export const INITIAL_RECEIPTS: ReceiptDocument[] = [
  {
    id: 'rcp-01',
    document_number: 'PNK-2025-001',
    created_date: '2025-05-01',
    actual_date: '2025-05-02T10:00:00Z',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    source_type: 'Mua sắm hợp đồng định kỳ',
    supplier_name: 'Công ty TNHH Dầu nhờn Công nghiệp Việt - Nhật',
    invoice_number: 'HD-0098421',
    creator_id: 'usr-store-01',
    creator_name: 'Nguyễn Văn Thắng',
    approver_id: 'usr-admin-01',
    approver_name: 'Võ Quốc Tuấn',
    posted_by_id: 'usr-store-01',
    posted_by_name: 'Nguyễn Văn Thắng',
    status: 'POSTED',
    notes: 'Nhập bổ sung dầu tua bin Shell Turbo T 46 phục vụ bảo dưỡng trung tu Tổ máy H1.',
    total_amount: 111000000,
    created_at: '2025-05-01T08:30:00Z',
    updated_at: '2025-05-02T10:00:00Z',
    items: [
      {
        id: 'rcp-item-01',
        receipt_id: 'rcp-01',
        material_id: 'mat-01',
        material_code: 'DMN-TB46',
        material_name: 'Dầu tua bin Shell Turbo T 46',
        unit_name: 'Thùng (209L)',
        quantity: 6,
        unit_price: 18500000,
        total_amount: 111000000,
        notes: 'Hàng nguyên seal hãng, CO/CQ đầy đủ'
      }
    ]
  },
  {
    id: 'rcp-02',
    document_number: 'PNK-2025-002',
    created_date: '2025-05-20',
    warehouse_id: 'wh-02',
    warehouse_name: 'Kho Cơ điện & Trạm phân phối 110kV',
    source_type: 'Cung cấp theo gói thầu vật tư dự phòng trạm',
    supplier_name: 'Công ty CP Kỹ thuật Điện Miền Trung',
    invoice_number: 'HD-ET2025-11',
    creator_id: 'usr-internal-01',
    creator_name: 'Trần Đình Long',
    approver_id: 'usr-admin-01',
    approver_name: 'Võ Quốc Tuấn',
    status: 'APPROVED',
    notes: 'Đề nghị nhập ống chì 24kV thay thế các ống chì tự dùng đã hết hạn.',
    total_amount: 7500000,
    created_at: '2025-05-20T09:15:00Z',
    updated_at: '2025-05-21T14:00:00Z',
    items: [
      {
        id: 'rcp-item-02',
        receipt_id: 'rcp-02',
        material_id: 'mat-06',
        material_code: 'CC-24KV',
        material_name: 'Ống chì trung thế 24kV - 63A máy biến áp tự dùng',
        unit_name: 'Cái',
        quantity: 6,
        unit_price: 1250000,
        total_amount: 7500000,
        notes: 'Chờ thủ kho ghi nhận nhập kho thực tế'
      }
    ]
  }
];

export const INITIAL_ISSUES: IssueDocument[] = [
  {
    id: 'iss-01',
    document_number: 'PXK-2025-001',
    created_date: '2025-05-10',
    actual_date: '2025-05-11T09:30:00Z',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    receiver_name: 'Nguyễn Đình Hùng',
    receiver_department: 'Tổ Vận hành gian máy H1-H2',
    purpose: 'Thay thế lọc dầu cao áp cho bộ điều tốc HPU Tổ máy H1 trước mùa mưa bão',
    work_order_ref: 'WO-ST1-2025-0511',
    creator_id: 'usr-internal-01',
    creator_name: 'Trần Đình Long',
    approver_id: 'usr-admin-01',
    approver_name: 'Võ Quốc Tuấn',
    posted_by_id: 'usr-store-01',
    posted_by_name: 'Nguyễn Văn Thắng',
    status: 'POSTED',
    notes: 'Đã hoàn thành xuất kho theo đúng quy trình kiểm định.',
    total_amount: 8400000,
    has_stock_shortage: false,
    created_at: '2025-05-10T08:00:00Z',
    updated_at: '2025-05-11T09:30:00Z',
    items: [
      {
        id: 'iss-item-01',
        issue_id: 'iss-01',
        material_id: 'mat-04',
        material_code: 'LOC-OIL01',
        material_name: 'Lõi lọc dầu cao áp bộ điều tốc HPU (10 Micron)',
        unit_name: 'Cái',
        quantity: 2,
        average_unit_price: 4200000,
        total_amount: 8400000,
        current_stock: 4,
        shortage_quantity: 0,
        notes: 'Lắp thay thế tại tủ HPU số 1'
      }
    ]
  },
  {
    id: 'iss-02',
    document_number: 'PXK-2025-002',
    created_date: '2025-05-22',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    receiver_name: 'Trần Đình Long',
    receiver_department: 'Phân xưởng Sửa chữa Cơ điện',
    purpose: 'Bổ sung dầu tua bin và thay lõi lọc áp lực Tổ máy H2',
    work_order_ref: 'YC-ST1-BTH2',
    creator_id: 'usr-internal-01',
    creator_name: 'Trần Đình Long',
    approver_id: 'usr-admin-01',
    approver_name: 'Võ Quốc Tuấn',
    status: 'APPROVED_WAITING_STOCK', // Shortage example!
    notes: 'Phiếu đã phê duyệt nhưng kho chỉ còn 2 cái lõi lọc (yêu cầu 4 cái). Chờ bổ sung tồn.',
    total_amount: 16800000,
    has_stock_shortage: true,
    created_at: '2025-05-22T10:00:00Z',
    updated_at: '2025-05-22T14:20:00Z',
    items: [
      {
        id: 'iss-item-02',
        issue_id: 'iss-02',
        material_id: 'mat-04',
        material_code: 'LOC-OIL01',
        material_name: 'Lõi lọc dầu cao áp bộ điều tốc HPU (10 Micron)',
        unit_name: 'Cái',
        quantity: 4,
        average_unit_price: 4200000,
        total_amount: 16800000,
        current_stock: 2,
        shortage_quantity: 2, // Deficit!
        notes: 'Thiếu 2 cái trong kho'
      }
    ]
  }
];

export const INITIAL_INVENTORY_COUNTS: InventoryCount[] = [
  {
    id: 'inv-01',
    code: 'KK-2025-Q1-DAP',
    warehouse_id: 'wh-03',
    warehouse_name: 'Kho Đập dâng & Cụm đầu mối Thủy công',
    count_date: '2025-03-31',
    manager_id: 'usr-admin-01',
    manager_name: 'Võ Quốc Tuấn',
    auditor_id: 'usr-auditor-01',
    auditor_name: 'Lê Thị Mai',
    scope: 'Toàn bộ vật tư cơ khí & mỡ chịu nước cụm công trình đầu mối',
    status: 'ADJUSTED',
    notes: 'Kiểm kê định kỳ Quý 1/2025. Phát hiện thừa 1 mét gioăng P do đo đạc cuộn dự phòng.',
    adjustment_reason: 'Hiệu chỉnh sai số đo chiều dài thực tế mét gioăng cuộn nguyên tem',
    adjustment_document_ref: 'BBKK-ST1-032025',
    adjusted_by_id: 'usr-admin-01',
    adjusted_by_name: 'Võ Quốc Tuấn',
    created_at: '2025-03-31T08:00:00Z',
    updated_at: '2025-04-01T15:00:00Z',
    items: [
      {
        id: 'inv-item-01',
        inventory_count_id: 'inv-01',
        material_id: 'mat-03',
        material_code: 'GK-VC32',
        material_name: 'Gioăng cao su chữ P làm kín cánh van cung đập tràn',
        unit_name: 'Mét',
        book_quantity: 27,
        actual_quantity: 28,
        difference_quantity: 1, // +1
        material_condition: 'Tốt 100%, bảo quản khô ráo',
        notes: 'Đã lập biên bản điều chỉnh'
      },
      {
        id: 'inv-item-02',
        inventory_count_id: 'inv-01',
        material_id: 'mat-07',
        material_code: 'MO-NLGI2',
        material_name: 'Mỡ bôi trơn bạc trục chịu nước Kluberplex BEM 41-132',
        unit_name: 'Kg',
        book_quantity: 35,
        actual_quantity: 35,
        difference_quantity: 0,
        material_condition: 'Tốt, còn nguyên xô thiếc',
        notes: 'Khớp sổ sách 100%'
      }
    ]
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mvm-01',
    timestamp: '2025-04-01T15:00:00Z',
    user_id: 'usr-admin-01',
    user_name: 'Võ Quốc Tuấn',
    warehouse_id: 'wh-03',
    warehouse_name: 'Kho Đập dâng & Cụm đầu mối Thủy công',
    material_id: 'mat-03',
    material_code: 'GK-VC32',
    material_name: 'Gioăng cao su chữ P làm kín cánh van cung đập tràn',
    unit_name: 'Mét',
    movement_type: 'ADJUSTMENT_INCREASE',
    delta_quantity: 1,
    quantity_before: 27,
    quantity_after: 28,
    unit_price: 680000,
    total_amount: 680000,
    source_document_type: 'INVENTORY_COUNT',
    source_document_id: 'inv-01',
    source_document_number: 'KK-2025-Q1-DAP',
    notes: 'Điều chỉnh tăng sau kiểm kê Quý 1/2025'
  },
  {
    id: 'mvm-02',
    timestamp: '2025-05-02T10:00:00Z',
    user_id: 'usr-store-01',
    user_name: 'Nguyễn Văn Thắng',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    material_id: 'mat-01',
    material_code: 'DMN-TB46',
    material_name: 'Dầu tua bin Shell Turbo T 46',
    unit_name: 'Thùng (209L)',
    movement_type: 'RECEIPT',
    delta_quantity: 6,
    quantity_before: 6,
    quantity_after: 12,
    unit_price: 18500000,
    total_amount: 111000000,
    source_document_type: 'RECEIPT',
    source_document_id: 'rcp-01',
    source_document_number: 'PNK-2025-001',
    notes: 'Nhập kho theo hợp đồng mua sắm định kỳ'
  },
  {
    id: 'mvm-03',
    timestamp: '2025-05-11T09:30:00Z',
    user_id: 'usr-store-01',
    user_name: 'Nguyễn Văn Thắng',
    warehouse_id: 'wh-01',
    warehouse_name: 'Kho Trung tâm Gian máy & Nhà điều hành',
    material_id: 'mat-04',
    material_code: 'LOC-OIL01',
    material_name: 'Lõi lọc dầu cao áp bộ điều tốc HPU (10 Micron)',
    unit_name: 'Cái',
    movement_type: 'ISSUE',
    delta_quantity: -2,
    quantity_before: 4,
    quantity_after: 2,
    unit_price: 4200000,
    total_amount: 8400000,
    source_document_type: 'ISSUE',
    source_document_id: 'iss-01',
    source_document_number: 'PXK-2025-001',
    notes: 'Xuất thay lõi lọc tủ HPU số 1'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'adt-01',
    timestamp: '2025-05-02T10:00:00Z',
    user_id: 'usr-store-01',
    user_name: 'Nguyễn Văn Thắng',
    action: 'POST_RECEIPT',
    table_name: 'receipt_documents',
    record_id: 'rcp-01',
    after_data: { document_number: 'PNK-2025-001', total_amount: 111000000, status: 'POSTED' },
    trace_info: 'IP: 192.168.10.25 (Mạng LAN Nhà điều hành Sơn Trà 1)'
  },
  {
    id: 'adt-02',
    timestamp: '2025-05-11T09:30:00Z',
    user_id: 'usr-store-01',
    user_name: 'Nguyễn Văn Thắng',
    action: 'POST_ISSUE',
    table_name: 'issue_documents',
    record_id: 'iss-01',
    after_data: { document_number: 'PXK-2025-001', total_amount: 8400000, status: 'POSTED' },
    trace_info: 'IP: 192.168.10.25'
  }
];
