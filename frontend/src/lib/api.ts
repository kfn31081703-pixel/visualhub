import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  Project,
  Episode,
  Job,
  Character,
  DashboardStats,
  CreateProjectForm,
  CreateEpisodeForm,
  GenerateWebtoonForm,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://toonverse.store/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health Check
  async health(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    const { data } = await this.client.get('/health');
    return data;
  }

  // Projects
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const { data } = await this.client.get('/projects');
    return data;
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    const { data } = await this.client.get(`/projects/${id}`);
    return data;
  }

  async createProject(payload: CreateProjectForm): Promise<ApiResponse<Project>> {
    const { data } = await this.client.post('/projects', payload);
    return data;
  }

  async updateProject(id: number, payload: Partial<CreateProjectForm>): Promise<ApiResponse<Project>> {
    const { data } = await this.client.put(`/projects/${id}`, payload);
    return data;
  }

  async deleteProject(id: number): Promise<ApiResponse<null>> {
    const { data } = await this.client.delete(`/projects/${id}`);
    return data;
  }

  // Episodes
  async getEpisodes(projectId?: number): Promise<ApiResponse<Episode[]>> {
    const url = projectId ? `/projects/${projectId}/episodes` : '/episodes';
    const { data } = await this.client.get(url);
    return data;
  }

  async getEpisode(id: number): Promise<ApiResponse<Episode>> {
    const { data } = await this.client.get(`/episodes/${id}`);
    return data;
  }

  async createEpisode(projectId: number, payload: CreateEpisodeForm): Promise<ApiResponse<Episode>> {
    const { data } = await this.client.post(`/projects/${projectId}/episodes`, payload);
    return data;
  }

  async updateEpisode(id: number, payload: Partial<CreateEpisodeForm>): Promise<ApiResponse<Episode>> {
    const { data} = await this.client.put(`/episodes/${id}`, payload);
    return data;
  }

  async deleteEpisode(id: number): Promise<ApiResponse<null>> {
    const { data } = await this.client.delete(`/episodes/${id}`);
    return data;
  }

  // Generate Webtoon (1-Click)
  async generateWebtoon(episodeId: number, payload: GenerateWebtoonForm): Promise<ApiResponse<{ job_id: number }>> {
    const { data } = await this.client.post(`/episodes/${episodeId}/generate-full`, payload);
    return data;
  }

  // Jobs
  async getJobs(params?: { episode_id?: number; status?: string; type?: string }): Promise<ApiResponse<Job[]>> {
    const { data } = await this.client.get('/jobs', { params });
    return data;
  }

  async getJob(id: number): Promise<ApiResponse<Job>> {
    const { data } = await this.client.get(`/jobs/${id}`);
    return data;
  }

  async retryJob(id: number): Promise<ApiResponse<Job>> {
    const { data } = await this.client.post(`/jobs/${id}/retry`);
    return data;
  }

  // Characters
  async getCharacters(projectId: number): Promise<ApiResponse<Character[]>> {
    const { data } = await this.client.get(`/projects/${projectId}/characters`);
    return data;
  }

  async getCharacter(id: number): Promise<ApiResponse<Character>> {
    const { data } = await this.client.get(`/characters/${id}`);
    return data;
  }

  async createCharacter(projectId: number, payload: Omit<Character, 'id' | 'project_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Character>> {
    const { data } = await this.client.post(`/projects/${projectId}/characters`, payload);
    return data;
  }

  async updateCharacter(id: number, payload: Partial<Character>): Promise<ApiResponse<Character>> {
    const { data } = await this.client.put(`/characters/${id}`, payload);
    return data;
  }

  async deleteCharacter(id: number): Promise<ApiResponse<null>> {
    const { data } = await this.client.delete(`/characters/${id}`);
    return data;
  }

  // Dashboard
  async getDashboardStats(date?: string): Promise<ApiResponse<DashboardStats>> {
    const params = date ? { date } : {};
    const { data } = await this.client.get('/dashboard/stats', { params });
    return data;
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export helper functions
export const getStorageUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  return `https://toonverse.store${path}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
