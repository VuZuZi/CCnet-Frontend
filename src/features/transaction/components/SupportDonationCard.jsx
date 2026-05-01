import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import clsx from "clsx";
import {
  HeartHandshake,
  Info,
  Landmark,
  Loader2,
  QrCode,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { transactionAPI } from "../api/transaction.api";
import { useToast } from "@/shared/contexts/ToastContext";
import { getErrorMessage } from "@/shared/lib/httpClient";

const SUGGESTED_AMOUNTS = [30000, 50000, 100000, 200000];

const formatVnd = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export function SupportDonationCard({
  title = "Ủng hộ duy trì CCNet",
  description = "Cùng chung tay giữ CCNet hoạt động ổn định và minh bạch nhé.",
  supportBalance = 0,
  showBalance = true,
  compact = false,
  className = "",
}) {
  const toast = useToast();
  const [amount, setAmount] = useState(50000);
  const [displayAmount, setDisplayAmount] = useState("50.000");
  const [message, setMessage] = useState("");
  const [qrPayload, setQrPayload] = useState(null);

  const qrSize = compact ? 168 : 210;

  const mutation = useMutation({
    mutationFn: transactionAPI.createSupportDonation,
    onSuccess: (response) => {
      setQrPayload(response?.data || response);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error) || "Không thể tạo QR ủng hộ lúc này.",
      );
    },
  });

  const normalizedPayload = useMemo(
    () => qrPayload?.data || qrPayload || null,
    [qrPayload],
  );

  const handleAmountChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, "");

    if (!rawValue) {
      setAmount(0);
      setDisplayAmount("");
      return;
    }

    const nextAmount = Number.parseInt(rawValue, 10);
    setAmount(nextAmount);
    setDisplayAmount(nextAmount.toLocaleString("vi-VN"));
  };

  const handleGenerateQr = () => {
    if (amount < 2000) {
      toast.info("Mức ủng hộ tối thiểu là 2.000đ.");
      return;
    }

    mutation.mutate({
      amount,
      message: message.trim() || undefined,
    });
  };

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[30px] border border-amber-100 bg-[linear-gradient(135deg,#fff9ec_0%,#ffffff_34%,#f6fbff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <div
        className={clsx(
          "grid gap-0",
          compact ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[1.05fr_0.95fr]",
        )}
      >
        <div className={clsx("space-y-6 p-6 sm:p-8", compact ? "lg:p-8" : "lg:p-10")}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
              <HeartHandshake size={14} />
              Quỹ duy trì web
            </span>
            {showBalance ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-500">
                <Landmark size={13} />
                Đã ghi nhận: {formatVnd(supportBalance)}
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Số tiền ủng hộ
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="Nhập số tiền"
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-2xl font-black tracking-tight text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
              />
            </label>

            <button
              type="button"
              onClick={handleGenerateQr}
              disabled={mutation.isPending || amount < 2000}
              className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <QrCode size={18} />
              )}
              {mutation.isPending ? "Đang tạo QR..." : "Tạo mã QR"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SUGGESTED_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAmount(value);
                  setDisplayAmount(value.toLocaleString("vi-VN"));
                }}
                className={clsx(
                  "rounded-xl border px-3 py-2 text-sm font-bold transition",
                  amount === value
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                )}
              >
                {formatVnd(value)}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              Lời nhắn tùy chọn
            </span>
            <textarea
              rows={compact ? 3 : 4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ví dụ: tiếp tục giữ CCNet minh bạch và ổn định nhé."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
            />
          </label>

          
        </div>

        <div className="border-t border-amber-100/80 bg-white/80 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            {normalizedPayload?.qrCode ? (
              <>
                <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    value={normalizedPayload.qrCode}
                    size={qrSize}
                    includeMargin={false}
                    level="M"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-black text-slate-900">
                    Quét mã để ủng hộ {formatVnd(amount)}
                  </p>
                  <p className="text-sm leading-6 text-slate-500">
                    Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống ghi
                    nhận đúng vào quỹ duy trì web.
                  </p>
                </div>

                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Nội dung chuyển khoản
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-slate-900">
                    {normalizedPayload.transferMemo}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateQr}
                  disabled={mutation.isPending || amount < 2000}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCcw size={16} />
                  Tạo lại QR
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <QrCode size={28} />
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  Tạo QR ủng hộ trong vài giây
                </h4>
                <p className="mx-auto max-w-sm text-sm leading-7 text-slate-500">
                  Chọn mức ủng hộ, bấm tạo QR và quét bằng app ngân hàng. Dòng
                  tiền này được theo dõi tách biệt với quỹ của từng project.
                </p>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-left text-sm text-amber-900">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    <p className="leading-6">
                      QR dùng cùng tài khoản nhận tiền của hệ thống hiện tại,
                      nhưng giao dịch được gắn nhãn riêng cho quỹ duy trì web.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportDonationCard;
