import { jwtDecode } from "jwt-decode"; 

let accessToken = null;

export const tokenManager = {
  getAccessToken: () => accessToken,
  
  setAccessToken: (token) => {
    accessToken = token;
  },
  
  removeAccessToken: () => {
    accessToken = null;
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
      return decoded.exp < currentTime + 10; 
    } catch (error) {
      return true;
    }
  }
};