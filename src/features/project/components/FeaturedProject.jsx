import { AlertTriangle, Heart, ArrowRight } from 'lucide-react';

export function FeaturedProject() {
  return (
    <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-12">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 relative h-64 lg:h-auto min-h-[400px]">
          <img
            alt="Urgent Project Cover"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1600&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10"></div>
        </div>

        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 border border-red-100">
              <AlertTriangle size={14} strokeWidth={2.5} /> Urgent Appeal
            </span>
            <span className="text-sm font-medium text-slate-500">Ends in 3 days</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Save the Amazon: Emergency Reforestation Initiative
          </h1>

          <p className="text-slate-600 mb-8 text-lg">
            Help us plant 10,000 trees to restore vital habitats destroyed by recent wildfires. Every dollar plants a tree.
          </p>

          <div className="mb-8">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-900 text-lg">
                $75,000 <span className="text-slate-500 text-sm font-medium">raised of $100,000</span>
              </span>
              <span className="text-amber-500 text-lg">75%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full relative"
                style={{ width: '75%' }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 py-4 px-6 text-base font-bold text-slate-900 bg-amber-400 rounded-xl hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/30 flex justify-center items-center gap-2">
              <Heart size={20} fill="currentColor" /> Donate Now
            </button>
            <button className="flex-1 py-4 px-6 text-base font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex justify-center items-center gap-2">
              View Details <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}