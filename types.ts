export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface Feature {
  name: string;
  userStory: string;
  acceptanceCriteria: string[];
  priority: 'High' | 'Medium' | 'Low';
}

export interface DataModelEntity {
  name: string;
  description: string;
  attributes: string[];
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  deployment: string;
}

export interface MVPScope {
  mustHave: string[];
  shouldHave: string[];
  couldHave: string[];
  wontHave: string[];
}

export interface PRDResponse {
  appName: string;
  tagline: string;
  summary: string;
  targetUsers: string[];
  features: Feature[];
  techStack: TechStack;
  dataModels: DataModelEntity[];
  userFlow: string; // Markdown description of flow
  mvpScope: MVPScope;
  cursorPrompt: string; // The "Golden Prompt" for Cursor
  replitPrompt: string; // The Agent instructions for Replit/Lovable
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team';
}

export interface Project {
  id: string;
  name: string;
  summary: string;
  createdAt: number;
  data: PRDResponse;
}

// Navigation Tabs
export enum Tab {
  SUMMARY = 'Summary',
  FEATURES = 'Features',
  TECH_DATA = 'Tech & Data',
  FLOW = 'User Flow',
  PROMPTS = 'IDE Prompts'
}