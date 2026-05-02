import { useFieldArray } from "react-hook-form";
import { Building2, ChevronDown } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import FormErrorText from "./FormErrorText";
import {
  ORGANIZATION_LEGAL_TYPES,
  ORGANIZATION_TYPES,
} from "../../constants/organizerRequest.constants";
import {
  inputClass,
  labelClass,
  selectClass,
} from "../../constants/organizerRequestStyles";

export function OrganizerRequestOrganizationSection({
  register,
  errors,
  watch,
  control,
}) {
  const legalType = watch("organizationLegalType");
  const isLegalEntity = [
    "COMPANY",
    "REGISTERED_NGO",
    "HOUSEHOLD_BUSINESS",
  ].includes(legalType);
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
      icon={<Building2 size={18} />}
      title="Thông tin tổ chức"
      iconClassName="bg-violet-100 text-violet-600"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Tên tổ chức</label>
          <input
            {...register("organizationName")}
            placeholder="Tên tổ chức hoặc chiến dịch của bạn"
            className={inputClass}
          />
          <FormErrorText>{errors.organizationName?.message}</FormErrorText>
        </div>

        <div className="relative">
          <label className={labelClass}>Lĩnh vực hoạt động</label>
          <select {...register("organizationType")} className={selectClass}>
            {ORGANIZATION_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-[46px] text-slate-400"
          />
          <FormErrorText>{errors.organizationType?.message}</FormErrorText>
        </div>

        <div className="relative md:col-span-2">
          <label className={labelClass}>Hình thức pháp lý</label>
          <select
            {...register("organizationLegalType")}
            className={selectClass}
          >
            <option value="">Chọn hình thức pháp lý...</option>
            {ORGANIZATION_LEGAL_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-[46px] text-slate-400"
          />
          <FormErrorText>{errors.organizationLegalType?.message}</FormErrorText>
        </div>

        {isLegalEntity && (
          <>
            <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                Nếu có mã số thuế hoặc mã đăng ký, giấy phép thành lập, vui lòng
                cung cấp để quản trị viên đối chiếu thủ công.
              </p>
            </div>
            <div>
              <label className={labelClass}>Mã số thuế</label>
              <input
                {...register("taxCode")}
                placeholder="Mã số thuế doanh nghiệp..."
                className={inputClass}
              />
              <FormErrorText>{errors.taxCode?.message}</FormErrorText>
            </div>
            <div>
              <label className={labelClass}>
                Mã đăng ký / Quyết định thành lập
              </label>
              <input
                {...register("legalRegistrationNumber")}
                placeholder="Số hiệu văn bản..."
                className={inputClass}
              />
              <FormErrorText>
                {errors.legalRegistrationNumber?.message}
              </FormErrorText>
            </div>
          </>
        )}

        {(isCommunity || isOther) && (
          <>
            <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                {isCommunity
                  ? "Không bắt buộc nhập mã số thuế cá nhân. Vui lòng cung cấp mô tả hoạt động và liên kết minh chứng như fanpage, website, bài viết hoặc chiến dịch đã thực hiện."
                  : "Vui lòng mô tả rõ loại hình hoạt động và cung cấp liên kết minh chứng nếu có."}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Mô tả hoạt động</label>
              <textarea
                {...register("activityDescription")}
                rows={3}
                placeholder="Mô tả ngắn gọn về hoạt động của tổ chức hoặc nhóm..."
                className={inputClass}
              />
              <FormErrorText>{errors.activityDescription?.message}</FormErrorText>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                Liên kết minh chứng (Tối đa 5 liên kết)
              </label>
              <div className="space-y-3">
                {proofLinkFields.map((field, index) => (
                  <div key={field.id} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          {...register(`proofLinks.${index}`)}
                          placeholder="https://"
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-xl bg-rose-50 px-4 text-sm font-semibold text-rose-600 hover:bg-rose-100"
                      >
                        Xóa
                      </button>
                    </div>
                    <FormErrorText>
                      {errors.proofLinks?.[index]?.message}
                    </FormErrorText>
                  </div>
                ))}
              </div>
              <FormErrorText>{proofLinksErrorMessage}</FormErrorText>

              {proofLinkFields.length < 5 && (
                <button
                  type="button"
                  onClick={() => append("")}
                  className="mt-3 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                >
                  + Thêm liên kết minh chứng
                </button>
              )}
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className={labelClass}>Trang web tổ chức (tùy chọn)</label>
          <input
            {...register("organizationWebsite")}
            placeholder="https://"
            className={inputClass}
          />
          <FormErrorText>{errors.organizationWebsite?.message}</FormErrorText>
        </div>
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestOrganizationSection;
