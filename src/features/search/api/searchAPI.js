import httpClient from "@/shared/lib/httpClient";

function unwrapResponse(res) {
  return res?.data?.data ?? res?.data ?? res ?? {};
}

async function search(params) {
  const res = await httpClient.get("/search", { params });
  return unwrapResponse(res);
}

async function markCommunityPostViewed(postId) {
  const res = await httpClient.post(`/search/community-posts/${postId}/view`);
  return unwrapResponse(res);
}

export const searchAPI = {
  search,

  globalSearch(params) {
    return search(params);
  },

  searchPage(params) {
    return search(params);
  },

  markCommunityPostViewed,
};

export default searchAPI;