import httpClient from '@/shared/lib/httpClient';

export const projectAPI = {
  async createProject(data) {
    const response = await httpClient.post('/projects', data);
    return response.data;
  },

  async getProjects(params = {}) {
    const response = await httpClient.get('/projects', { params });
    return response.data;
  },

  async getMyProjects(params = {}) {
    const response = await httpClient.get('/projects/my', { params });
    return response.data;
  },

  async getProjectById(id) {
    const response = await httpClient.get(`/projects/${id}`);
    return response.data;
  },

  async updateProject(id, data) {
    const response = await httpClient.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id) {
    const response = await httpClient.delete(`/projects/${id}`);
    return response.data;
  },
};
