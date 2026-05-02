import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSignature,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useVietnamBanks } from "../../hooks/useVietnamBanks";
import OrganizerRequestPersonalSection from "./OrganizerRequestPersonalSection";
import OrganizerRequestOrganizationSection from "./OrganizerRequestOrganizationSection";
import OrganizerRequestBankSection from "./OrganizerRequestBankSection";
import OrganizerDocumentField from "./OrganizerDocumentField";

const STEPS = [
  { id: 1, title: "Xác minh danh tính" },
  { id: 2, title: "Thông tin tổ chức" },
  { id: 3, title: "Tài khoản ngân hàng" },
  { id: 4, title: "Ký cam kết trách nhiệm" },
];

const AGREEMENT_OPTIONS = [
  {
    value: "TRUTHFUL_INFORMATION",
    label:
      "Tôi xác nhận mọi thông tin trong hồ sơ là trung thực, đầy đủ và có thể giải trình khi được yêu cầu.",
  },
  {
    value: "TERMS",
    label:
      "Tôi cam kết chỉ sử dụng hồ sơ này để đại diện đúng tổ chức hoặc nhóm đã khai báo trên CCNet.",
  },
  {
    value: "FINANCIAL_RESPONSIBILITY",
    label:
      "Tôi cam kết sử dụng tiền, hiện vật hoặc nguồn lực được ủng hộ đúng mục đích đã công bố.",
  },
  {
    value: "TRANSPARENCY_REPORTING",
    label:
      "Tôi cam kết cập nhật tiến độ, bằng chứng và báo cáo minh bạch theo quy định của nền tảng.",
  },
  {
    value: "PLATFORM_ENFORCEMENT",
    label:
      "Tôi chấp nhận việc CCNet kiểm tra, tạm dừng hoặc xử lý hồ sơ nếu phát hiện thông tin sai lệch hoặc sử dụng sai mục đích.",
  },
];

const STEP_FIELDS = {
  1: [],
  2: [
    "fullNameSnapshot",
    "emailSnapshot",
    "phoneSnapshot",
    "locationSnapshot",
    "organizationName",
    "organizationType",
    "organizationLegalType",
    "taxCode",
    "legalRegistrationNumber",
    "activityDescription",
    "proofLinks",
    "organizationWebsite",
    "businessLicense"
  ],
  3: ["bankName", "bankAccountNumber", "bankAccountName", "bankProof"],
  4: ["commitment.agreements", "commitment.signerName", "commitment.version"],
};

const STEP_TITLES = {
  1: "Xác minh danh tính",
  2: "Thông tin tổ chức",
  3: "Tài khoản ngân hàng",
  4: "Ký cam kết trách nhiệm",
};

const collectErrorPaths = (value, prefix = "") => {
  if (!value || typeof value !== "object") return [];

  if ("message" in value && typeof value.message === "string") {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return collectErrorPaths(nestedValue, nextPrefix);
  });
};

const getStepForErrorPath = (path) => {
  if (!path) return 1;

  const normalizedPath = String(path);

  if (normalizedPath.startsWith("commitment.")) return 4;

  if (
    normalizedPath.startsWith("bankName") ||
    normalizedPath.startsWith("bankAccountNumber") ||
    normalizedPath.startsWith("bankAccountName") ||
    normalizedPath.startsWith("bankProof")
  ) {
    return 3;
  }

  if (
    normalizedPath.startsWith("fullNameSnapshot") ||
    normalizedPath.startsWith("emailSnapshot") ||
    normalizedPath.startsWith("phoneSnapshot") ||
    normalizedPath.startsWith("locationSnapshot") ||
    normalizedPath.startsWith("organizationName") ||
    normalizedPath.startsWith("organizationType") ||
    normalizedPath.startsWith("organizationLegalType") ||
    normalizedPath.startsWith("taxCode") ||
    normalizedPath.startsWith("legalRegistrationNumber") ||
    normalizedPath.startsWith("activityDescription") ||
    normalizedPath.startsWith("proofLinks") ||
    normalizedPath.startsWith("organizationWebsite")
  ) {
    return 2;
  }

  return 1;
};

