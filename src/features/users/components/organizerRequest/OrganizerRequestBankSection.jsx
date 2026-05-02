import { Controller } from "react-hook-form";
import { Landmark } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import OrganizerDocumentField from "./OrganizerDocumentField";
import BankAutocomplete from "./BankAutocomplete";
import FormErrorText from "./FormErrorText";
import {
  inputClass,
  labelClass,
} from "../../constants/organizerRequestStyles";

export function OrganizerRequestBankSection({
  control,
  register,
  setValue,
  errors,
  bankProof,
  banks,
  isBanksLoading,
  onDocumentChange,
}) {
  return (
    <OrganizerSectionCard
      icon={<Landmark size={18} />}
      title="Thông tin tài khoản ngân hàng"
      iconClassName="bg-amber-100 text-amber-700"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Controller
            name="bankName"
            control={control}
            render={({ field }) => (
              <BankAutocomplete
                value={field.value || ""}
                onChange={(nextValue) => {
                  field.onChange(nextValue);
                  setValue("bankBin", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                onSelectBank={(bank) => {
                  setValue("bankBin", bank?.bin || "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                banks={banks}
                isLoading={isBanksLoading}
                error={errors.bankName?.message}
              />
            )}
          />
        </div>

        <div>
          <label className={labelClass}>Số tài khoản</label>
          <input
            {...register("bankAccountNumber")}
            placeholder="Nhập số tài khoản"
            className={inputClass}
          />
          <FormErrorText>{errors.bankAccountNumber?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Tên chủ tài khoản</label>
          <input
            {...register("bankAccountName")}
            placeholder="Tên chủ tài khoản"
            className={inputClass}
          />
          <FormErrorText>{errors.bankAccountName?.message}</FormErrorText>
        </div>

        <div className="md:col-span-2">
          <p className="mb-3 text-sm text-gray-500">
            Vui lòng tải lên minh chứng tài khoản ngân hàng (sao kê, ảnh màn hình app hoặc giấy xác nhận).
          </p>
          <OrganizerDocumentField
            label="Minh chứng tài khoản"
            description="Ảnh hoặc PDF sao kê / xác nhận tài khoản"
            accept="image/*,.pdf"
            value={bankProof}
            onSelect={(file) => onDocumentChange("bankProof", file)}
            error={errors.bankProof?.message}
          />
        </div>
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestBankSection;