import { UserRound } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import FormErrorText from "./FormErrorText";
import {
  inputClass,
  labelClass,
} from "../../constants/organizerRequestStyles";

export function OrganizerRequestPersonalSection({ register, errors }) {
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
            placeholder="+84..."
            className={inputClass}
          />
          <FormErrorText>{errors.phoneSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Địa chỉ Email</label>
          <input
            {...register("emailSnapshot")}
            placeholder="nguyenvana@example.com"
            className={inputClass}
          />
          <FormErrorText>{errors.emailSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Địa chỉ</label>
          <input
            {...register("locationSnapshot")}
            placeholder="Tỉnh/Thành phố, Quốc gia"
            className={inputClass}
          />
          <FormErrorText>{errors.locationSnapshot?.message}</FormErrorText>
        </div>
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestPersonalSection;