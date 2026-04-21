import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/adminAPI';
import { useToast } from '@/shared/contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'COMPLETED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
  { value: 'ALL', label: 'Tất cả' },
];

const STATUS_CLASS = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
};

const REFUND_QUERY_KEY = ['admin', 'refund-requests'];

function formatVnd(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

export default function AdminRefundRequestsPage() {
  const [status, setStatus] = useState('PENDING');
  const [note, setNote] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...REFUND_QUERY_KEY, status],
    queryFn: async () => {
      const res = await adminAPI.getRefundRequests({ status, page: 1, limit: 30 });
      return res?.data?.data;
    },
    staleTime: 15 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, payload }) => adminAPI.approveRefundRequest(id, payload),
    onSuccess: () => {
      toast.success('Đã duyệt yêu cầu hoàn tiền.');
      setNote('');
      setActiveRequestId(null);
      queryClient.invalidateQueries({ queryKey: REFUND_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Duyệt yêu cầu thất bại.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, payload }) => adminAPI.rejectRefundRequest(id, payload),
    onSuccess: () => {
      toast.success('Đã từ chối yêu cầu hoàn tiền.');
      setNote('');
      setActiveRequestId(null);
      queryClient.invalidateQueries({ queryKey: REFUND_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Từ chối yêu cầu thất bại.');
    },
  });

  const items = useMemo(() => data?.items || [], [data]);

  const handleApprove = (id) => {
    approveMutation.mutate({ id, payload: { note } });
  };

  const handleReject = (id) => {
    rejectMutation.mutate({ id, payload: { note } });
  };

  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Xử lý yêu cầu hoàn tiền</h1>
            <p className="mt-1 text-sm text-slate-500">
              Admin duyệt hoặc từ chối yêu cầu hoàn tiền. Khi duyệt, ví user nhận lại 98% và 2% chuyển vào quỹ duy trì hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  status === option.value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Đang tải yêu cầu hoàn tiền...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-slate-400">Không có yêu cầu hoàn tiền phù hợp.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isPending = item.status === 'PENDING';
              const statusClass = STATUS_CLASS[item.status] || 'bg-slate-50 text-slate-600 border-slate-100';
              const isCurrent = activeRequestId === item.id;

              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${statusClass}`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-slate-500">Request #{String(item.id).slice(-8).toUpperCase()}</span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900">{item.project?.title || 'Dự án không xác định'}</h3>

                      <div className="text-sm text-slate-600">
                        <p>Người gửi: <b>{item.donor?.fullName || 'Không xác định'}</b> ({item.donor?.email || '---'})</p>
                        <p>Giao dịch gốc: <b>{String(item.sourceTransactionId || '').slice(-8).toUpperCase() || '---'}</b></p>
                        <p>Lý do: <b>{item.reason || 'Không có'}</b></p>
                        <p className="text-xs text-slate-500">
                          Gửi {formatDistanceToNow(new Date(item.requestedAt), { addSuffix: true, locale: vi })}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-[210px] rounded-xl bg-white p-3 border border-slate-200 text-sm">
                      <p className="flex items-center justify-between">
                        <span className="text-slate-500">Tiền donate gốc:</span>
                        <b className="text-slate-900">{formatVnd(item.originalAmount)}</b>
                      </p>
                      <p className="mt-1 flex items-center justify-between">
                        <span className="text-slate-500">Hoàn user:</span>
                        <b className="text-emerald-700">{formatVnd(item.refundAmount)}</b>
                      </p>
                      <p className="mt-1 flex items-center justify-between">
                        <span className="text-slate-500">Phí hệ thống 2%:</span>
                        <b className="text-rose-600">{formatVnd(item.retainedFee)}</b>
                      </p>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Ghi chú admin (tùy chọn)
                      </label>
                      <textarea
                        rows={2}
                        value={isCurrent ? note : ''}
                        onFocus={() => {
                          setActiveRequestId(item.id);
                          setNote('');
                        }}
                        onChange={(e) => {
                          setActiveRequestId(item.id);
                          setNote(e.target.value);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                        placeholder="Nhập ghi chú nếu cần..."
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleApprove(item.id)}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Duyệt hoàn tiền
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleReject(item.id)}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {isFetching ? <p className="pt-4 text-xs text-slate-400">Đang đồng bộ dữ liệu...</p> : null}
      </div>
    </div>
  );
}
