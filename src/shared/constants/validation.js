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
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  
  EMAIL: {
    INVALID: 'Please enter a valid email address',
    REQUIRED: 'Email is required',
  },
  
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: `Password must be at least ${VALIDATION_LIMITS.PASSWORD.MIN} characters`,
    WEAK: 'Password must contain uppercase, lowercase, number, and special character',
    MISMATCH: 'Passwords do not match',
  },
  
  FULL_NAME: {
    REQUIRED: 'Full name is required',
    MIN_LENGTH: `Name must be at least ${VALIDATION_LIMITS.FULL_NAME.MIN} characters`,
    MAX_LENGTH: `Name must not exceed ${VALIDATION_LIMITS.FULL_NAME.MAX} characters`,
  },
  
  OTP: {
    REQUIRED: 'OTP is required',
    INVALID: `OTP must be ${VALIDATION_LIMITS.OTP.LENGTH} digits`,
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
};