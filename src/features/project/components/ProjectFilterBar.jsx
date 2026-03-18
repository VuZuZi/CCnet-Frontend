import { LayoutGrid, Search, Loader2, ChevronDown } from 'lucide-react';

export function ProjectFilterBar({ 
  localLocation, 
  setLocalLocation, 
  filters, 
  onCategoryChange, 
  isFetching 
}) {
  return (
    <div className="sticky top-20 z-40 bg-slate-50/95 backdrop-blur-md py-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <LayoutGrid className="text-amber-500" size={24} /> Khám phá tất cả dự án
      </h2>
      
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none min-w-[220px]">
          {isFetching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" size={18} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          )}
          <input 
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            placeholder="Tìm theo địa điểm..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium text-slate-700 shadow-sm"
          />
        </div>
        
        <div className="relative flex-1 md:flex-none min-w-[180px]">
          <select 
            value={filters.category}
            onChange={onCategoryChange}
            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium shadow-sm cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Y_TE">Y tế & Sức khỏe</option>
            <option value="GIAO_DUC">Giáo dục</option>
            <option value="MOI_TRUONG">Môi trường</option>
            <option value="THIEN_TAI">Cứu trợ khẩn cấp</option>
            <option value="XAY_DUNG">Xây dựng cầu đường</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>
    </div>
  );
}