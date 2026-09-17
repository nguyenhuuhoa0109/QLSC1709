-- ====================================================================
-- HỆ THỐNG QUẢN LÝ KHO VẬT TƯ NỘI BỘ - NHÀ MÁY THỦY ĐIỆN SƠN TRÀ 1
-- SUPABASE / POSTGRESQL DATABASE SCHEMA, RLS POLICIES & RPC FUNCTIONS
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG PROFILES (Người dùng)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'internal_user' CHECK (role IN ('admin', 'storekeeper', 'internal_user', 'auditor')),
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'storekeeper', 'internal_user', 'auditor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. BẢNG WAREHOUSES (Danh mục kho)
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    manager_id UUID REFERENCES profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG WAREHOUSE MEMBERS (Phân quyền người dùng theo kho)
CREATE TABLE IF NOT EXISTS warehouse_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    can_issue BOOLEAN DEFAULT TRUE,
    can_receive BOOLEAN DEFAULT TRUE,
    can_audit BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(warehouse_id, user_id)
);

-- 5. BẢNG MATERIAL SYSTEMS (Hệ thống thiết bị thủy điện)
CREATE TABLE IF NOT EXISTS material_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG MATERIAL GROUPS (Nhóm vật tư)
CREATE TABLE IF NOT EXISTS material_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG UNITS (Đơn vị tính)
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BẢNG MATERIALS (Danh mục vật tư)
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    group_id UUID NOT NULL REFERENCES material_groups(id),
    system_id UUID NOT NULL REFERENCES material_systems(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    specification TEXT,
    description TEXT,
    manufacturer VARCHAR(255),
    origin VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BẢNG WAREHOUSE MATERIAL SETTINGS (Mức tồn tối thiểu theo từng kho)
CREATE TABLE IF NOT EXISTS warehouse_material_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    min_stock NUMERIC(15, 3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    max_stock NUMERIC(15, 3) DEFAULT NULL CHECK (max_stock IS NULL OR max_stock >= min_stock),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(warehouse_id, material_id)
);

-- 10. BẢNG RECEIPT DOCUMENTS (Phiếu nhập kho)
CREATE TABLE IF NOT EXISTS receipt_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_number VARCHAR(100) NOT NULL UNIQUE,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    actual_date TIMESTAMPTZ,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    source_type VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(255),
    invoice_number VARCHAR(100),
    creator_id UUID NOT NULL REFERENCES profiles(id),
    approver_id UUID REFERENCES profiles(id),
    posted_by_id UUID REFERENCES profiles(id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'REJECTED')),
    notes TEXT,
    rejection_reason TEXT,
    total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BẢNG RECEIPT ITEMS (Chi tiết phiếu nhập)
