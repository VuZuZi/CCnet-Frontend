import { Controller } from "react-hook-form";
import { Shield } from "lucide-react";
import { MediaDropzone } from "@/shared/components/ui/MediaDropzone";

export function Step1MediaSection({
  control,
  errors,
  onRemoveDocument,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <div className="mt-0.5 flex-shrink-0 text-amber-600">
          <Shield size={20} />
        </div>

        <div>
          <h4 className="text-sm font-bold text-amber-800">
            Transparency Check
          </h4>
          <p className="mt-1 text-sm text-amber-700">
            Our AI system will automatically scan for image originality.
            Please use actual photos.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">
          Project Cover Media
        </h2>

        <Controller
          name="coverMedia"
          control={control}
          render={({ field }) => (
            <MediaDropzone
              value={field.value}
              onChange={field.onChange}
              maxFiles={1}
              accept={{ "image/*": [], "video/*": [] }}
              uploadContext="project_cover"
              appearance="cover"
            />
          )}
        />
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">
          Documents & Paperwork
        </h2>

        <p className="text-sm text-slate-500">
          Upload quotes, permits, or local confirmation documents to increase
          credibility.
        </p>

        <Controller
          name="documents"
          control={control}
          render={({ field }) => (
            <div className={errors.documents ? "rounded-xl ring-2 ring-red-200" : ""}>
              <MediaDropzone
                value={field.value}
                onChange={field.onChange}
                onRemove={onRemoveDocument}
                maxFiles={5}
                accept={{ "application/pdf": [], "image/*": [] }}
                uploadContext="project_document"
                appearance="document"
              />
            </div>
          )}
        />

        {errors.documents ? (
          <p className="mt-1.5 text-sm font-medium text-red-500">
            {errors.documents.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default Step1MediaSection;