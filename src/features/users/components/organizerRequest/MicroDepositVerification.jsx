import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, ArrowRight } from "lucide-react";
import { useToast } from "@/shared/contexts/ToastContext";
import { organizerRequestAPI, getErrorMessage } from "../../api/organizerRequestAPI";
import { queryKeys } from "@/shared/constants/queryKeys";

export function MicroDepositVerification({ request }) {
    const [amount, setAmount] = useState("");
    const toast = useToast();
    const queryClient = useQueryClient();

    const verifyMutation = useMutation({
        mutationFn: (amountNum) => organizerRequestAPI.verifyDeposit(request._id, { amount: amountNum }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.organizerRequests.me() });
            toast.success("Xác thực ngân hàng thành công!");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = Number(amount);
        if (!num || num < 1000 || num > 5000) {
            toast.error("Vui lòng nhập số tiền từ 1.000 VNĐ đến 5.000 VNĐ");
            return;
        }
        verifyMutation.mutate(num);
    };

    const maskedAccount = request?.bankAccountNumber?.replace(/.(?=.{4})/g, '*') || '****';

    return (
        <div className="mx-auto max-w-lg mt-10">
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-8 shadow-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Building size={28} />
                </div>

                <h2 className="text-center text-2xl font-bold text-slate-900">Xác thực ngân hàng</h2>
                <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                    Chúng tôi đã chuyển một khoản tiền nhỏ (từ 1.000 VNĐ - 5.000 VNĐ) vào tài khoản <strong className="text-slate-800">{request?.bankName}</strong> số <strong className="text-slate-800">{maskedAccount}</strong> của bạn.
                </p>

                <form onSubmit={handleSubmit} className="mt-8">
                    <label className="block text-center text-sm font-medium text-slate-700 mb-2">
                        Nhập số tiền bạn nhận được (VNĐ)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ví dụ: 1250"
                        className="w-full text-center text-2xl tracking-wider rounded-2xl border-2 border-amber-200 bg-white px-4 py-4 font-bold text-slate-900 outline-none transition focus:border-amber-400"
                        disabled={verifyMutation.isPending}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={verifyMutation.isPending || !amount}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-4 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
                    >
                        {verifyMutation.isPending ? "Đang xác thực..." : "Xác nhận số tiền"}
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MicroDepositVerification;