import { Controller } from "react-hook-form";
import LocationPicker from "@/shared/components/ui/LocationPicker";

export function Step1BasicInfoSection({
  register,
  control,
  watch,
  errors,
}) {
  const projectTypeValue = watch("projectType");
  const titleValue = watch("title", "");

  return (
    <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Project Type
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              projectTypeValue === "FUNDED"
                ? "border-primary bg-primary/5"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              value="FUNDED"
              {...register("projectType")}
              className="sr-only"
            />
            <div className="font-bold text-slate-900">Funded Project</div>
            <p className="mt-1 text-sm text-slate-500">
              Raise funds and recruit volunteers.
            </p>
          </label>

          <label
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              projectTypeValue === "VOLUNTEER_ONLY"
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              value="VOLUNTEER_ONLY"
              {...register("projectType")}
              className="sr-only"
            />
            <div className="font-bold text-slate-900">Volunteer Only</div>
            <p className="mt-1 text-sm text-slate-500">
              No fundraising, human resources only.
            </p>
          </label>
        </div>

        {errors.projectType ? (
          <p className="mt-1.5 text-sm font-medium text-red-500">
            {errors.projectType.message}
          </p>
        ) : null}
      </div>

      <hr className="border-slate-100" />

      <h2 className="text-xl font-bold text-slate-900">
        Basic Information
      </h2>

      <div>
        <div className="mb-2 flex justify-between">
          <label className="block text-sm font-bold text-slate-700">
            Project Name
          </label>
          <span
            className={`text-xs font-medium ${
              titleValue.length > 100 ? "text-red-500" : "text-slate-500"
            }`}
          >
            {titleValue.length}/100
          </span>
        </div>

        <input
          {...register("title")}
          className={`w-full rounded-xl border bg-slate-50 p-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all ${
            errors.title
              ? "border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary"
          }`}
          placeholder="e.g., Building a flood-proof bridge in Pa Tan village"
        />

        {errors.title ? (
          <p className="mt-1.5 text-sm font-medium text-red-500">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Category
          </label>

          <select
            {...register("category")}
            className={`w-full rounded-xl border bg-slate-50 p-3 text-slate-900 shadow-sm outline-none transition-all ${
              errors.category
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary"
            }`}
          >
            <option value="">Select category</option>
            <option value="Y_TE">Healthcare</option>
            <option value="GIAO_DUC">Education</option>
            <option value="THIEN_TAI">Disaster Relief</option>
            <option value="XAY_DUNG">Infrastructure</option>
            <option value="MOI_TRUONG">Environmental Protection</option>
            <option value="KHAC">Other</option>
          </select>

          {errors.category ? (
            <p className="mt-1.5 text-sm font-medium text-red-500">
              {errors.category.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Location
          </label>

          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <div
                className={
                  errors.location?.address || errors.location
                    ? "rounded-xl ring-2 ring-red-200"
                    : ""
                }
              >
                <LocationPicker
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.location?.address || !!errors.location}
                />
              </div>
            )}
          />

          {errors.location?.address || errors.location ? (
            <p className="mt-1.5 text-sm font-medium text-red-500">
              {errors.location?.address?.message || errors.location?.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Expected Start Date
          </label>

          <input
            type="date"
            {...register("startDate")}
            className={`w-full rounded-xl border bg-slate-50 p-3 text-slate-900 shadow-sm outline-none transition-all ${
              errors.startDate
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary"
            }`}
          />

          {errors.startDate ? (
            <p className="mt-1.5 text-sm font-medium text-red-500">
              {errors.startDate.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Expected End Date
          </label>

          <input
            type="date"
            {...register("endDate")}
            className={`w-full rounded-xl border bg-slate-50 p-3 text-slate-900 shadow-sm outline-none transition-all ${
              errors.endDate
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary"
            }`}
          />

          {errors.endDate ? (
            <p className="mt-1.5 text-sm font-medium text-red-500">
              {errors.endDate.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Step1BasicInfoSection;