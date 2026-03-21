import { Users, ChevronLeft, ChevronRight, MapPin, Globe } from 'lucide-react';

export function VolunteerCall() {
  const volunteers = [
    {
      id: 1,
      title: 'Ngày hội dọn dẹp công viên',
      location: 'Hà Nội',
      isOnline: false,
      desc: 'Tham gia sáng kiến làm sạch cộng đồng hàng tháng của chúng tôi tại Công viên Thống Nhất.',
      current: 8,
      target: 10,
      image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80f419e?q=80&w=600&auto=format&fit=crop',
      color: 'green'
    },
    {
      id: 2,
      title: 'Phân phát thực phẩm cuối tuần',
      location: 'TP.HCM',
      isOnline: false,
      desc: 'Hỗ trợ tổ chức và phân phát các gói thực phẩm cho các gia đình khó khăn trong cuối tuần này.',
      current: 2,
      target: 15,
      image: 'https://images.unsplash.com/photo-1593113565214-80afcb4a4288?q=80&w=600&auto=format&fit=crop',
      color: 'yellow'
    },
    {
      id: 3,
      title: 'Dạy tin học cho người cao tuổi',
      location: 'Trực tuyến',
      isOnline: true,
      desc: 'Hướng dẫn các kỹ năng máy tính cơ bản cho người cao tuổi qua các buổi học 1 kèm 1 trực tuyến.',
      current: 18,
      target: 20,
      image: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=600&auto=format&fit=crop',
      color: 'blue'
    },
    {
      id: 4,
      title: 'Hỗ trợ trạm cứu hộ động vật',
      location: 'Đà Nẵng',
      isOnline: false,
      desc: 'Hỗ trợ dắt chó đi dạo, cho ăn và dọn dẹp, bảo trì trạm cứu hộ chung.',
      current: 5,
      target: 5,
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop',
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const map = {
      green: { bg: 'bg-card-green-bg', border: 'border-green-100', text: 'text-green-900', barBg: 'bg-green-200', barFill: 'bg-green-500', icon: 'text-green-600' },
      yellow: { bg: 'bg-card-yellow-bg', border: 'border-amber-100', text: 'text-amber-900', barBg: 'bg-amber-200', barFill: 'bg-amber-500', icon: 'text-amber-600' },
      blue: { bg: 'bg-card-blue-bg', border: 'border-blue-100', text: 'text-blue-900', barBg: 'bg-blue-200', barFill: 'bg-blue-500', icon: 'text-blue-600' },
      purple: { bg: 'bg-card-purple-bg', border: 'border-purple-100', text: 'text-purple-900', barBg: 'bg-purple-200', barFill: 'bg-purple-500', icon: 'text-purple-600' }
    };
    return map[color] || map.green;
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="text-emerald-500" size={24} /> Kêu gọi tình nguyện viên
        </h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-slate-50 border border-slate-200 transition-colors">
            <ChevronLeft className="text-slate-600" size={20} />
          </button>
          <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-slate-50 border border-slate-200 transition-colors">
            <ChevronRight className="text-slate-600" size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
        {volunteers.map((vol) => {
          const colors = getColorClasses(vol.color);
          const percent = Math.round((vol.current / vol.target) * 100);
          const isFull = vol.current >= vol.target;

          return (
            <div key={vol.id} className="snap-start min-w-[300px] w-[300px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col">
              <div className="h-32 bg-slate-200 relative">
                <img alt={vol.title} className="w-full h-full object-cover" src={vol.image} loading="lazy" />
                <span className="absolute top-3 right-3 bg-white/90 text-slate-900 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm shadow-sm">
                  {vol.isOnline ? <Globe size={14} /> : <MapPin size={14} />} {vol.location}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-bold text-slate-900 mb-2 text-lg line-clamp-1">{vol.title}</h4>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{vol.desc}</p>
                
                <div className="mt-auto">
                  <div className={`flex items-center gap-2 mb-4 ${colors.bg} p-3 rounded-xl border ${colors.border}`}>
                    <Users className={colors.icon} size={20} />
                    <div className="flex-1">
                      <div className={`flex justify-between text-xs font-bold ${colors.text} mb-1.5`}>
                        <span>Cần tuyển</span>
                        <span>{vol.current}/{vol.target}</span>
                      </div>
                      <div className={`w-full h-1.5 ${colors.barBg} rounded-full overflow-hidden`}>
                        <div className={`h-full ${colors.barFill} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {isFull ? (
                    <button className="w-full py-3 px-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl cursor-not-allowed border border-slate-200" disabled>
                      Đã đủ số lượng
                    </button>
                  ) : (
                    <button className="w-full py-3 px-4 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                      Đăng ký tham gia
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}