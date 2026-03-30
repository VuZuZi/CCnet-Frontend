export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  OTP: /^\d{6}$/,
};

export const VALIDATION_LIMITS = {
  PASSWORD: { MIN: 8, MAX: 128 },
  FULL_NAME: { MIN: 2, MAX: 100 },
  EMAIL: { MAX: 255 },
  OTP: { LENGTH: 6 },
  PROJECT_TITLE: { MIN: 3, MAX: 200 },
  PROJECT_DESCRIPTION: { MAX: 5000 },
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'validation.required',

  EMAIL: {
    INVALID: 'validation.email.invalid',
    REQUIRED: 'validation.email.required',
  },

  PASSWORD: {
    REQUIRED: 'validation.password.required',
    MIN_LENGTH: 'validation.password.min_length',
    WEAK: 'validation.password.weak',
    MISMATCH: 'validation.password.mismatch',
  },

  FULL_NAME: {
    REQUIRED: 'validation.full_name.required',
    MIN_LENGTH: 'validation.full_name.min_length',
    MAX_LENGTH: 'validation.full_name.max_length',
  },

  OTP: {
    REQUIRED: 'validation.otp.required',
    INVALID: 'validation.otp.invalid',
  },

  PROJECT: {
    TITLE: {
      REQUIRED: 'validation.project.title.required',
      MIN_LENGTH: 'validation.project.title.min_length',
      MAX_LENGTH: 'validation.project.title.max_length',
    },
    DESCRIPTION: {
      MAX_LENGTH: 'validation.project.description.max_length',
    },
    FINANCIAL_GOAL: {
      INVALID: 'validation.project.financial_goal.invalid',
    },
    DATE: {
      INVALID: 'validation.project.date.invalid',
      END_BEFORE_START: 'validation.project.date.end_before_start',
    },
  },
};

export const validators = {
  email: (value) => {
    if (!value) return VALIDATION_MESSAGES.EMAIL.REQUIRED;
    if (!VALIDATION_PATTERNS.EMAIL.test(value)) {
      return VALIDATION_MESSAGES.EMAIL.INVALID;
    }
    return null;
  },

  password: (value) => {
    if (!value) return VALIDATION_MESSAGES.PASSWORD.REQUIRED;
    if (value.length < VALIDATION_LIMITS.PASSWORD.MIN) {
      return VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH;
    }
    if (!VALIDATION_PATTERNS.PASSWORD.test(value)) {
      return VALIDATION_MESSAGES.PASSWORD.WEAK;
    }
    return null;
  },

  fullName: (value) => {
    if (!value) return VALIDATION_MESSAGES.FULL_NAME.REQUIRED;
    if (value.length < VALIDATION_LIMITS.FULL_NAME.MIN) {
      return VALIDATION_MESSAGES.FULL_NAME.MIN_LENGTH;
    }
    if (value.length > VALIDATION_LIMITS.FULL_NAME.MAX) {
      return VALIDATION_MESSAGES.FULL_NAME.MAX_LENGTH;
    }
    return null;
  },

  otp: (value) => {
    if (!value) return VALIDATION_MESSAGES.OTP.REQUIRED;
    if (!VALIDATION_PATTERNS.OTP.test(value)) {
      return VALIDATION_MESSAGES.OTP.INVALID;
    }
    return null;
  },

  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return VALIDATION_MESSAGES.REQUIRED;
    }
    return null;
  },

  // Project validators
  projectTitle: (value) => {
    if (!value || !value.trim()) {
      return VALIDATION_MESSAGES.PROJECT.TITLE.REQUIRED;
    }
    if (value.length < VALIDATION_LIMITS.PROJECT_TITLE.MIN) {
      return VALIDATION_MESSAGES.PROJECT.TITLE.MIN_LENGTH;
    }
    if (value.length > VALIDATION_LIMITS.PROJECT_TITLE.MAX) {
      return VALIDATION_MESSAGES.PROJECT.TITLE.MAX_LENGTH;
    }
    return null;
  },

  projectDescription: (value) => {
    if (value && value.length > VALIDATION_LIMITS.PROJECT_DESCRIPTION.MAX) {
      return VALIDATION_MESSAGES.PROJECT.DESCRIPTION.MAX_LENGTH;
    }
    return null;
  },

  financialGoal: (value) => {
    if (value && (isNaN(value) || parseFloat(value) < 0)) {
      return VALIDATION_MESSAGES.PROJECT.FINANCIAL_GOAL.INVALID;
    }
    return null;
  },

  endDateAfterStart: (value, allValues) => {
    if (value && allValues?.startDate) {
      const startDate = new Date(allValues.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        return VALIDATION_MESSAGES.PROJECT.DATE.END_BEFORE_START;
      }
    }
    return null;
  },
};