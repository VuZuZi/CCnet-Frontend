import { useEffect } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { Trash2, Users } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const EMPTY_VOLUNTEER_ROLE = {
  title: "",
  quantity: 1,
  skillsRequired: [],
  location: "",
  duration: "",
};

const toCommaSeparatedSkills = (value) =>
  Array.isArray(value) ? value.join(", ") : String(value || "");

export function VolunteerRolesBlock({
  control,
  register,
  errors,
  setValue,
  isFunded,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "volunteerRoles",
  });
  const needsVolunteers = useWatch({ control, name: "needsVolunteers" });

  useEffect(() => {
    if (!needsVolunteers) {
      setValue("volunteerRoles", []);
    }
  }, [needsVolunteers, setValue]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Tuyển Tình Nguyện Viên
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kêu gọi nguồn lực con người hỗ trợ dự án.
          </p>
        </div>

        <label
          className={cn(
            "relative inline-flex items-center",
            !isFunded ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          )}
          title={
            !isFunded ? "Dự án Volunteer-only bắt buộc phải tuyển TNV" : ""
          }
        >
          <input
            type="checkbox"
            className="sr-only peer"
            disabled={!isFunded}
            {...register("needsVolunteers")}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fbbf24]" />
        </label>
      </div>

      {needsVolunteers ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-5 border border-slate-200 rounded-2xl relative bg-slate-50/50 hover:bg-slate-50 transition-colors group"
            >
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-8">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Vai trò / Vị trí
                  </label>
                  <input
                    {...register(`volunteerRoles.${idx}.title`)}
                    placeholder="VD: Thợ xây, Bác sĩ, Dạy học..."
                    className={cn(
                      "w-full p-2.5 border rounded-xl outline-none transition-colors",
                      errors.volunteerRoles?.[idx]?.title
                        ? "border-red-500"
                        : "border-slate-200 focus:border-[#fbbf24] bg-white",
                    )}
                  />
                  {errors.volunteerRoles?.[idx]?.title ? (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.volunteerRoles[idx].title.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Số lượng cần
                  </label>
                  <input
                    type="number"
                    {...register(`volunteerRoles.${idx}.quantity`)}
                    className={cn(
                      "w-full p-2.5 border rounded-xl outline-none transition-colors",
                      errors.volunteerRoles?.[idx]?.quantity
                        ? "border-red-500"
                        : "border-slate-200 focus:border-[#fbbf24] bg-white",
                    )}
                  />
                  {errors.volunteerRoles?.[idx]?.quantity ? (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.volunteerRoles[idx].quantity.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Kỹ năng yêu cầu
                  </label>
                  <input
                    defaultValue={toCommaSeparatedSkills(field.skillsRequired)}
                    onChange={(event) =>
                      setValue(
                        `volunteerRoles.${idx}.skillsRequired`,
                        String(event.target.value || "")
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                        { shouldValidate: true, shouldDirty: true },
                      )
                    }
                    placeholder="VD: Biết trộn hồ, Y tá cấp cứu..."
                    className={cn(
                      "w-full p-2.5 border rounded-xl outline-none transition-colors",
                      errors.volunteerRoles?.[idx]?.skillsRequired
                        ? "border-red-500"
                        : "border-slate-200 focus:border-[#fbbf24] bg-white",
                    )}
                  />
                  {errors.volunteerRoles?.[idx]?.skillsRequired ? (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.volunteerRoles[idx].skillsRequired.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Địa điểm & Thời gian
                  </label>
                  <input
                    {...register(`volunteerRoles.${idx}.location`)}
                    placeholder="VD: Bản Pa Tần, T7-CN hàng tuần"
                    className={cn(
                      "w-full p-2.5 border rounded-xl outline-none transition-colors",
                      errors.volunteerRoles?.[idx]?.location
                        ? "border-red-500"
                        : "border-slate-200 focus:border-[#fbbf24] bg-white",
                    )}
                  />
                  {errors.volunteerRoles?.[idx]?.location ? (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.volunteerRoles[idx].location.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {errors.volunteerRoles_sum ? (
            <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              ⚠️ {errors.volunteerRoles_sum.message}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => append(EMPTY_VOLUNTEER_ROLE)}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-500 hover:text-[#f59e0b] hover:border-[#fbbf24] transition-colors flex justify-center items-center gap-2 bg-white"
          >
            <Users size={18} /> Thêm vị trí tình nguyện
          </button>
        </div>
      ) : null}
    </div>
  );
}