export function BecomeOrganizerWizard({
  form,
  onSubmit,
  onDocumentChange,
  isSubmitting,
  isResubmitting = false,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepAlert, setStepAlert] = useState("");
  const {
    register,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;
  const { banks, isLoading: isBanksLoading } = useVietnamBanks();
  const bankProof = watch("bankProof");

  const stepsWithErrors = useMemo(() => {
    return new Set(collectErrorPaths(errors).map(getStepForErrorPath));
  }, [errors]);

  const navigateToStep = (step, message = "") => {
    setCurrentStep(step);
    setStepAlert(message);
    window.scrollTo(0, 0);
  };

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep] || [];
    const isValid =
      fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;

    if (!isValid) {
      setStepAlert("Vui lòng kiểm tra các trường được đánh dấu trong bước này.");
      return;
    }

    setStepAlert("");
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStepAlert("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const isValid = await trigger();

    if (!isValid) {
      const [firstErrorPath] = collectErrorPaths(form.formState.errors);
      const firstInvalidStep = getStepForErrorPath(firstErrorPath);
      navigateToStep(
        firstInvalidStep,
        `Hồ sơ còn thiếu thông tin ở bước ${STEP_TITLES[firstInvalidStep]}. Vui lòng kiểm tra các trường được đánh dấu.`
      );
      return;
    }

    setStepAlert("");
    onSubmit(event);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Đăng ký trở thành nhà tổ chức
        </h1>
        <p className="mt-3 text-sm text-slate-500 md:text-base">
          Trải qua 4 bước rõ ràng để hoàn thiện hồ sơ và bắt đầu quản lý dự án
          trên CCNet.
        </p>
      </div>

      <div className="mb-8 hidden sm:block">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const hasErrors = stepsWithErrors.has(step.id);
            const isCompleted = currentStep > step.id && !hasErrors;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors ${
                      isCompleted
                        ? "border-amber-400 bg-amber-400 text-slate-900"
                        : hasErrors
                          ? "border-rose-300 bg-rose-50 text-rose-600"
                          : isCurrent
                            ? "border-amber-400 bg-amber-50 text-amber-500"
                            : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      hasErrors
                        ? "text-rose-600"
                        : isCurrent || isCompleted
                          ? "text-slate-900"
                          : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-4 h-1 w-full rounded-full ${
                      isCompleted ? "bg-amber-400" : "bg-slate-100"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {stepAlert ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{stepAlert}</span>
        </div>
      ) : null}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {currentStep === 1 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Xác minh danh tính
                </h2>
                <p className="text-sm text-gray-500">
                  Quy trình mới không yêu cầu tải lên hình ảnh nhạy cảm.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-amber-600">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="mb-2 text-base font-bold text-amber-900">
                    Chờ tích hợp xác minh danh tính / Xét duyệt thủ công
                  </h3>
                  <p className="text-sm leading-relaxed text-amber-800">
                    CCNet hiện không yêu cầu tải ảnh CCCD/CMND hoặc ảnh selfie
                    trong bước đăng ký này nhằm giảm thiểu lưu trữ dữ liệu cá
                    nhân nhạy cảm. Hồ sơ của bạn sẽ được xét duyệt thủ công bởi
                    quản trị viên nền tảng. Tính năng xác minh danh tính qua nhà
                    cung cấp eKYC sẽ được tích hợp ở giai đoạn tiếp theo.
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-amber-800">
                    Bạn có thể tiếp tục sang bước Thông tin tổ chức.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <OrganizerRequestPersonalSection
              register={register}
              control={control}
              errors={errors}
            />
            <OrganizerRequestOrganizationSection
              register={register}
              errors={errors}
              watch={watch}
              control={control}
            />
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                Tài liệu bổ sung
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Vui lòng tải lên giấy phép, quyết định thành lập hoặc tài liệu tương đương.
              </p>
              <div className="max-w-sm">
                <OrganizerDocumentField
                  label="Giấy phép tổ chức"
                  description="Tài liệu PDF hoặc Hình ảnh"
                  accept=".pdf"
                  value={watch("businessLicense")}
                  onSelect={(file) => onDocumentChange("businessLicense", file)}
                  error={errors.businessLicense?.message}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
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
        )}

        {currentStep === 4 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Ký cam kết trách nhiệm
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Đây là bản cam kết điện tử trên nền tảng CCNet. Khi gửi hồ sơ,
                hệ thống sẽ ghi nhận người ký, thời gian ký và mã xác nhận cam
                kết để phục vụ kiểm tra sau này.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-2xl bg-amber-100 p-2 text-amber-700">
                    <FileSignature size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Xác nhận trách nhiệm đại diện hồ sơ
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      Tôi xác nhận rằng mình là người chịu trách nhiệm khai báo
                      hồ sơ đại diện cho tổ chức hoặc nhóm này trên nền tảng
                      CCNet. Tôi hiểu rằng các thông tin và cam kết dưới đây sẽ
                      được lưu lại như một bản ghi xác nhận trách nhiệm điện tử
                      trên nền tảng.
                    </p>
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      Bản ghi này không phải chữ ký số pháp lý, nhưng được dùng
                      để đối chiếu trách nhiệm khi kiểm tra hồ sơ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Danh sách cam kết bắt buộc
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Vui lòng đọc kỹ và xác nhận đầy đủ trước khi gửi hồ sơ.
                  </p>
                </div>

                <div className="space-y-3">
                  {AGREEMENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-6 items-center">
                        <input
                          type="checkbox"
                          value={option.value}
                          className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          {...register("commitment.agreements")}
                        />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-900">
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                  {errors?.commitment?.agreements && (
                    <p className="mt-1 pl-2 text-xs text-red-500">
                      {errors.commitment.agreements.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nhập họ tên để ký xác nhận trách nhiệm
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên của bạn để xác nhận"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  {...register("commitment.signerName")}
                />
                {errors?.commitment?.signerName && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.commitment.signerName.message}
                  </p>
                )}
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Khi gửi hồ sơ, hệ thống sẽ tự ghi nhận thời điểm xác nhận, tài
                  khoản gửi hồ sơ và mã xác nhận cam kết điện tử trên nền tảng.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={currentStep === 1 ? () => window.history.back() : handleBack}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {currentStep === 1 ? (
              "Hủy bỏ"
            ) : (
              <>
                <ArrowLeft size={16} /> Quay lại
              </>
            )}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
            >
              Tiếp tục <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Đang gửi..."
                : isResubmitting
                  ? "Gửi lại hồ sơ"
                  : "Gửi hồ sơ"}
              {!isSubmitting && <CheckCircle2 size={18} />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default BecomeOrganizerWizard;
