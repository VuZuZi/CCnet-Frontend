import { Building2, ChevronDown } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import FormErrorText from "./FormErrorText";
import { ORGANIZATION_TYPES } from "../../constants/organizerRequest.constants";
import {
  inputClass,
  labelClass,
  selectClass,
} from "../../constants/organizerRequestStyles";

export function OrganizerRequestOrganizationSection({ register, errors }) {
  return (
    <OrganizerSectionCard
      icon={<Building2 size={18} />}
      title="Organization Information"
      iconClassName="bg-violet-100 text-violet-600"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Organization Name</label>
          <input
            {...register("organizationName")}
            placeholder="Name of your organization or campaign"
            className={inputClass}
          />
          <FormErrorText>{errors.organizationName?.message}</FormErrorText>
        </div>

        <div className="relative">
          <label className={labelClass}>Organization Type</label>
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

        <div>
          <label className={labelClass}>Organization Website (optional)</label>
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