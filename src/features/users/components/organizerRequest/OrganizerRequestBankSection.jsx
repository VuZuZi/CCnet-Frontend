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
  errors,
  bankProof,
  banks,
  isBanksLoading,
  onDocumentChange,
}) {
  return (
    <OrganizerSectionCard
      icon={<Landmark size={18} />}
      title="Bank Account Information"
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
                onChange={field.onChange}
                banks={banks}
                isLoading={isBanksLoading}
                error={errors.bankName?.message}
              />
            )}
          />
        </div>

        <div>
          <label className={labelClass}>Account Number</label>
          <input
            {...register("bankAccountNumber")}
            placeholder="Enter account number"
            className={inputClass}
          />
          <FormErrorText>{errors.bankAccountNumber?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Account Holder Name</label>
          <input
            {...register("bankAccountName")}
            placeholder="Name on account"
            className={inputClass}
          />
          <FormErrorText>{errors.bankAccountName?.message}</FormErrorText>
        </div>

        <div className="md:col-span-2">
          <OrganizerDocumentField
            label="Bank Proof"
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