import httpClient from '@/shared/lib/httpClient';

export const projectAPI = {
  async getProjects(params = {}) {
    const { type, status, q } = params;
    const query = new URLSearchParams();
    
    if (type && type !== 'all') query.append('type', type);
    if (status && status !== 'all') query.append('status', status);
    if (q && q.trim()) query.append('q', q.trim());

    const queryString = query.toString();
    const url = queryString ? `/projects?${queryString}` : '/projects';
    
    const res = await httpClient.get(url);
    return res.data.data.projects;
  },
};

export default projectAPI;
