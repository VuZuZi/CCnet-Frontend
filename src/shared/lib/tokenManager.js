import { jwtDecode } from "jwt-decode";
import { SESSION_STORAGE_KEYS } from "@/shared/constants/storage"; 
let inMemoryToken = null;

export const tokenManager = {
  getAccessToken: () => {
    if (inMemoryToken) return inMemoryToken;
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(SESSION_STORAGE_KEYS.ACCESS_TOKEN);
      if (storedToken) {
        inMemoryToken = storedToken; 
        return storedToken;
      }
    }
    return null;
  },

  setAccessToken: (token) => {
    inMemoryToken = token;
    if (token) {
      localStorage.setItem(SESSION_STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEYS.ACCESS_TOKEN);
    }
  },
  removeAccessToken: () => {
    inMemoryToken = null;
    localStorage.removeItem(SESSION_STORAGE_KEYS.ACCESS_TOKEN);
  },

  decodeToken: (token) => {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime + 30; 
    } catch (error) {
      return true;
    }
  }
};