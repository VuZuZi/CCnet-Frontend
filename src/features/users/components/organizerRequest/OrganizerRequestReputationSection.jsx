import { useFieldArray } from "react-hook-form";
import { Link2, Plus, Trash2 } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import OrganizerDocumentField from "./OrganizerDocumentField";
import FormErrorText from "./FormErrorText";
import { inputClass, labelClass } from "../../constants/organizerRequestStyles";

export function OrganizerRequestReputationSection({
  register,
  errors,
  watch,
  control,
  onDocumentChange,
}) {
  const legalType = watch("organizationLegalType");
  const isCommunity = legalType === "COMMUNITY_GROUP";
  const isOther = legalType === "OTHER";
  const proofLinksErrorMessage =
    errors.proofLinks?.message || errors.proofLinks?.root?.message;

  const { fields: proofLinkFields, append, remove } = useFieldArray({
    control,
    name: "proofLinks",
  });

  return (
    <OrganizerSectionCard
      icon={<Link2 size={18} />}
      title="Uy tín & Minh chứng hoạt động"
      iconClassName="bg-blue-100 text-blue-600"
    >
      <div className="space-y-5">
        {(isCommunity || isOther) ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm leading-6 text-amber-900">
              {isCommunity
                ? "Vui lòng mô tả hoạt động và cung cấp ít nhất một liên kết minh chứng như fanpage, website, bài viết hoặc chiến dịch đã thực hiện."
                : "Vui lòng mô tả rõ loại hình hoạt động. Liên kết minh chứng là tùy chọn nhưng sẽ hỗ trợ quá trình xem xét thủ công."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              Với tổ chức có thông tin đăng ký, phần mô tả hoạt động và liên kết minh chứng là tùy chọn.
            </p>
          </div>
        )}

        <div>
          <label className={labelClass}>Mô tả hoạt động</label>
          <textarea
            {...register("activityDescription")}
            rows={4}
            placeholder="Mô tả ngắn gọn về hoạt động của tổ chức hoặc nhóm..."
            className={inputClass}
          />
          <FormErrorText>{errors.activityDescription?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>
            Liên kết minh chứng (Tối đa 5 liên kết)
          </label>
          <div className="space-y-3">
            {proofLinkFields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    {...register(`proofLinks.${index}`)}
                    placeholder="https://"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                    title="Xóa liên kết"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <FormErrorText>{errors.proofLinks?.[index]?.message}</FormErrorText>
              </div>
            ))}
          </div>
          <FormErrorText>{proofLinksErrorMessage}</FormErrorText>

          {proofLinkFields.length < 5 && (
            <button
              type="button"
              onClick={() => append("")}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              <Plus size={16} />
              Thêm liên kết minh chứng
            </button>
          )}
        </div>

        <div className="max-w-sm">
          <OrganizerDocumentField
            label="Giấy phép tổ chức (tùy chọn)"
            description="Tài liệu PDF hoặc hình ảnh"
            accept="image/*,.pdf"
            value={watch("businessLicense")}
            onSelect={(file) => onDocumentChange("businessLicense", file)}
            error={errors.businessLicense?.message}
          />
        </div>
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestReputationSection;
