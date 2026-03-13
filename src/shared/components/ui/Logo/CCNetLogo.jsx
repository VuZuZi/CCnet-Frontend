import PropTypes from 'prop-types';
import { cn } from '@/shared/components/ui/Button/Button';

export function CCNetLogo({ className, iconClassName }) {
  return (
    <div 
      className={cn(
        "bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-amber-500/20 shrink-0", 
        className
      )}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-[60%] h-[60%]", iconClassName)}
      >
        <rect x="3" y="3" width="8" height="8" rx="1.75" fill="white" />
        <rect x="13" y="3" width="8" height="8" rx="1.75" fill="white" />
        <rect x="3" y="13" width="8" height="8" rx="1.75" fill="white" />
        <rect x="13" y="13" width="8" height="8" rx="1.75" fill="white" />
      </svg>
    </div>
  );
}

CCNetLogo.propTypes = {
  className: PropTypes.string,     
  iconClassName: PropTypes.string,
};