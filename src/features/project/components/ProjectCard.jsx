import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Share2, Users } from "lucide-react";
import { ShareModal } from "../../Community/components/common/ShareModal";

export function ProjectCard({ project }) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Phân loại dự án theo BE
  const isVolunteerOnly = project.projectType === 'VOLUNTEER_ONLY';
  const isFunded = project.projectType === 'FUNDED' || !project.projectType; // Fallback an toàn cho dự án cũ

  // Logic dữ liệu: FUNDED
  const currentAmount = project.currentAmount || 0;
  const targetAmount = project.targetAmount || 0;
  const fundingPercent = targetAmount > 0
    ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
    : 0;

  // Logic dữ liệu: VOLUNTEER_ONLY
  const currentVolunteers = project?.stats?.currentVolunteers || 0;
  const targetVolunteers = project?.stats?.targetVolunteers || 0;
  const volunteerPercent = targetVolunteers > 0
    ? Math.min(Math.round((currentVolunteers / targetVolunteers) * 100), 100)
    : 0;

  const getCategoryStyles = (cat) => {
    const styles = {
      Y_TE: "bg-card-blue-bg text-blue-800",
      GIAO_DUC: "bg-card-purple-bg text-purple-800",
      MOI_TRUONG: "bg-card-green-bg text-green-800",
      THIEN_TAI: "bg-red-50 text-red-800",
      XAY_DUNG: "bg-card-yellow-bg text-amber-800",
    };
    return styles[cat] || "bg-slate-100 text-slate-800";
  };

  const catStyle = getCategoryStyles(project.category);
  
  const shareData = {
    entityId: project._id,
    entityModel: "Project",
    title: project.title,
    thumbnail: project.coverMedia?.url || "",
    description: project.summary || project.description || "Hãy cùng chung tay đóng góp cho dự án ý nghĩa này!",
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow group h-full relative">
        <div className="h-48 bg-slate-200 relative overflow-hidden flex-shrink-0">
          <img
            src={project.coverMedia?.url || "/placeholder-project.jpg"}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm ${catStyle}`}>
              {project.category || "Khác"}
            </span>
            {/* Huy hiệu dành riêng cho dự án TNV */}
            {isVolunteerOnly && (
               <span className="bg-emerald-100/90 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm flex items-center gap-1.5 border border-emerald-200/50">
                 <Users size={12} strokeWidth={2.5} /> Tình nguyện
               </span>
            )}
          </div>

          {project.isUrgent && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm tracking-wide">
              KHẨN CẤP
            </span>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h4 className="font-bold text-slate-900 mb-2 text-lg line-clamp-2 group-hover:text-amber-600 transition-colors">
            <Link
              to={`/projects/${project._id}`}
              className="focus:outline-none before:absolute before:inset-0"
            >
              {project.title}
            </Link>
          </h4>

          <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-6">
            <MapPin size={16} className="flex-shrink-0" />
            <span className="truncate">
              {project.location?.address || "Chưa cập nhật địa điểm"}
            </span>
          </div>

          <div className="mt-auto relative z-10">
            {/* UI TIẾN ĐỘ GÂY QUỸ (FUNDED) */}
            {isFunded && (
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-900">
                    {currentAmount.toLocaleString()} đ{" "}
                    <span className="text-slate-500 text-xs font-normal">đã góp</span>
                  </span>
                  <span className="text-amber-500">{fundingPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${fundingPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* UI TIẾN ĐỘ TÌNH NGUYỆN VIÊN (VOLUNTEER_ONLY) */}
            {isVolunteerOnly && (
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-900">
                    {currentVolunteers.toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ {targetVolunteers} TNV</span>
                  </span>
                  <span className="text-emerald-600">{volunteerPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${volunteerPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                to={`/projects/${project._id}`}
                className="flex-1 flex items-center justify-center py-3 px-4 text-center text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Chi tiết
              </Link>
              
              {isFunded ? (
                <button className="flex-1 py-3 px-4 text-sm font-bold text-slate-900 bg-amber-400 rounded-xl hover:bg-amber-500 transition-colors shadow-sm shadow-amber-500/20">
                  Đóng góp
                </button>
              ) : (
                <Link 
                  to={`/projects/${project._id}?tab=volunteer`}
                  className="flex-1 flex items-center justify-center py-3 px-4 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
                >
                  Tham gia
                </Link>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsShareOpen(true);
                }}
                className="flex items-center justify-center px-4 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sharedData={shareData}
        initialText={`Dự án ý nghĩa: "${project.title}". Mọi người cùng chung tay nhé! 🚀`}
      />
    </>
  );
}