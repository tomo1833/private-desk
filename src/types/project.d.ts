export interface Project {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  display_order: number;
  parent_id: number | null;
  subtasks?: Task[];
  created_at: string;
  updated_at: string;
}
