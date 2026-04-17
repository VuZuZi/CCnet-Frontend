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
      title="Personal Information"
      iconClassName="bg-blue-100 text-blue-600"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            {...register("fullNameSnapshot")}
            placeholder="John Doe"
            className={inputClass}
          />
          <FormErrorText>{errors.fullNameSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            {...register("phoneSnapshot")}
            placeholder="+84..."
            className={inputClass}
          />
          <FormErrorText>{errors.phoneSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <input
            {...register("emailSnapshot")}
            placeholder="john@example.com"
            className={inputClass}
          />
          <FormErrorText>{errors.emailSnapshot?.message}</FormErrorText>
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input
            {...register("locationSnapshot")}
            placeholder="City, Country"
            className={inputClass}
          />
          <FormErrorText>{errors.locationSnapshot?.message}</FormErrorText>
        </div>
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestPersonalSection;