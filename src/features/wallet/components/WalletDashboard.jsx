import { useMyWallet, useWalletHistory } from '../hooks/useWalletQueries';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { ArrowDownLeft, ArrowUpRight, Wallet, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function WalletDashboard() {
    const { data: wallet, isLoading: isLoadingWallet, isError: isWalletError } = useMyWallet();
    const { data: historyData, isLoading: isLoadingHistory } = useWalletHistory();

    const history = historyData?.pages.flatMap((page) => page.history) || [];

    if (isLoadingWallet) return <PageLoader />;
    if (isWalletError) return (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="font-semibold">Không thể tải dữ liệu ví lúc này.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Wallet Balance Card */}
            <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#FBBF24_0%,#F59E0B_100%)] p-8 text-white shadow-lg">

                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        <Wallet size={14} /> Số dư khả dụng
                    </div>
                    <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
                        {(wallet?.balance || 0).toLocaleString('vi-VN')} đ
                    </h2>
                    <p className="mt-2 text-sm font-medium text-amber-50 opacity-90">
                        Hệ thống tự động khởi tạo Ví cho bạn.
                    </p>
                </div>
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-black/5 blur-xl" />
            </div>

            {/* Transaction History */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-5">
                    <Clock className="text-slate-400" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Lịch sử giao dịch</h3>
                </div>

                <div className="p-2">
                    {isLoadingHistory ? (
                        <div className="py-10 text-center text-slate-400">Đang tải sao kê...</div>
                    ) : history.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 font-medium">Chưa có giao dịch nào.</div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {history.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tx.direction === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                            {tx.direction === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {tx.type === 'WALLET_WITHDRAWAL' ? 'Rút tiền' :
                                                 tx.type === 'USER_REFUND_REQUEST' ? 'Hoàn tiền ủng hộ' :
                                                 tx.type === 'DONATION_FROM_WALLET' ? 'Ủng hộ dự án từ Ví' :
                                                 tx.type === 'WALLET_DEPOSIT' ? 'Nạp tiền vào ví' :
                                                 tx.type === 'DONATION' ? 'Ủng hộ dự án' : tx.type}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm')}
                                            </p>
                                            {tx.metadata?.bankName && (
                                                <p className="text-xs text-slate-400 mt-0.5">Về thẻ: {tx.metadata.bankName}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-base font-bold ${tx.direction === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.direction === 'IN' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                                        </p>
                                        <p className="text-xs font-medium uppercase text-slate-400">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            
        </div>
    );
}