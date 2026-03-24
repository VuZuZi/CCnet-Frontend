import axios from "axios";

export const bankAPI = {
  async getVietnamBanks() {
    const res = await axios.get("https://api.vietqr.io/v2/banks", {
      timeout: 10000,
    });

    return Array.isArray(res?.data?.data) ? res.data.data : [];
  },
};

export default bankAPI;