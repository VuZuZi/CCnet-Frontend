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

const organizationTypeOptions = ORGANIZATION_TYPES.some(
  (item) => item.value === "OTHER"
)
  ? ORGANIZATION_TYPES
  : [...ORGANIZATION_TYPES, { value: "OTHER", label: "Khác" }];

export function OrganizerRequestOrganizationSection({
  register,
  errors,
  watch,
}) {
  const legalType = watch("organizationLegalType");
  const isLegalEntity = [
    "COMPANY",
    "REGISTERED_NGO",
    "HOUSEHOLD_BUSINESS",
  ].includes(legalType);

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
            {organizationTypeOptions.map((item) => (
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

        {!isLegalEntity && legalType && (
          <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Mô tả hoạt động và liên kết minh chứng sẽ được cung cấp ở bước tiếp theo.
            </p>
          </div>
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
