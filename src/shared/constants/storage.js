export const SESSION_STORAGE_KEYS = {
  INTENDED_PATH: 'ccnet_intended_path',
};

export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'ccnet_user_preferences',
  THEME: 'ccnet_theme',
  LANGUAGE: 'ccnet_language',
};

export const STORAGE_KEYS = {
  ...SESSION_STORAGE_KEYS,
  ...LOCAL_STORAGE_KEYS,
};