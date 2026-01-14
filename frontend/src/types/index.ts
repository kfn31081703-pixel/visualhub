// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Project Types
export interface Project {
  id: number;
  title: string;
  genre: string;
  target_country: string;
  tone: string;
  target_audience: string;
  keywords: string[];
  world_setting?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  episode_count?: number;
}

// Episode Types
export interface Episode {
  id: number;
  project_id: number;
  episode_number: number;
  title: string;
  synopsis?: string;
  script_text?: string;
  storyboard_json?: Storyboard;
  status: 'draft' | 'queued' | 'running' | 'done' | 'failed';
  generation_metadata?: GenerationMetadata;
  created_at: string;
  updated_at: string;
  project?: Project;
  assets?: Asset[];
}

// Storyboard Types
export interface Storyboard {
  panels: Panel[];
  total_panels: number;
  estimated_scroll_length?: number;
}

export interface Panel {
  panel_number: number;
  scene: string;
  location: string;
  characters: string[];
  action: string;
  dialogue?: string;
  camera_angle: string;
  mood: string;
  visual_prompt: string;
}

// Generation Metadata
export interface GenerationMetadata {
  word_count?: number;
  scenes_count?: number;
  estimated_panels?: number;
  generated_at?: string;
  packaged_at?: string;
}

// Job Types
export interface Job {
  id: number;
  episode_id?: number;
  type: JobType;
  status: 'queued' | 'running' | 'done' | 'failed';
  input_json?: any;
  output_json?: any;
  error_message?: string;
  cost_units: number;
  retry_count: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  episode?: Episode;
  project?: Project;
}

export type JobType =
  | 'text.script'
  | 'director.storyboard'
  | 'image.render'
  | 'lettering.apply'
  | 'packaging.webtoon'
  | 'pipeline.full';

// Asset Types
export interface Asset {
  id: number;
  episode_id: number;
  type: AssetType;
  path: string;
  url?: string;
  file_size?: number;
  meta_json?: any;
  created_at: string;
}

export type AssetType =
  | 'script'
  | 'storyboard'
  | 'panel'
  | 'lettered_panel'
  | 'final_webtoon'
  | 'thumbnail'
  | 'short'
  | 'audio';

// Character Types
export interface Character {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  reference_images?: string[];
  style_preset?: string;
  appearance?: string;
  personality?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  today: {
    episodes_created: number;
    jobs_completed: number;
    success_rate: number;
    avg_cost: number;
  };
  by_status: {
    queued: number;
    running: number;
    done: number;
    failed: number;
  };
  by_type: Record<JobType, number>;
}

// Form Types
export interface CreateProjectForm {
  title: string;
  genre: string;
  target_country: string;
  tone: string;
  target_audience: string;
  keywords: string[];
  world_setting?: string;
}

export interface CreateEpisodeForm {
  episode_number: number;
  title: string;
  synopsis?: string;
}

export interface GenerateWebtoonForm {
  keywords: string[];
  target_word_count: number;
  target_panels: number;
}

// Pagination
export interface PaginationMeta {
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}
