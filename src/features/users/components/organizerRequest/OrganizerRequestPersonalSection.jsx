import { Controller } from "react-hook-form";
import { UserRound } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import FormErrorText from "./FormErrorText";
import LocationPicker from "@/shared/components/ui/LocationPicker";
import {
  inputClass,
  labelClass,
} from "../../constants/organizerRequestStyles";

export function OrganizerRequestPersonalSection({ register, control, errors }) {
  return (
    <OrganizerSectionCard
      icon={<UserRound size={18} />}
      title="Thông tin cá nhân"
      iconClassName="bg-blue-100 text-blue-600"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Họ và tên</label>
          <input
            {...register("fullNameSnapshot")}
            placeholder="Nguyễn Văn A"
            className={inputClass}
          />
          <FormErrorText>{errors.fullNameSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Số điện thoại</label>
          <input
            {...register("phoneSnapshot")}
            placeholder="0987654321"
            className={inputClass}
          />
          <FormErrorText>{errors.phoneSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Địa chỉ email</label>
          <input
            {...register("emailSnapshot")}
            placeholder="nguyenvana@example.com"
            className={inputClass}
          />
          <FormErrorText>{errors.emailSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Địa chỉ</label>
          <Controller
            name="locationSnapshot"
            control={control}
            render={({ field }) => (
              <div
                className={
                  errors.locationSnapshot
                    ? "rounded-xl ring-2 ring-red-200"
                    : ""
                }
              >
                <LocationPicker
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.locationSnapshot}
                />
              </div>
            )}
          />
          <FormErrorText>
            {errors.locationSnapshot?.address?.message ||
              errors.locationSnapshot?.coordinates?.message ||
              errors.locationSnapshot?.message}
          </FormErrorText>
        </div>
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestPersonalSection;