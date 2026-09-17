import React, { useState, useEffect, useCallback } from 'react';
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
import { api } from './api';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { MaterialsView } from './components/MaterialsView';
import { ReceiptsView } from './components/ReceiptsView';
import { IssuesView } from './components/IssuesView';
import { StockBalancesView } from './components/StockBalancesView';
import { InventoryCountView } from './components/InventoryCountView';
import { MovementsLedgerView } from './components/MovementsLedgerView';
import { ReportsView } from './components/ReportsView';
import { SwitchUserModal } from './components/SwitchUserModal';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { ErrorAlertModal } from './components/ErrorAlertModal';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('stock');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Entities state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [systems, setSystems] = useState<MaterialSystem[]>([]);
  const [groups, setGroups] = useState<MaterialGroup[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stockBalances, setStockBalances] = useState<StockBalance[]>([]);
  const [receipts, setReceipts] = useState<ReceiptDocument[]>([]);
  const [issues, setIssues] = useState<IssueDocument[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals state
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [businessError, setBusinessError] = useState<BusinessError | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cross-view jump filter
  const [filterMaterialIdForMovements, setFilterMaterialIdForMovements] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch all data
  const refreshData = useCallback(async () => {
    try {
      const [
        meData,
        usersData,
        whData,
        sysData,
        grpData,
        unitData,
        matData,
        balData,
        recData,
        issData,
        cntData,
        movData
      ] = await Promise.all([
        api.getMe(),
        api.getUsers(),
        api.getWarehouses(),
        api.getSystems(),
        api.getGroups(),
        api.getUnits(),
        api.getMaterials(),
        api.getStockBalances({ warehouse_id: selectedWarehouse !== 'all' ? selectedWarehouse : undefined }),
        api.getReceipts({ warehouse_id: selectedWarehouse !== 'all' ? selectedWarehouse : undefined }),
        api.getIssues({ warehouse_id: selectedWarehouse !== 'all' ? selectedWarehouse : undefined }),
        api.getInventoryCounts({ warehouse_id: selectedWarehouse !== 'all' ? selectedWarehouse : undefined }),
        api.getStockMovements({ warehouse_id: selectedWarehouse !== 'all' ? selectedWarehouse : undefined })
      ]);

      setCurrentUser(meData);
      setUsers(usersData);
      setWarehouses(whData);
      setSystems(sysData);
      setGroups(grpData);
      setUnits(unitData);
      setMaterials(matData);
      setStockBalances(balData);
      setReceipts(recData);
      setIssues(issData);
      setInventoryCounts(cntData);
      setMovements(movData);

      if (meData.role === 'admin') {
        try {
          const logs = await api.getAuditLogs();
          setAuditLogs(logs);
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.error('Lỗi nạp dữ liệu:', err);
      setBusinessError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouse]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auth switch
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);
      showToast(`Đã chuyển sang phiên làm việc: ${res.user.full_name} (${res.user.role})`);
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  // Materials actions
  const handleCreateMaterial = async (payload: Partial<Material>) => {
    try {
      await api.createMaterial(payload);
      showToast('Đã thêm vật tư mới vào danh mục thành công');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleUpdateMaterial = async (id: string, payload: Partial<Material>) => {
    try {
      await api.updateMaterial(id, payload);
      showToast('Đã cập nhật thông tin vật tư thành công');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleToggleMaterialStatus = async (id: string) => {
    try {
      await api.toggleMaterialStatus(id);
      showToast('Đã chuyển trạng thái vật tư thành công');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  // Receipts actions
  const handleCreateReceipt = async (payload: any) => {
    try {
      await api.createReceipt(payload);
      showToast('Đã lập phiếu đề nghị nhập kho thành công (Bản nháp)');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleSubmitReceipt = async (id: string) => {
    try {
      await api.submitReceipt(id);
      showToast('Đã gửi phiếu nhập kho lên cấp có thẩm quyền phê duyệt');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleApproveReceipt = async (id: string) => {
    try {
      await api.approveReceipt(id);
      showToast('Đã phê duyệt phiếu nhập kho');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleRejectReceipt = async (id: string, reason: string) => {
    try {
      await api.rejectReceipt(id, reason);
      showToast('Đã từ chối phiếu nhập kho');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handlePostReceipt = async (id: string) => {
    try {
      await api.postReceipt(id);
      showToast('Ghi nhận nhập kho thành công: Đã tăng số dư tồn kho và tính đơn giá bình quân gia quyền!');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  // Issues actions
  const handleCreateIssue = async (payload: any) => {
    try {
      await api.createIssue(payload);
      showToast('Đã lập phiếu yêu cầu xuất kho thành công (Bản nháp)');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleSubmitIssue = async (id: string) => {
    try {
      await api.submitIssue(id);
      showToast('Đã gửi phiếu xuất kho lên cấp có thẩm quyền phê duyệt');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleApproveIssue = async (id: string) => {
    try {
      await api.approveIssue(id);
      showToast('Đã phê duyệt phiếu xuất kho');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleRejectIssue = async (id: string, reason: string) => {
    try {
      await api.rejectIssue(id, reason);
      showToast('Đã từ chối phiếu xuất kho');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handlePostIssue = async (id: string) => {
    try {
      await api.postIssue(id);
      showToast('Ghi nhận xuất kho thành công: Đã trừ số dư tồn kho an toàn!');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
      await refreshData(); // refresh to update 'approved_insufficient_stock' state if blocked
    }
  };

  // Inventory Count actions
  const handleCreateCount = async (payload: any) => {
    try {
      await api.createInventoryCount(payload);
      showToast('Đã lập biên bản kiểm kê kho thành công');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleSubmitCount = async (id: string) => {
    try {
      await api.submitInventoryCount(id);
      showToast('Đã chốt kết quả kiểm đếm và gửi phê duyệt');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handleApproveCount = async (id: string) => {
    try {
      await api.approveInventoryCount(id);
      showToast('Admin đã phê duyệt kết quả kiểm kê');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  const handlePostAdjustment = async (id: string, payload: { adjustment_reason: string; adjustment_document_ref: string }) => {
    try {
      await api.postInventoryAdjustment(id, payload);
      showToast('Đã ghi nhận điều chỉnh tồn kho theo kết quả kiểm kê thành công!');
      await refreshData();
    } catch (err: any) {
      setBusinessError(err);
    }
  };

  // Quick jump to movement ledger for a material
  const handleViewMovementsForMaterial = (materialId: string) => {
    setFilterMaterialIdForMovements(materialId);
    setCurrentTab('movements');
  };

  // Badge counters
  const pendingApprovalsCount = receipts.filter(r => r.status === 'pending_approval').length +
    issues.filter(i => i.status === 'pending_approval').length;
  const lowStockCount = stockBalances.filter(b => b.stock_status === 'low' || b.stock_status === 'out').length;
  const waitingStockCount = issues.filter(i => i.status === 'approved_insufficient_stock').length;

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide">Đang khởi tạo hệ thống quản lý kho Thủy điện Sơn Trà 1...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse}
        onSelectWarehouse={setSelectedWarehouse}
        onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileOpen(prev => !prev)}
      />

      {/* Main Body with Sidebar and View Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingApprovalsCount={pendingApprovalsCount}
          lowStockCount={lowStockCount}
          waitingStockCount={waitingStockCount}
          warehouses={warehouses}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={setSelectedWarehouse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentTab === 'materials' && (
            <MaterialsView
              materials={materials}
              groups={groups}
              systems={systems}
              units={units}
              warehouses={warehouses}
              currentUser={currentUser}
              onCreateMaterial={handleCreateMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onToggleStatus={handleToggleMaterialStatus}
            />
          )}

          {currentTab === 'receipts' && (
            <ReceiptsView
              receipts={receipts}
              materials={materials}
              warehouses={warehouses}
              currentUser={currentUser}
              onCreateReceipt={handleCreateReceipt}
              onSubmitReceipt={handleSubmitReceipt}
              onApproveReceipt={handleApproveReceipt}
              onRejectReceipt={handleRejectReceipt}
              onPostReceipt={handlePostReceipt}
            />
          )}

          {currentTab === 'issues' && (
            <IssuesView
              issues={issues}
              materials={materials}
              warehouses={warehouses}
              stockBalances={stockBalances}
              currentUser={currentUser}
              onCreateIssue={handleCreateIssue}
              onSubmitIssue={handleSubmitIssue}
              onApproveIssue={handleApproveIssue}
              onRejectIssue={handleRejectIssue}
              onPostIssue={handlePostIssue}
            />
          )}

          {currentTab === 'stock' && (
            <StockBalancesView
              balances={stockBalances}
              warehouses={warehouses}
              selectedWarehouse={selectedWarehouse}
              onSelectWarehouse={setSelectedWarehouse}
              onViewMovementsForMaterial={handleViewMovementsForMaterial}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryCountView
              counts={inventoryCounts}
              materials={materials}
              warehouses={warehouses}
              stockBalances={stockBalances}
              currentUser={currentUser}
              onCreateCount={handleCreateCount}
              onSubmitCount={handleSubmitCount}
              onApproveCount={handleApproveCount}
              onPostAdjustment={handlePostAdjustment}
            />
          )}

          {currentTab === 'movements' && (
            <MovementsLedgerView
              movements={movements}
              warehouses={warehouses}
              materials={materials}
              selectedWarehouse={selectedWarehouse}
              onSelectWarehouse={setSelectedWarehouse}
              filterMaterialId={filterMaterialIdForMovements}
              onClearMaterialFilter={() => setFilterMaterialIdForMovements(null)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              balances={stockBalances}
              receipts={receipts}
              issues={issues}
              movements={movements}
              warehouses={warehouses}
              materials={materials}
              groups={groups}
              systems={systems}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-slideUp text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <SwitchUserModal
        isOpen={isSwitchUserOpen}
        onClose={() => setIsSwitchUserOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSwitchUser}
      />

      <SupabaseSqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      <ErrorAlertModal
        error={businessError}
        onClose={() => setBusinessError(null)}
      />
    </div>
  );
}
