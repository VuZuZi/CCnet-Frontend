export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
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
  REQUIRED: 'Trường này là bắt buộc',
  
  EMAIL: {
    INVALID: 'Vui lòng nhập địa chỉ email hợp lệ',
    REQUIRED: 'Vui lòng nhập email',
  },
  
  PASSWORD: {
    REQUIRED: 'Vui lòng nhập mật khẩu',
    MIN_LENGTH: `Mật khẩu phải có ít nhất ${VALIDATION_LIMITS.PASSWORD.MIN} ký tự`,
    WEAK: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
    MISMATCH: 'Mật khẩu không khớp',
  },
  
  FULL_NAME: {
    REQUIRED: 'Vui lòng nhập họ và tên',
    MIN_LENGTH: `Tên phải có ít nhất ${VALIDATION_LIMITS.FULL_NAME.MIN} ký tự`,
    MAX_LENGTH: `Tên không được vượt quá ${VALIDATION_LIMITS.FULL_NAME.MAX} ký tự`,
  },
  
  OTP: {
    REQUIRED: 'Vui lòng nhập mã OTP',
    INVALID: `Mã OTP phải gồm ${VALIDATION_LIMITS.OTP.LENGTH} chữ số`,
  },

  PROJECT: {
    TITLE: {
      REQUIRED: 'Vui lòng nhập tiêu đề chiến dịch',
      MIN_LENGTH: `Tiêu đề phải có ít nhất ${VALIDATION_LIMITS.PROJECT_TITLE.MIN} ký tự`,
      MAX_LENGTH: `Tiêu đề không được vượt quá ${VALIDATION_LIMITS.PROJECT_TITLE.MAX} ký tự`,
    },
    DESCRIPTION: {
      MAX_LENGTH: `Mô tả không được vượt quá ${VALIDATION_LIMITS.PROJECT_DESCRIPTION.MAX} ký tự`,
    },
    FINANCIAL_GOAL: {
      INVALID: 'Mục tiêu tài chính phải là số dương',
    },
    DATE: {
      INVALID: 'Vui lòng nhập ngày hợp lệ',
      END_BEFORE_START: 'Ngày kết thúc phải sau ngày bắt đầu',
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
