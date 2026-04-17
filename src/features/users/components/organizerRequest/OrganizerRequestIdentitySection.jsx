import { ShieldCheck } from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import OrganizerDocumentField from "./OrganizerDocumentField";

export function OrganizerRequestIdentitySection({
  values,
  errors,
  onDocumentChange,
}) {
  return (
    <OrganizerSectionCard
      icon={<ShieldCheck size={18} />}
      title="Identity Verification"
      iconClassName="bg-emerald-100 text-emerald-600"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <OrganizerDocumentField
          label="Front of ID Card"
          description="JPG, PNG or PDF"
          accept="image/*,.pdf"
          value={values.idCardFront}
          onSelect={(file) => onDocumentChange("idCardFront", file)}
          error={errors.idCardFront?.message}
        />

        <OrganizerDocumentField
          label="Back of ID Card"
          description="JPG, PNG or PDF"
          accept="image/*,.pdf"
          value={values.idCardBack}
          onSelect={(file) => onDocumentChange("idCardBack", file)}
          error={errors.idCardBack?.message}
        />

        <OrganizerDocumentField
          label="Portrait Selfie"
          description="JPG or PNG"
          accept="image/*"
          value={values.selfie}
          onSelect={(file) => onDocumentChange("selfie", file)}
          error={errors.selfie?.message}
        />

        <OrganizerDocumentField
          label="Organization License"
          description="PDF Document (Optional)"
          accept=".pdf"
          value={values.businessLicense}
          onSelect={(file) => onDocumentChange("businessLicense", file)}
          error={errors.businessLicense?.message}
        />
      </div>
    </OrganizerSectionCard>
  );
}

export default OrganizerRequestIdentitySection;