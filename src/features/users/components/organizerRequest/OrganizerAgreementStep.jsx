import { FileSignature } from "lucide-react";
import SignatureCanvas from "@/shared/components/ui/SignatureCanvas";
import FormErrorText from "./FormErrorText";
import AgreementA4Preview, {
  ALL_AGREEMENT_CODES,
} from "./AgreementA4Preview";
import { inputClass, labelClass } from "../../constants/organizerRequestStyles";

const hasAllAgreementCodes = (codes = []) => {
  if (!Array.isArray(codes) || codes.length !== ALL_AGREEMENT_CODES.length) {
    return false;
  }
  const received = [...codes].sort();
  const required = [...ALL_AGREEMENT_CODES].sort();
  return received.every((code, index) => code === required[index]);
};

export function OrganizerAgreementStep({ form, isSubmitting = false }) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const commitment = watch("commitment") || {};
  const signerName = commitment.signerName || "";
  const signatureImageDataUrl = commitment.signatureImageDataUrl || "";
  const isAcknowledged = hasAllAgreementCodes(commitment.agreements);

  const handleAcknowledgementChange = (event) => {
    setValue(
      "commitment.agreements",
      event.target.checked ? ALL_AGREEMENT_CODES : [],
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const handleSignatureChange = (dataUrl) => {
    setValue("commitment.signatureImageDataUrl", dataUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <FileSignature size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Ký cam kết trách nhiệm
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Vui lòng đọc toàn bộ bản cam kết, nhập họ tên người ký và ký xác nhận trong ô chữ ký.
            </p>
          </div>
        </div>

        <AgreementA4Preview
          signerName={signerName}
          signatureSnapshot={
            signatureImageDataUrl
              ? {
                  signerName,
                  signatureImageDataUrl,
                }
              : undefined
          }
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <input
            type="checkbox"
            checked={isAcknowledged}
            onChange={handleAcknowledgementChange}
            className="mt-0.5 h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm font-semibold leading-6 text-amber-950">
            Tôi đã đọc, hiểu và đồng ý với toàn bộ nội dung bản cam kết trách nhiệm trên.
          </span>
        </label>
        <FormErrorText>{errors?.commitment?.agreements?.message}</FormErrorText>

        <div className="mt-5">
          <label className={labelClass}>Họ tên người ký</label>
          <input
            type="text"
            placeholder="Nhập họ và tên người ký"
            className={inputClass}
            disabled={isSubmitting}
            {...register("commitment.signerName")}
          />
          <FormErrorText>{errors?.commitment?.signerName?.message}</FormErrorText>
        </div>

        <div className="mt-5">
          <label className={labelClass}>Chữ ký xác nhận trên nền tảng</label>
          <SignatureCanvas
            value={signatureImageDataUrl}
            disabled={isSubmitting}
            onChange={handleSignatureChange}
          />
          <FormErrorText>
            {errors?.commitment?.signatureImageDataUrl?.message}
          </FormErrorText>
        </div>
      </div>
    </div>
  );
}

export default OrganizerAgreementStep;
