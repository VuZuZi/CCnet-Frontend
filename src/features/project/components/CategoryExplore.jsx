import { HeartPulse, GraduationCap, TreePine, LifeBuoy, LayoutGrid } from 'lucide-react';

export function CategoryExplore() {
  const categories = [
    {
      id: 'medical',
      title: 'Y tế & Sức khỏe',
      count: '124 Dự án',
      icon: <HeartPulse className="text-blue-500" size={32} />,
      bgClass: 'bg-card-blue-bg border-blue-100',
      textClass: 'text-blue-900',
      subTextClass: 'text-blue-700',
    },
    {
      id: 'education',
      title: 'Giáo dục',
      count: '86 Dự án',
      icon: <GraduationCap className="text-purple-500" size={32} />,
      bgClass: 'bg-card-purple-bg border-purple-100',
      textClass: 'text-purple-900',
      subTextClass: 'text-purple-700',
    },
    {
      id: 'environment',
      title: 'Môi trường',
      count: '52 Dự án',
      icon: <TreePine className="text-green-500" size={32} />,
      bgClass: 'bg-card-green-bg border-green-100',
      textClass: 'text-green-900',
      subTextClass: 'text-green-700',
    },
    {
      id: 'emergency',
      title: 'Cứu trợ khẩn cấp',
      count: '18 Dự án',
      icon: <LifeBuoy className="text-red-500" size={32} />,
      bgClass: 'bg-red-50 border-red-100',
      textClass: 'text-red-900',
      subTextClass: 'text-red-700',
    }
  ];

  return (
    <section className="mb-12 mt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <LayoutGrid className="text-amber-500" size={24} /> Khám phá theo danh mục
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`${cat.bgClass} p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow border group`}
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <h3 className={`font-bold ${cat.textClass}`}>{cat.title}</h3>
            <p className={`text-xs mt-1 font-medium ${cat.subTextClass}`}>{cat.count}</p>
          </div>
        ))}
      </div>
    </section>
  );
}