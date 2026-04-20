import { useState } from "react";
import { ImagePlus, Lock, Globe2, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../../auth/stores/useAuthStore";
import CreatePostModal from "./CreatePostModal";

const PRIVACY_META = {
  public: {
    label: "Công khai",
    hint: "Ai cũng xem được",
    icon: Globe2,
  },
  private: {
    label: "Riêng tư",
    hint: "Chỉ người theo dõi mới xem",
    icon: Lock,
  },
};

export function CreatePostComposer({
  title = "Bạn đang nghĩ gì vậy?",
  subtitle = "Nhấn để mở khung soạn bài giống Facebook.",
  defaultPrivacy = "public",
  showPrivacySelector = true,
  buttonLabel = "Đăng bài",
  compactTrigger = false,
}) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const PrivacyIcon = PRIVACY_META[defaultPrivacy]?.icon || Globe2;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          compactTrigger ? "p-4 sm:p-5" : "p-5 sm:p-6"
        }`}
      >
        <div className="flex items-start gap-4 text-left">
          <div className="size-12 shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 bg-cover bg-center ring-2 ring-white shadow-sm" style={user?.avatar ? { backgroundImage: `url("${user.avatar}")` } : undefined}>
            {!user?.avatar ? (
              <div className="flex size-full items-center justify-center font-black text-slate-500">
                {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 sm:text-lg">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                <PrivacyIcon size={14} />
                {PRIVACY_META[defaultPrivacy]?.label || "Công khai"}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <span className="flex-1 truncate">{buttonLabel} • {showPrivacySelector ? "chọn quyền xem" : "đăng nhanh"}</span>
              <div className="flex items-center gap-2 text-slate-400">
                <ImagePlus size={18} />
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>
      </button>

      <CreatePostModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Tạo bài viết"
        subtitle="Đăng ảnh, video hoặc suy nghĩ của bạn. Có thể chọn Công khai hoặc Riêng tư ngay trong popup."
        defaultPrivacy={defaultPrivacy}
        showPrivacySelector={showPrivacySelector}
      />
    </>
  );
}

export default CreatePostComposer;