CREATE TABLE IF NOT EXISTS receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES receipt_documents(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity NUMERIC(15, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    total_amount NUMERIC(18, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BẢNG ISSUE DOCUMENTS (Phiếu xuất kho)
CREATE TABLE IF NOT EXISTS issue_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_number VARCHAR(100) NOT NULL UNIQUE,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    actual_date TIMESTAMPTZ,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    receiver_name VARCHAR(255) NOT NULL,
    receiver_department VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    work_order_ref VARCHAR(100),
    creator_id UUID NOT NULL REFERENCES profiles(id),
    approver_id UUID REFERENCES profiles(id),
    posted_by_id UUID REFERENCES profiles(id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'APPROVED_WAITING_STOCK', 'POSTED', 'REJECTED')),
    notes TEXT,
    rejection_reason TEXT,
    total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BẢNG ISSUE ITEMS (Chi tiết phiếu xuất)
CREATE TABLE IF NOT EXISTS issue_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issue_documents(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    quantity NUMERIC(15, 3) NOT NULL CHECK (quantity > 0),
    average_unit_price NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (average_unit_price >= 0),
    total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. BẢNG STOCK BALANCES (Tồn kho theo từng kho & vật tư - CẤM TỒN ÂM)
CREATE TABLE IF NOT EXISTS stock_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    average_unit_price NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (average_unit_price >= 0),
    total_value NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (total_value >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(warehouse_id, material_id)
);

-- 15. BẢNG STOCK MOVEMENTS (Lịch sử biến động nhập xuất - BẤT BIẾN)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    material_id UUID NOT NULL REFERENCES materials(id),
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('RECEIPT', 'ISSUE', 'ADJUSTMENT_INCREASE', 'ADJUSTMENT_DECREASE')),
    delta_quantity NUMERIC(15, 3) NOT NULL,
    quantity_before NUMERIC(15, 3) NOT NULL CHECK (quantity_before >= 0),
    quantity_after NUMERIC(15, 3) NOT NULL CHECK (quantity_after >= 0),
    unit_price NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    source_document_type VARCHAR(50) NOT NULL,
    source_document_id UUID NOT NULL,
    source_document_number VARCHAR(100) NOT NULL,
    notes TEXT
);

-- 16. BẢNG INVENTORY COUNTS (Đợt kiểm kê)
CREATE TABLE IF NOT EXISTS inventory_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    count_date DATE NOT NULL DEFAULT CURRENT_DATE,
    manager_id UUID NOT NULL REFERENCES profiles(id),
    auditor_id UUID NOT NULL REFERENCES profiles(id),
    scope VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COUNTING', 'SUBMITTED', 'APPROVED', 'ADJUSTED', 'CANCELLED')),
    notes TEXT,
    adjustment_reason TEXT,
    adjustment_document_ref VARCHAR(100),
    adjusted_by_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. BẢNG INVENTORY COUNT ITEMS (Chi tiết đợt kiểm kê)
CREATE TABLE IF NOT EXISTS inventory_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id),
    book_quantity NUMERIC(15, 3) NOT NULL DEFAULT 0 CHECK (book_quantity >= 0),
    actual_quantity NUMERIC(15, 3) NOT NULL DEFAULT 0 CHECK (actual_quantity >= 0),
    difference_quantity NUMERIC(15, 3) NOT NULL GENERATED ALWAYS AS (actual_quantity - book_quantity) STORED,
    material_condition VARCHAR(100) NOT NULL DEFAULT 'Tốt 100%',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. BẢNG APPROVALS (Nhật ký phê duyệt)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('RECEIPT', 'ISSUE', 'INVENTORY_COUNT')),
    document_id UUID NOT NULL,
    approver_id UUID NOT NULL REFERENCES profiles(id),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    decision_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT
);

