import { ArrowRight } from "lucide-react";
import { useVietnamBanks } from "../../hooks/useVietnamBanks";
import OrganizerRequestPersonalSection from "./OrganizerRequestPersonalSection";
import OrganizerRequestOrganizationSection from "./OrganizerRequestOrganizationSection";
import OrganizerRequestIdentitySection from "./OrganizerRequestIdentitySection";
import OrganizerRequestBankSection from "./OrganizerRequestBankSection";

export function OrganizerRequestForm({
  form,
  onSubmit,
  onDocumentChange,
  isSubmitting = false,
  isResubmitting = false,
}) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { banks, isLoading: isBanksLoading } = useVietnamBanks();

  const idCardFront = watch("idCardFront");
  const idCardBack = watch("idCardBack");
  const selfie = watch("selfie");
  const businessLicense = watch("businessLicense");
  const bankProof = watch("bankProof");

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Đăng ký trở thành tổ chức
        </h1>
        <p className="mt-3 text-sm text-slate-500 md:text-base">
          Gửi hồ sơ xác minh để tạo và quản lý các dự án thiện nguyện.
        </p>
      </div>

      <OrganizerRequestPersonalSection
        register={register}
        control={control}
        errors={errors}
      />

      <OrganizerRequestOrganizationSection
        register={register}
        errors={errors}
      />

      <OrganizerRequestIdentitySection
        values={{
          idCardFront,
          idCardBack,
          selfie,
          businessLicense,
        }}
        errors={errors}
        onDocumentChange={onDocumentChange}
      />

      <OrganizerRequestBankSection
        control={control}
        register={register}
        setValue={setValue}
        errors={errors}
        bankProof={bankProof}
        banks={banks}
        isBanksLoading={isBanksLoading}
        onDocumentChange={onDocumentChange}
      />

      <div className="mt-6 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <ArrowRight size={16} />
          {isSubmitting
            ? "Đang gửi..."
            : isResubmitting
              ? "Gửi lại hồ sơ"
              : "Gửi hồ sơ"}
        </button>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
        Hồ sơ của bạn sẽ được quản lý CCNet xem xét. Quá trình phê duyệt có thể
        mất từ 1 đến 3 ngày làm việc.
      </div>
    </form>
  );
}

export default OrganizerRequestForm;