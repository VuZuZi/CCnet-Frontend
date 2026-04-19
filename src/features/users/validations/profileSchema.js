import { z } from "zod";

const pointLocationSchema = z
  .object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2, "Địa điểm không hợp lệ"),
    address: z.string().trim().min(3, "Vui lòng chọn địa chỉ hợp lệ"),
  })
  .refine(
    (value) =>
      Array.isArray(value.coordinates) &&
      value.coordinates.length === 2 &&
      Number.isFinite(value.coordinates[0]) &&
      Number.isFinite(value.coordinates[1]),
    {
      message: "Địa điểm không hợp lệ",
      path: ["coordinates"],
    }
  );

export const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-]{7,15}$/, "Định dạng số điện thoại không hợp lệ")
    .or(z.literal(""))
    .optional(),
  location: z.preprocess(
    (value) => (value === null ? undefined : value),
    pointLocationSchema.optional()
  ),
  headline: z
    .string()
    .max(150, "Tiêu đề ngắn tối đa 150 ký tự")
    .or(z.literal(""))
    .optional(),
  about: z
    .string()
    .max(1000, "Phần giới thiệu tối đa 1000 ký tự")
    .or(z.literal(""))
    .optional(),
  skills: z
    .preprocess((val) => {
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return val || [];
    }, z.array(z.string().max(50, "Mỗi kỹ năng tối đa 50 ký tự")).max(20, "Tối đa 20 kỹ năng"))
    .optional(),
});

export default profileSchema;