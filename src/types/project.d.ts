export interface Project {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  displayOrder: number;
  parentId: number | null;
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}
