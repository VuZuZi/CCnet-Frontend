import { jwtDecode } from "jwt-decode";

let inMemoryToken = null;

export const tokenManager = {
  getAccessToken: () => {
    return inMemoryToken;
  },

  setAccessToken: (token) => {
    inMemoryToken = token;
  },
  
  removeAccessToken: () => {
    inMemoryToken = null;
  },

  decodeToken: (token) => {
    try {
      return token ? jwtDecode(token) : null;
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