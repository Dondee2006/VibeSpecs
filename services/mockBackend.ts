import { PRDResponse, User, Project } from '../types';

const STORAGE_KEYS = {
  USER: 'vibespecs_user',
  PROJECTS: 'vibespecs_projects'
};

// Simulate network delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const auth = {
  async login(email: string, password: string): Promise<User> {
    await delay(800);
    // Mock user generation
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      plan: 'free'
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  async signup(email: string, password: string): Promise<User> {
    await delay(1000);
    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      plan: 'free'
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }
};

export const db = {
  async saveProject(data: PRDResponse): Promise<Project> {
    await delay(600);
    const projects = await this.getProjects();
    
    const newProject: Project = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      name: data.appName,
      summary: data.tagline,
      createdAt: Date.now(),
      data: data
    };

    // Add to beginning of list
    const updatedProjects = [newProject, ...projects];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
    return newProject;
  },

  async getProjects(): Promise<Project[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  },
  
  async deleteProject(id: string): Promise<void> {
    await delay(300);
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  }
};