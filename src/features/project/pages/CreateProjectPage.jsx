import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi';
import { useCreateProject } from '../hooks/useCreateProject';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { ProjectBasicInfoForm } from '../components/ProjectBasicInfoForm';
import { ProjectGoalsForm } from '../components/ProjectGoalsForm';
import { ProjectDateForm } from '../components/ProjectDateForm';
import { Button } from '@/shared/components/ui/Button/Button';

const initialValues = {
  title: '',
  description: '',
  financialGoal: '',
  startDate: '',
  endDate: '',
};

const validationSchema = {
  title: [validators.projectTitle],
  description: [validators.projectDescription],
  financialGoal: [validators.financialGoal],
  endDate: [validators.endDateAfterStart],
};

export function CreateProjectPage() {
  const navigate = useNavigate();
  const { createProject, isLoading, isError, errorMessage } = useCreateProject();
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    validateAll 
  } = useFormValidation(initialValues, validationSchema);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateAll()) {
      const projectData = {
        title: values.title.trim(),
        description: values.description?.trim() || '',
        financialGoal: values.financialGoal ? parseFloat(values.financialGoal) : 0,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        status: saveAsDraft ? 'draft' : 'pending',
      };
      
      createProject(projectData);
    }
  };

  const handleSaveDraft = () => {
    setSaveAsDraft(true);
    setTimeout(() => {
      document.getElementById('create-project-form')?.requestSubmit();
    }, 0);
  };

  const handlePublish = () => {
    setSaveAsDraft(false);
  };

  return (
    <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
      <div className="w-full max-w-3xl mx-auto">
        
        {/* Back Link */}
        <Link to={ROUTES.PROJECTS} className="inline-flex items-center gap-2 text-gray hover:text-black mb-6 transition-colors font-medium no-underline">
          <FiArrowLeft size={18} />
          <span>Back to Campaigns</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Create New Campaign</h1>
          <p className="text-gray text-base">
            Start a fundraising campaign to support your cause and make a difference
          </p>
        </div>

        {/* Error Alert */}
        {isError && errorMessage && (
          <div className="bg-[#f8d7da] text-[#842029] p-4 rounded-lg mb-6 border border-[#f5c2c7]">
            {errorMessage}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-light-gray transition-all duration-200 focus-within:shadow-md flex flex-col">
          <form id="create-project-form" onSubmit={handleSubmit} noValidate>
            <fieldset disabled={isLoading}>
              
              {/* Basic Info Section */}
              <ProjectBasicInfoForm
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />

              {/* Goals Section */}
              <ProjectGoalsForm
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />

              {/* Date Section */}
              <ProjectDateForm
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />

              {/* Form Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-[#fafafa] rounded-b-2xl gap-4">
                <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(ROUTES.PROJECTS)}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outlineDark"
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <FiFileText size={16} />
                    Save as Draft
                  </Button>
                </div>
                <Button
                  type="submit"
                  variant="yellow"
                  disabled={isLoading}
                  onClick={handlePublish}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>

            </fieldset>
          </form>
        </div>

      </div>
    </div>
  );
}