import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import { X } from 'lucide-react';
import { useProfileForm } from '../../hooks/useProfileForm';

export function EditProfileModal({ isOpen, onClose, user }) {
  const { form, onSubmit, isSubmitting } = useProfileForm(user, onClose);
  const { register, formState: { errors } } = form;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={onClose} 
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="edit-profile-title" className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="edit-profile-form" onSubmit={onSubmit} className="space-y-5">
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
              <input 
                id="fullName"
                type="text" 
                {...register('fullName')} 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="headline" className="block text-sm font-bold text-gray-700 mb-1">Headline (Short Bio)</label>
              <input 
                id="headline"
                type="text" 
                {...register('headline')} 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.headline ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                placeholder="Environmental advocate..."
              />
              {errors.headline && <p className="text-red-500 text-xs mt-1 font-medium">{errors.headline.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input 
                  id="location"
                  type="text" 
                  {...register('location')} 
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.location ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                  placeholder="Portland, Oregon"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  id="phone"
                  type="text" 
                  {...register('phone')} 
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-bold text-gray-700 mb-1">Skills</label>
              <input 
                id="skills"
                type="text" 
                {...register('skills')} 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.skills ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                placeholder="Medical, Logistics, First Aid (comma separated)"
              />
              <p className="text-gray-400 text-xs mt-1">Separate skills with commas.</p>
              {errors.skills && <p className="text-red-500 text-xs mt-1 font-medium">{errors.skills.message}</p>}
            </div>

            <div>
              <label htmlFor="about" className="block text-sm font-bold text-gray-700 mb-1">About Me</label>
              <textarea 
                id="about"
                {...register('about')} 
                rows={4}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none ${errors.about ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                placeholder="Write a little bit about your journey and passion..."
              />
              {errors.about && <p className="text-red-500 text-xs mt-1 font-medium">{errors.about.message}</p>}
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="edit-profile-form" 
            variant="primary" 
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}