-- 19. BẢNG NOTIFICATIONS (Thông báo nội bộ)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. BẢNG AUDIT LOGS (Nhật ký kiểm toán)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    before_data JSONB,
    after_data JSONB,
    trace_info TEXT
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(code);
CREATE INDEX IF NOT EXISTS idx_materials_group ON materials(group_id);
CREATE INDEX IF NOT EXISTS idx_stock_balances_warehouse ON stock_balances(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_time ON stock_movements(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_mat ON stock_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_receipt_docs_status ON receipt_documents(status);
CREATE INDEX IF NOT EXISTS idx_issue_docs_status ON issue_documents(status);

-- ====================================================================
-- VIEWS BÁO CÁO & TRA CỨU
-- ====================================================================

-- 1. v_stock_balance
CREATE OR REPLACE VIEW v_stock_balance AS
SELECT 
    sb.id,
    sb.warehouse_id,
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    sb.material_id,
    m.code AS material_code,
    m.name AS material_name,
    mg.name AS group_name,
    ms.name AS system_name,
    u.name AS unit_name,
    sb.quantity,
    sb.average_unit_price,
    sb.total_value,
    COALESCE(wms.min_stock, 0) AS min_stock,
    CASE 
        WHEN sb.quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN sb.quantity <= COALESCE(wms.min_stock, 0) THEN 'LOW'
        ELSE 'NORMAL'
    END AS stock_status,
    sb.updated_at
FROM stock_balances sb
JOIN warehouses w ON sb.warehouse_id = w.id
JOIN materials m ON sb.material_id = m.id
JOIN material_groups mg ON m.group_id = mg.id
JOIN material_systems ms ON m.system_id = ms.id
JOIN units u ON m.unit_id = u.id
LEFT JOIN warehouse_material_settings wms ON sb.warehouse_id = wms.warehouse_id AND sb.material_id = wms.material_id;

-- 2. v_stock_value
CREATE OR REPLACE VIEW v_stock_value AS
SELECT 
    w.id AS warehouse_id,
    w.name AS warehouse_name,
    COUNT(sb.id) AS total_materials,
    SUM(sb.quantity) AS total_quantity,
    SUM(sb.total_value) AS total_inventory_value
FROM warehouses w
LEFT JOIN stock_balances sb ON w.id = sb.warehouse_id
GROUP BY w.id, w.name;

-- 3. v_stock_low_alert
CREATE OR REPLACE VIEW v_stock_low_alert AS
SELECT * FROM v_stock_balance WHERE stock_status IN ('LOW', 'OUT_OF_STOCK');

-- 4. v_stock_movement_history
CREATE OR REPLACE VIEW v_stock_movement_history AS
SELECT 
    sm.*,
    p.full_name AS user_full_name,
    w.name AS warehouse_display_name,
    m.code AS material_display_code,
    m.name AS material_display_name,
    u.name AS unit_display_name
FROM stock_movements sm
JOIN profiles p ON sm.user_id = p.id
JOIN warehouses w ON sm.warehouse_id = w.id
JOIN materials m ON sm.material_id = m.id
JOIN units u ON m.unit_id = u.id
ORDER BY sm.timestamp DESC;

-- 5. v_pending_approvals
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
    'RECEIPT' AS doc_type,
    r.id,
    r.document_number,
    r.created_date,
    w.name AS warehouse_name,
    p.full_name AS creator_name,
    r.total_amount,
    r.status
FROM receipt_documents r
JOIN warehouses w ON r.warehouse_id = w.id
JOIN profiles p ON r.creator_id = p.id
WHERE r.status = 'PENDING_APPROVAL'
UNION ALL
SELECT 
    'ISSUE' AS doc_type,
    i.id,
    i.document_number,
    i.created_date,
    w.name AS warehouse_name,
    p.full_name AS creator_name,
    i.total_amount,
    i.status
FROM issue_documents i
JOIN warehouses w ON i.warehouse_id = w.id
JOIN profiles p ON i.creator_id = p.id
WHERE i.status = 'PENDING_APPROVAL';

-- ====================================================================
-- STORED PROCEDURES / RPC FUNCTIONS CẬP NHẬT TỒN KHO AN TOÀN & TRANSACTION
-- ====================================================================

-- RPC 1: GHI NHẬN NHẬP KHO (post_receipt)
CREATE OR REPLACE FUNCTION post_receipt(
    p_receipt_id UUID,
    p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_receipt RECORD;
    v_item RECORD;
    v_old_qty NUMERIC(15, 3);
    v_old_value NUMERIC(18, 2);
    v_new_qty NUMERIC(15, 3);
    v_new_value NUMERIC(18, 2);
    v_new_avg_price NUMERIC(18, 2);
    v_user_role VARCHAR(50);
    v_has_access BOOLEAN;
BEGIN
    -- 1. Kiểm tra quyền người thực hiện
    SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
    IF v_user_role NOT IN ('admin', 'storekeeper') THEN
        RETURN jsonb_build_object('success', false, 'code', 'FORBIDDEN', 'message', 'Bạn không có quyền ghi nhận nhập kho');
    END IF;

    -- 2. Kiểm tra phiếu nhập
    SELECT * INTO v_receipt FROM receipt_documents WHERE id = p_receipt_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'INVALID_STATUS', 'message', 'Không tìm thấy phiếu nhập kho');
    END IF;

    IF v_receipt.status = 'POSTED' THEN
        RETURN jsonb_build_object('success', false, 'code', 'DOCUMENT_ALREADY_POSTED', 'message', 'Phiếu nhập kho này đã được ghi nhận trước đó');
    END IF;

    IF v_receipt.status != 'APPROVED' THEN
        RETURN jsonb_build_object('success', false, 'code', 'APPROVAL_REQUIRED', 'message', 'Phiếu nhập kho phải được phê duyệt trước khi ghi nhận');
    END IF;

    -- 3. Xử lý từng dòng chi tiết phiếu nhập (Gia quyền đơn giá & Tăng tồn)
    FOR v_item IN SELECT * FROM receipt_items WHERE receipt_id = p_receipt_id LOOP
        -- Lock dòng tồn kho
        SELECT quantity, total_value INTO v_old_qty, v_old_value 
        FROM stock_balances 
        WHERE warehouse_id = v_receipt.warehouse_id AND material_id = v_item.material_id
        FOR UPDATE;

        IF NOT FOUND THEN
            v_old_qty := 0;
            v_old_value := 0;
            v_new_qty := v_item.quantity;
            v_new_value := v_item.total_amount;
            v_new_avg_price := v_item.unit_price;

            INSERT INTO stock_balances(warehouse_id, material_id, quantity, average_unit_price, total_value, updated_at)
            VALUES (v_receipt.warehouse_id, v_item.material_id, v_new_qty, v_new_avg_price, v_new_value, NOW());
        ELSE
            v_new_qty := v_old_qty + v_item.quantity;
            v_new_value := v_old_value + v_item.total_amount;
            IF v_new_qty > 0 THEN
                v_new_avg_price := ROUND(v_new_value / v_new_qty, 2);
            ELSE
                v_new_avg_price := v_item.unit_price;
            END IF;

            UPDATE stock_balances
            SET quantity = v_new_qty,
                average_unit_price = v_new_avg_price,
                total_value = v_new_value,
                updated_at = NOW()
            WHERE warehouse_id = v_receipt.warehouse_id AND material_id = v_item.material_id;
        END IF;

        -- Ghi lịch sử biến động kho
        INSERT INTO stock_movements (
            timestamp, user_id, warehouse_id, material_id, movement_type,
            delta_quantity, quantity_before, quantity_after, unit_price, total_amount,
            source_document_type, source_document_id, source_document_number, notes
        ) VALUES (
            NOW(), p_user_id, v_receipt.warehouse_id, v_item.material_id, 'RECEIPT',
            v_item.quantity, v_old_qty, v_new_qty, v_item.unit_price, v_item.total_amount,
            'RECEIPT', v_receipt.id, v_receipt.document_number, v_item.notes
        );
    END LOOP;

    -- 4. Cập nhật trạng thái phiếu
    UPDATE receipt_documents
    SET status = 'POSTED',
        actual_date = NOW(),
        posted_by_id = p_user_id,
        updated_at = NOW()
    WHERE id = p_receipt_id;

    -- 5. Ghi Audit Log
    INSERT INTO audit_logs (user_id, action, table_name, record_id, after_data)
    VALUES (p_user_id, 'POST_RECEIPT', 'receipt_documents', p_receipt_id::text, jsonb_build_object('document_number', v_receipt.document_number, 'warehouse_id', v_receipt.warehouse_id));

    RETURN jsonb_build_object('success', true, 'message', 'Ghi nhận nhập kho thành công');
END;
$$;

-- RPC 2: GHI NHẬN XUẤT KHO (post_issue - ATOMIC TRANSACTION, STRICT NO NEGATIVE STOCK)
CREATE OR REPLACE FUNCTION post_issue(
    p_issue_id UUID,
    p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_issue RECORD;
    v_item RECORD;
    v_current_stock NUMERIC(15, 3);
    v_avg_price NUMERIC(18, 2);
    v_old_value NUMERIC(18, 2);
    v_new_qty NUMERIC(15, 3);
    v_new_value NUMERIC(18, 2);
    v_item_total NUMERIC(18, 2);
    v_issue_total NUMERIC(18, 2) := 0;
    v_user_role VARCHAR(50);
BEGIN
    -- 1. Kiểm tra vai trò
    SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;
    IF v_user_role NOT IN ('admin', 'storekeeper') THEN
        RETURN jsonb_build_object('success', false, 'code', 'FORBIDDEN', 'message', 'Bạn không có quyền ghi nhận xuất kho');
    END IF;

    -- 2. Đọc phiếu xuất
    SELECT * INTO v_issue FROM issue_documents WHERE id = p_issue_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'INVALID_STATUS', 'message', 'Không tìm thấy phiếu xuất kho');
    END IF;

    IF v_issue.status = 'POSTED' THEN
        RETURN jsonb_build_object('success', false, 'code', 'DOCUMENT_ALREADY_POSTED', 'message', 'Phiếu xuất kho đã được ghi nhận trước đó');
    END IF;

    IF v_issue.status NOT IN ('APPROVED', 'APPROVED_WAITING_STOCK') THEN
        RETURN jsonb_build_object('success', false, 'code', 'APPROVAL_REQUIRED', 'message', 'Phiếu xuất phải được phê duyệt trước khi ghi nhận');
    END IF;

    -- 3. KIỂM TRA ĐỒNG LOẠT VÀ KHÓA HÀNG TỒN (FOR UPDATE)
    FOR v_item IN SELECT * FROM issue_items WHERE issue_id = p_issue_id LOOP
        SELECT quantity, average_unit_price, total_value 
        INTO v_current_stock, v_avg_price, v_old_value
        FROM stock_balances 
        WHERE warehouse_id = v_issue.warehouse_id AND material_id = v_item.material_id
        FOR UPDATE;

        IF NOT FOUND OR v_current_stock < v_item.quantity THEN
            -- CẬP NHẬT TRẠNG THÁI PHIẾU THÀNH APPROVED_WAITING_STOCK
            UPDATE issue_documents 
            SET status = 'APPROVED_WAITING_STOCK', updated_at = NOW()
            WHERE id = p_issue_id;

            -- ROLLBACK TOÀN BỘ BẰNG CÁCH TRẢ VỀ LỖI INSUFFICIENT_STOCK
            RETURN jsonb_build_object(
                'success', false,
                'code', 'INSUFFICIENT_STOCK',
                'message', 'Không đủ tồn kho để xuất vật tư. Giao dịch đã được hủy bỏ an toàn.',
                'details', jsonb_build_object(
                    'material_id', v_item.material_id,
                    'current_quantity', COALESCE(v_current_stock, 0),
                    'requested_quantity', v_item.quantity
                )
            );
        END IF;
    END LOOP;

    -- 4. KHI TẤT CẢ VẬT TƯ ĐÃ ĐỦ TỒN: TIẾN HÀNH TRỪ TỒN NGUYÊN TỬ
    FOR v_item IN SELECT * FROM issue_items WHERE issue_id = p_issue_id LOOP
        SELECT quantity, average_unit_price, total_value 
        INTO v_current_stock, v_avg_price, v_old_value
        FROM stock_balances 
        WHERE warehouse_id = v_issue.warehouse_id AND material_id = v_item.material_id;

        v_new_qty := v_current_stock - v_item.quantity;
        v_item_total := ROUND(v_item.quantity * v_avg_price, 2);
        v_new_value := GREATEST(0, v_old_value - v_item_total);
        v_issue_total := v_issue_total + v_item_total;

        -- Cập nhật bảng chi tiết phiếu xuất với giá bình quân tại thời điểm xuất
        UPDATE issue_items 
        SET average_unit_price = v_avg_price,
            total_amount = v_item_total
        WHERE id = v_item.id;

        -- Trừ tồn kho
        UPDATE stock_balances
        SET quantity = v_new_qty,
            total_value = v_new_value,
            updated_at = NOW()
        WHERE warehouse_id = v_issue.warehouse_id AND material_id = v_item.material_id;

        -- Ghi biến động xuất kho
        INSERT INTO stock_movements (
            timestamp, user_id, warehouse_id, material_id, movement_type,
            delta_quantity, quantity_before, quantity_after, unit_price, total_amount,
            source_document_type, source_document_id, source_document_number, notes
        ) VALUES (
            NOW(), p_user_id, v_issue.warehouse_id, v_item.material_id, 'ISSUE',
            -v_item.quantity, v_current_stock, v_new_qty, v_avg_price, v_item_total,
            'ISSUE', v_issue.id, v_issue.document_number, v_item.notes
        );
    END LOOP;

    -- 5. Cập nhật phiếu xuất
    UPDATE issue_documents
    SET status = 'POSTED',
        actual_date = NOW(),
        total_amount = v_issue_total,
        posted_by_id = p_user_id,
        updated_at = NOW()
    WHERE id = p_issue_id;

    -- 6. Ghi Audit Log
    INSERT INTO audit_logs (user_id, action, table_name, record_id, after_data)
    VALUES (p_user_id, 'POST_ISSUE', 'issue_documents', p_issue_id::text, jsonb_build_object('document_number', v_issue.document_number, 'total_amount', v_issue_total));

    RETURN jsonb_build_object('success', true, 'message', 'Ghi nhận xuất kho thành công', 'total_amount', v_issue_total);
END;
$$;
