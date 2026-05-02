import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useVietnamBanks } from "../../hooks/useVietnamBanks";
import OrganizerRequestPersonalSection from "./OrganizerRequestPersonalSection";
import OrganizerRequestOrganizationSection from "./OrganizerRequestOrganizationSection";
import OrganizerRequestReputationSection from "./OrganizerRequestReputationSection";
import OrganizerRequestBankSection from "./OrganizerRequestBankSection";
import OrganizerRequestReviewStep from "./OrganizerRequestReviewStep";
import OrganizerAgreementStep from "./OrganizerAgreementStep";
import { ALL_AGREEMENT_CODES } from "./AgreementA4Preview";

const STEPS = [
  { id: 1, title: "Thông tin người đại diện" },
  { id: 2, title: "Thông tin tổ chức" },
  { id: 3, title: "Uy tín & Minh chứng" },
  { id: 4, title: "Tài khoản ngân hàng" },
  { id: 5, title: "Xem lại thông tin" },
  { id: 6, title: "Ký cam kết trách nhiệm" },
];

const STEP_FIELDS = {
  1: [
    "fullNameSnapshot",
    "emailSnapshot",
    "phoneSnapshot",
    "locationSnapshot",
  ],
  2: [
    "organizationName",
    "organizationType",
    "organizationLegalType",
    "taxCode",
    "legalRegistrationNumber",
    "organizationWebsite",
  ],
  3: ["activityDescription", "proofLinks", "businessLicense"],
  4: ["bankName", "bankAccountNumber", "bankAccountName", "bankProof"],
  5: [],
  6: [
    "commitment.agreements",
    "commitment.signerName",
    "commitment.version",
    "commitment.signatureImageDataUrl",
  ],
};

const STEP_TITLES = Object.fromEntries(
  STEPS.map((step) => [step.id, step.title])
);

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

  if (normalizedPath.startsWith("commitment.")) return 6;

  if (
    normalizedPath.startsWith("bankName") ||
    normalizedPath.startsWith("bankAccountNumber") ||
    normalizedPath.startsWith("bankAccountName") ||
    normalizedPath.startsWith("bankProof")
  ) {
    return 4;
  }

  if (
    normalizedPath.startsWith("activityDescription") ||
    normalizedPath.startsWith("proofLinks") ||
    normalizedPath.startsWith("businessLicense")
  ) {
    return 3;
  }

  if (
    normalizedPath.startsWith("organizationName") ||
    normalizedPath.startsWith("organizationType") ||
    normalizedPath.startsWith("organizationLegalType") ||
    normalizedPath.startsWith("taxCode") ||
    normalizedPath.startsWith("legalRegistrationNumber") ||
    normalizedPath.startsWith("organizationWebsite")
  ) {
    return 2;
  }

  return 1;
};

const hasAllAgreementCodes = (codes = []) => {
  if (!Array.isArray(codes) || codes.length !== ALL_AGREEMENT_CODES.length) {
    return false;
  }
  const received = [...codes].sort();
  const required = [...ALL_AGREEMENT_CODES].sort();
  return received.every((code, index) => code === required[index]);
};

export function BecomeOrganizerWizard({
  form,
  onSubmit,
  onDocumentChange,
  isSubmitting,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepAlert, setStepAlert] = useState("");
  const {
    register,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = form;
  const { banks, isLoading: isBanksLoading } = useVietnamBanks();
  const bankProof = watch("bankProof");
  const values = watch();
  const commitment = values.commitment || {};

  const isAgreementReady =
    hasAllAgreementCodes(commitment.agreements) &&
    String(commitment.signerName || "").trim().length >= 2 &&
    Boolean(commitment.signatureImageDataUrl) &&
    isValid;

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
    setCurrentStep((prev) => Math.min(prev + 1, 6));
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
          Đăng ký trở thành Ban tổ chức
        </h1>
        <p className="mt-3 text-sm text-slate-500 md:text-base">
          Hoàn thiện hồ sơ, xem lại thông tin và ký cam kết trách nhiệm trước khi gửi để quản trị viên xem xét nội bộ.
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
                <button
                  type="button"
                  onClick={() => {
                    if (step.id <= currentStep) navigateToStep(step.id);
                  }}
                  disabled={step.id > currentStep}
                  className="flex min-w-0 flex-col items-center gap-2 text-center disabled:cursor-default"
                >
                  <span
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
                  </span>
                  <span
                    className={`max-w-[120px] text-xs font-semibold leading-4 ${
                      hasErrors
                        ? "text-rose-600"
                        : isCurrent || isCompleted
                          ? "text-slate-900"
                          : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-3 h-1 w-full rounded-full ${
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
          <OrganizerRequestPersonalSection
            register={register}
            control={control}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <OrganizerRequestOrganizationSection
            register={register}
            errors={errors}
            watch={watch}
          />
        )}

        {currentStep === 3 && (
          <OrganizerRequestReputationSection
            register={register}
            errors={errors}
            watch={watch}
            control={control}
            onDocumentChange={onDocumentChange}
          />
        )}

        {currentStep === 4 && (
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

        {currentStep === 5 && (
          <OrganizerRequestReviewStep
            values={values}
            onEditStep={(step) => navigateToStep(step)}
          />
        )}

        {currentStep === 6 && (
          <OrganizerAgreementStep form={form} isSubmitting={isSubmitting} />
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

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-500"
            >
              {currentStep === 5 ? "Tiếp tục ký cam kết" : "Tiếp tục"}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isAgreementReady}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-8 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang gửi..." : "Ký xác nhận và gửi đơn"}
              {!isSubmitting && <CheckCircle2 size={18} />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default BecomeOrganizerWizard;
