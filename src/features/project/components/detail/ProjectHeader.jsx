import { Plus, Edit2, BadgeCheck } from 'lucide-react';

export function ProjectHeader({ project, isOrganizer }) {
  return (
    <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
          {project?.title || 'Đang cập nhật tên dự án...'}
        </h1>

        {isOrganizer && (
          <button className="flex-shrink-0 p-3 bg-[#FFFBEB] border border-[#FBBF24]/20 rounded-2xl hover:bg-[#FFF7D6] transition-colors">
            <Edit2 className="text-[#B45309] w-5 h-5" />
          </button>
        )}
      </div>

      {!isOrganizer && (
        <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-green-200 text-green-700 font-bold text-xl">
              {project?.organizerId?.avatar ? (
                <img
                  src={project.organizerId.avatar}
                  alt="Organizer"
                  className="w-full h-full object-cover"
                />
              ) : (
                project?.organizerId?.fullName?.charAt(0) || 'O'
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg text-gray-900">
                  {project?.organizerId?.fullName || 'Tổ chức ẩn danh'}
                </h3>
                {project?.organizerId?.isVerified && (
                  <BadgeCheck className="text-blue-500 w-5 h-5" />
                )}
              </div>
              <p className="text-sm text-gray-500">Đơn vị tổ chức</p>
            </div>
          </div>

          <button className="hidden sm:flex items-center gap-1 py-2 px-4 text-sm font-bold text-gray-700 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <Plus className="w-5 h-5" /> Follow
          </button>
        </div>
      )}
    </div>
  );
}