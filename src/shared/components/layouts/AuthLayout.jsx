import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { ROUTES } from '@/shared/constants/routes';
import { CCNetLogo } from '@/shared/components/ui/Logo/CCNetLogo';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100/50 p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      
      <div className="w-full max-w-[1200px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row overflow-hidden relative min-h-[650px]">
        
        <Link 
          to={ROUTES.HOME} 
          className="absolute top-6 right-6 lg:top-8 lg:right-8 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 hover:scale-105 transition-all text-slate-600"
        >
          <X size={20} strokeWidth={2.5} />
        </Link>

        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col relative bg-gradient-to-br from-white to-amber-50/20">
          
          <Link to={ROUTES.HOME} className="flex items-center gap-3 mb-12 w-fit hover:opacity-80 transition-opacity">
            <CCNetLogo className="w-10 h-10 shadow-sm rounded-xl" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900">CCNet</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <header className="mb-8 text-center lg:text-left">
              <h2 className="text-[2rem] font-bold mb-2 text-slate-900 tracking-tight leading-tight">{title}</h2>
              <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
            </header>

            {children}
          </div>
        </div>

        <div className="hidden lg:block w-1/2 p-4 lg:p-6 pl-0">
          <div className="w-full h-full relative rounded-[2rem] overflow-hidden bg-slate-100">
             <img 
               src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
               alt="Team collaboration" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent mix-blend-multiply"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};