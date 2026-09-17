import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Error response helper
  const handleError = (res: Response, err: any) => {
    console.error('API Error:', err);
    if (err && err.code) {
      return res.status(400).json({
        code: err.code,
        message: err.message || 'Lỗi xử lý nghiệp vụ',
        details: err.details
      });
    }
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: err?.message || 'Lỗi máy chủ nội bộ'
    });
  };

  // -------------------------------------------------------------
  // AUTH & USER ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json(db.currentUser);
  });

  app.get('/api/auth/users', (req: Request, res: Response) => {
    res.json(db.users);
  });

  app.post('/api/auth/switch-user', (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ code: 'UNAUTHENTICATED', message: 'Không tìm thấy người dùng' });
    }
    db.currentUser = user;
    db.logAudit(user.id, 'SWITCH_USER_SESSION', 'profiles', user.id, undefined, { role: user.role });
    res.json({ success: true, user: db.currentUser });
  });

  // -------------------------------------------------------------
  // METADATA ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/warehouses', (req: Request, res: Response) => {
    res.json(db.warehouses);
  });

  app.get('/api/material-systems', (req: Request, res: Response) => {
    res.json(db.systems);
  });

  app.get('/api/material-groups', (req: Request, res: Response) => {
    res.json(db.groups);
  });

  app.get('/api/units', (req: Request, res: Response) => {
    res.json(db.units);
  });

  // -------------------------------------------------------------
  // MATERIALS (DANH MỤC VẬT TƯ)
  // -------------------------------------------------------------
  app.get('/api/materials', (req: Request, res: Response) => {
    const { search, group_id, system_id, is_active } = req.query;
    let list = db.materials;

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
    }
    if (group_id && group_id !== 'all') {
      list = list.filter(m => m.group_id === group_id);
    }
    if (system_id && system_id !== 'all') {
      list = list.filter(m => m.system_id === system_id);
    }
    if (is_active !== undefined) {
      list = list.filter(m => String(m.is_active) === String(is_active));
    }

    res.json(list);
  });

  app.post('/api/materials', (req: Request, res: Response) => {
    try {
      const created = db.createMaterial(db.currentUser.id, req.body);
      res.status(201).json(created);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.put('/api/materials/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateMaterial(db.currentUser.id, req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/materials/:id/toggle-status', (req: Request, res: Response) => {
    try {
      const updated = db.deactivateMaterial(db.currentUser.id, req.params.id);
      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  // -------------------------------------------------------------
  // STOCK BALANCES (TỒN KHO)
  // -------------------------------------------------------------
  app.get('/api/stock-balances', (req: Request, res: Response) => {
    const { warehouse_id, status, search } = req.query;
    let balances = db.stockBalances;

    if (warehouse_id && warehouse_id !== 'all') {
      balances = balances.filter(b => b.warehouse_id === warehouse_id);
    }
    if (status && status !== 'all') {
      balances = balances.filter(b => b.stock_status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      balances = balances.filter(b =>
        (b.material_name || '').toLowerCase().includes(q) ||
        (b.material_code || '').toLowerCase().includes(q)
      );
    }

    res.json(balances);
  });

  // -------------------------------------------------------------
  // RECEIPTS (NHẬP KHO)
  // -------------------------------------------------------------
  app.get('/api/receipts', (req: Request, res: Response) => {
    const { warehouse_id, status } = req.query;
    let list = db.receipts;

    if (warehouse_id && warehouse_id !== 'all') {
      list = list.filter(r => r.warehouse_id === warehouse_id);
    }
    if (status && status !== 'all') {
      list = list.filter(r => r.status === status);
    }

    // Role-based filtering: internal user sees only their own documents
    if (db.currentUser.role === 'internal_user') {
      list = list.filter(r => r.creator_id === db.currentUser.id);
    }

    res.json(list);
  });

  app.post('/api/receipts', (req: Request, res: Response) => {
    try {
      const receipt = db.createReceipt(db.currentUser.id, req.body);
      res.status(201).json(receipt);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/receipts/:id/submit', (req: Request, res: Response) => {
    try {
      const receipt = db.submitReceipt(db.currentUser.id, req.params.id);
      res.json(receipt);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/receipts/:id/approve', (req: Request, res: Response) => {
    try {
      const receipt = db.approveReceipt(db.currentUser.id, req.params.id);
      res.json(receipt);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/receipts/:id/reject', (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const receipt = db.rejectReceipt(db.currentUser.id, req.params.id, reason);
      res.json(receipt);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/receipts/:id/post', async (req: Request, res: Response) => {
    try {
      const receipt = await db.postReceipt(db.currentUser.id, req.params.id);
      res.json(receipt);
    } catch (err) {
      handleError(res, err);
    }
  });

  // -------------------------------------------------------------
  // ISSUES (XUẤT KHO)
  // -------------------------------------------------------------
  app.get('/api/issues', (req: Request, res: Response) => {
    const { warehouse_id, status } = req.query;
    let list = db.issues;

    if (warehouse_id && warehouse_id !== 'all') {
      list = list.filter(i => i.warehouse_id === warehouse_id);
    }
    if (status && status !== 'all') {
      list = list.filter(i => i.status === status);
    }

    // Internal user sees only their own documents
    if (db.currentUser.role === 'internal_user') {
      list = list.filter(i => i.creator_id === db.currentUser.id);
    }

    res.json(list);
  });

  app.post('/api/issues', (req: Request, res: Response) => {
    try {
      const issue = db.createIssue(db.currentUser.id, req.body);
      res.status(201).json(issue);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/issues/:id/submit', (req: Request, res: Response) => {
    try {
      const issue = db.submitIssue(db.currentUser.id, req.params.id);
      res.json(issue);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/issues/:id/approve', (req: Request, res: Response) => {
    try {
      const issue = db.approveIssue(db.currentUser.id, req.params.id);
      res.json(issue);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/issues/:id/reject', (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const issue = db.rejectIssue(db.currentUser.id, req.params.id, reason);
      res.json(issue);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/issues/:id/post', async (req: Request, res: Response) => {
    try {
      const issue = await db.postIssue(db.currentUser.id, req.params.id);
      res.json(issue);
    } catch (err) {
      handleError(res, err);
    }
  });

  // -------------------------------------------------------------
  // INVENTORY COUNTS (KIỂM KÊ)
  // -------------------------------------------------------------
  app.get('/api/inventory-counts', (req: Request, res: Response) => {
    const { warehouse_id } = req.query;
    let list = db.inventoryCounts;
    if (warehouse_id && warehouse_id !== 'all') {
      list = list.filter(c => c.warehouse_id === warehouse_id);
    }
    res.json(list);
  });

  app.post('/api/inventory-counts', (req: Request, res: Response) => {
    try {
      const count = db.createInventoryCount(db.currentUser.id, req.body);
      res.status(201).json(count);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/inventory-counts/:id/submit', (req: Request, res: Response) => {
    try {
      const count = db.submitInventoryCount(db.currentUser.id, req.params.id);
      res.json(count);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/inventory-counts/:id/approve', (req: Request, res: Response) => {
    try {
      const count = db.approveInventoryCount(db.currentUser.id, req.params.id);
      res.json(count);
    } catch (err) {
      handleError(res, err);
    }
  });

  app.post('/api/inventory-counts/:id/adjust', async (req: Request, res: Response) => {
    try {
      const count = await db.postInventoryAdjustment(db.currentUser.id, {
        count_id: req.params.id,
        adjustment_reason: req.body.adjustment_reason,
        adjustment_document_ref: req.body.adjustment_document_ref
      });
      res.json(count);
    } catch (err) {
      handleError(res, err);
    }
  });

  // -------------------------------------------------------------
  // STOCK MOVEMENTS (LỊCH SỬ NHẬP XUẤT)
  // -------------------------------------------------------------
  app.get('/api/stock-movements', (req: Request, res: Response) => {
    const { warehouse_id, movement_type, material_id } = req.query;
    let list = db.movements;

    if (warehouse_id && warehouse_id !== 'all') {
      list = list.filter(m => m.warehouse_id === warehouse_id);
    }
    if (movement_type && movement_type !== 'all') {
      list = list.filter(m => m.movement_type === movement_type);
    }
    if (material_id && material_id !== 'all') {
      list = list.filter(m => m.material_id === material_id);
    }

    res.json(list);
  });

  // -------------------------------------------------------------
  // REPORTS & AUDIT LOGS
  // -------------------------------------------------------------
  app.get('/api/reports/summary', (req: Request, res: Response) => {
    const { warehouse_id } = req.query;
    res.json(db.getReportSummary(String(warehouse_id || 'all')));
  });

  app.get('/api/audit-logs', (req: Request, res: Response) => {
    if (db.currentUser.role !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Chỉ Quản trị viên mới có quyền xem audit log' });
    }
    res.json(db.auditLogs);
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Quản lý Kho Sơn Trà 1 running on http://localhost:${PORT}`);
  });
}

startServer();
