/**
 * SAFETY NOTICE: Legacy/deprecated organizer identity upload component.
 *
 * This component contains raw CCCD/CMND/selfie upload fields from the old
 * organizer onboarding flow. Do not reintroduce it into the active Become
 * Organizer flow unless an official provider/legal phase explicitly approves
 * raw CCCD/CMND/selfie/liveness collection.
 *
 * Current product direction: privacy-minimized manual internal review.
 */
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
      title="Xác minh danh tính"
      iconClassName="bg-emerald-100 text-emerald-600"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <OrganizerDocumentField
          label="Mặt trước CMND/CCCD"
          description="JPG, PNG hoặc PDF"
          accept="image/*,.pdf"
          value={values.idCardFront}
          onSelect={(file) => onDocumentChange("idCardFront", file)}
          error={errors.idCardFront?.message}
        />

        <OrganizerDocumentField
          label="Mặt sau CMND/CCCD"
          description="JPG, PNG hoặc PDF"
          accept="image/*,.pdf"
          value={values.idCardBack}
          onSelect={(file) => onDocumentChange("idCardBack", file)}
          error={errors.idCardBack?.message}
        />

        <OrganizerDocumentField
          label="Ảnh chân dung (Selfie)"
          description="JPG hoặc PNG"
          accept="image/*"
          value={values.selfie}
          onSelect={(file) => onDocumentChange("selfie", file)}
          error={errors.selfie?.message}
        />

        <OrganizerDocumentField
          label="Giấy phép tổ chức"
          description="Tài liệu PDF (Tùy chọn)"
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