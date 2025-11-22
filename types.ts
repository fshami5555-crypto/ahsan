
export type Role = 'ADMIN' | 'CHARITY_MANAGER' | 'EMPLOYEE';
export type JobRole = 'MANAGER' | 'PROJECT_MANAGER' | 'EMPLOYEE' | 'ACCOUNTANT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED';
export type ActivityType = 'COMMENT' | 'HISTORY' | 'UPLOAD';

export interface Permission {
  id: string;
  label: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Stored for demo purposes
  role: Role;
  jobRole?: JobRole; // Specific job title
  name: string;
  charityId?: string; // If user belongs to a charity
  permissions?: string[]; // Array of permission IDs
}

export interface Charity {
  id: string;
  name: string;
  username: string; // Used for login
  password?: string; // In a real app, never store plain text
  logo: string;
  memberCount: number;
}

export interface Project {
  id: string;
  title: string;
  deadline: string;
  managerName: string;
  managerId?: string; // Link to user
  charityId: string;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  charityId: string;
  projectId?: string; // Linked project
  assigneeId?: string; // Employee ID
  assigneeName?: string;
  isFromAdmin: boolean; // If true, it appears in "Projects/Incoming" first
  createdAt: number;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  type: ActivityType;
  content: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string; // 'admin' or charityId
  senderName: string;
  receiverId: string; // 'admin' or charityId
  subject: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export const LOGO_URL = "https://play-lh.googleusercontent.com/2zmdwArs3eElnq-Xtc7fbXFkT637S5aCOCnL4-yEQjrBCkSIY1yhzATDxkgyGoQr7fo";

export interface AppState {
  currentUser: User | null;
  theme: 'light' | 'dark';
  fontSize: 'normal' | 'large';
}

export const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'manage_tasks', label: 'إدارة المهام' },
  { id: 'manage_projects', label: 'إدارة المشاريع' },
  { id: 'view_reports', label: 'عرض التقارير' },
  { id: 'manage_team', label: 'إدارة الفريق' },
  { id: 'manage_financials', label: 'الإدارة المالية' },
];
