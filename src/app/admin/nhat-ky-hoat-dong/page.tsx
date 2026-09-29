'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Loader2, RefreshCw } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://fogo-store-api.onrender.com').replace(/\/$/, '');
const getToken = () => typeof window === 'undefined' ? '' : localStorage.getItem('fogo_admin_token') || localStorage.getItem('fogo_token') || localStorage.getItem('token') || '';

type AuditLog = {
  id: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  PRODUCT_VARIANT_UPDATED: 'Đã chỉnh sửa cấu hình sản phẩm',
  PRODUCT_VARIANT_QUICK_UPDATED: 'Đã cập nhật nhanh giá/tồn kho',
  ORDER_STATUS_UPDATED: 'Đã đổi trạng thái đơn hàng',
  ORDER_CREATED_STOCK_HELD: 'Đã tạo đơn và giữ kho tạm thời',
  ORDER_CREATED_STOCK_COMMITTED: 'Đã tạo đơn và trừ kho',
  CUSTOMER_CANCELLED: 'Khách đã hủy đơn và hoàn kho',
  ADMIN_CANCELLED: 'Admin đã hủy đơn và hoàn kho',
  PAYMENT_EXPIRED: 'Thanh toán hết hạn, đã hoàn kho',
  ORDER_DELETED: 'Đã xóa đơn hàng',
};

const describeChanges = (log: AuditLog) => {
  const keys = Array.from(new Set([...Object.keys(log.before || {}), ...Object.keys(log.after || {})]));
  return keys
    .filter((key) => JSON.stringify(log.before?.[key]) !== JSON.stringify(log.after?.[key]))
    .map((key) => `${key}: ${String(log.before?.[key] ?? '—')} → ${String(log.after?.[key] ?? '—')}`)
    .join(' · ');
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/audit-logs?limit=200`, { headers: { Authorization: `Bearer ${getToken()}` }, cache: 'no-store' });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.success) throw new Error(json?.error || 'Không thể tải nhật ký hoạt động');
      setLogs(Array.isArray(json.data) ? json.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải nhật ký hoạt động');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadLogs(); });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visibleLogs = useMemo(() => filter === 'ALL' ? logs : logs.filter((log) => log.entityType === filter), [logs, filter]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><Activity size={30} /><div><h1 className="text-2xl font-black uppercase">Nhật ký hoạt động</h1><p className="mt-1 text-sm text-white/70">Theo dõi thay đổi giá, tồn kho và trạng thái đơn hàng.</p></div></div>
          <button type="button" onClick={loadLogs} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold hover:bg-white/25 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới</button>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border bg-white p-3 shadow-sm">
          {[['ALL', 'Tất cả'], ['ORDER', 'Đơn hàng'], ['PRODUCT_VARIANT', 'Giá & tồn kho']].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-4 py-2 text-xs font-black ${filter === value ? 'bg-[#d70018] text-white' : 'bg-gray-100 text-gray-600'}`}>{label}</button>)}
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#d70018]">{error}</div>}
        {loading ? <div className="flex items-center justify-center p-16 text-sm font-bold text-gray-500"><Loader2 className="mr-2 animate-spin" /> Đang tải nhật ký...</div> : (
          <div className="space-y-2">
            {visibleLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-black text-gray-900">{ACTION_LABELS[log.action] || log.action}</p><p className="mt-1 text-xs text-gray-500">{log.actorEmail || (log.action === 'PAYMENT_EXPIRED' ? 'Hệ thống tự động' : 'Khách hàng')} {log.actorRole ? `· ${log.actorRole}` : ''} {log.ip ? `· IP ${log.ip}` : ''}</p></div><time className="shrink-0 text-xs font-semibold text-gray-400">{new Date(log.createdAt).toLocaleString('vi-VN')}</time></div>
                {describeChanges(log) && <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[11px] leading-5 text-gray-600">{describeChanges(log)}</p>}
                {(log.metadata?.orderCode || log.entityId) && <p className="mt-2 text-[10px] text-gray-400">{log.metadata?.orderCode ? `Mã đơn: ${String(log.metadata.orderCode)} · ` : ''}ID: {log.entityId}</p>}
              </div>
            ))}
            {visibleLogs.length === 0 && <div className="rounded-xl border bg-white p-12 text-center text-sm text-gray-400">Chưa có hoạt động nào được ghi nhận.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
