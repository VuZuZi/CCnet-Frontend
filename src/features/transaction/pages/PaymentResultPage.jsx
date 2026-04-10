import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');

    const isSuccess = status === 'success' && cancel !== 'true';

    useEffect(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#FFFDF8_0%,#FFF8E6_100%)] p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-in zoom-in-95 duration-500">

                {isSuccess ? (
                    <>
                        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Thanh toán thành công!</h1>
                        <p className="text-slate-500 mb-8">
                            Cảm ơn bạn đã đóng góp. Số tiền của bạn đã được ghi nhận vào quỹ dự án an toàn trong hệ thống Escrow.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/profile"
                                className="w-full inline-flex justify-center items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3.5 rounded-2xl transition-colors"
                            >
                                Xem lịch sử quyên góp <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/projects"
                                className="w-full inline-flex justify-center items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-colors"
                            >
                                Khám phá dự án khác
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mx-auto w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-10 h-10 text-rose-600" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Giao dịch bị hủy</h1>
                        <p className="text-slate-500 mb-8">
                            Quá trình thanh toán đã bị hủy hoặc gặp lỗi. Đừng lo lắng, tiền của bạn chưa bị trừ.
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-colors"
                        >
                            Quay lại thử lại
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}