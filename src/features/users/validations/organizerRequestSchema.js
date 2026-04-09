import { z } from "zod";

const VN_PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const BANK_ACCOUNT_REGEX = /^\d{8,19}$/;
const ACCOUNT_NAME_REGEX = /^[\p{L}\s.'-]{2,150}$/u;

const documentSchema = z.custom(
  (val) => val instanceof File || (val && typeof val === "object" && val.url),
  "Vui lòng tải lên một tệp hợp lệ"
);

export const organizerRequestSchema = z.object({
  fullNameSnapshot: z.string().min(2, "Họ tên tối thiểu 2 ký tự").max(150, "Họ tên tối đa 150 ký tự"),
  emailSnapshot: z.string().email("Email không hợp lệ"),
  phoneSnapshot: z.string().regex(VN_PHONE_REGEX, "Số điện thoại phải đúng định dạng Việt Nam").optional().or(z.literal("")),
  locationSnapshot: z.string().max(150, "Địa điểm tối đa 150 ký tự").optional().default(""),
  
  organizationName: z.string().min(2, "Tên tổ chức tối thiểu 2 ký tự").max(200, "Tên tổ chức tối đa 200 ký tự"),
  organizationType: z.enum(["NGO", "CHARITY", "COMMUNITY", "EDUCATION", "MEDICAL", "RELIGIOUS", "OTHER"]),
  organizationWebsite: z.union([z.string().url("Website không hợp lệ"), z.literal("")]).optional().default(""),

  idCardFront: documentSchema,
  idCardBack: documentSchema,
  selfie: documentSchema, 
  businessLicense: documentSchema.nullish().transform((v) => v ?? undefined),
  bankProof: documentSchema.nullish().transform((v) => v ?? undefined),

  bankName: z.string().min(2, "Vui lòng chọn hoặc nhập tên ngân hàng").max(200, "Tên ngân hàng quá dài"),
  bankAccountNumber: z.string().regex(BANK_ACCOUNT_REGEX, "Số tài khoản phải từ 8 đến 19 chữ số"),
  bankAccountName: z.string().regex(ACCOUNT_NAME_REGEX, "Tên chủ tài khoản chỉ được gồm chữ cái và khoảng trắng"),
  
  notes: z.string().max(1000, "Ghi chú tối đa 1000 ký tự").optional().default(""),
});