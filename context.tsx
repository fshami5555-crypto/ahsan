
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Charity, Task, User, AppState, Message, Project, TaskActivity, TaskStatus } from './types';

interface DataContextType {
  charities: Charity[];
  tasks: Task[];
  users: User[]; // Employees
  projects: Project[];
  messages: Message[];
  activities: TaskActivity[];
  appState: AppState;
  addCharity: (charity: Charity) => void;
  updateCharity: (id: string, updates: Partial<Charity>) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  addProject: (project: Project) => void;
  addUser: (user: User) => void;
  sendMessage: (msg: Message) => void;
  markMessageRead: (id: string) => void;
  addTaskActivity: (activity: TaskActivity) => void;
  login: (username: string, password: string, portal: 'ADMIN' | 'CHARITY') => boolean;
  logout: () => void;
  toggleTheme: () => void;
  toggleFontSize: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const MOCK_CHARITIES: Charity[] = [
  { id: 'c1', name: 'جمعية البر', username: 'ber', password: '123', logo: 'https://picsum.photos/100/100?random=1', memberCount: 15 },
  { id: 'c2', name: 'جمعية إطعام', username: 'etaam', password: '123', logo: 'https://picsum.photos/100/100?random=2', memberCount: 22 },
];

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', title: 'مشروع إفطار صائم', deadline: '2024-03-10', managerName: 'أحمد محمد', charityId: 'c1', progress: 50 },
];

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'توزيع السلال الغذائية', description: 'توزيع 500 سلة في حي النسيم', status: 'IN_PROGRESS', charityId: 'c1', projectId: 'p1', isFromAdmin: true, createdAt: Date.now() },
  { id: 't2', title: 'تقرير الربع الأول', description: 'إعداد التقرير المالي والإداري', status: 'TODO', charityId: 'c1', isFromAdmin: false, createdAt: Date.now() },
  { id: 't3', title: 'حفل الأيتام', description: 'تجهيز القاعة والهدايا', status: 'APPROVED', charityId: 'c2', isFromAdmin: true, createdAt: Date.now() },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'admin', senderName: 'الإدارة العامة', receiverId: 'c1', subject: 'تذكير بالتقرير السنوي', content: 'يرجى تسليم التقرير قبل نهاية الشهر.', timestamp: Date.now() - 1000000, isRead: false },
  { id: 'm2', senderId: 'c1', senderName: 'جمعية البر', receiverId: 'admin', subject: 'رد: التقرير السنوي', content: 'جاري العمل عليه وسيتم تسليمه في الموعد.', timestamp: Date.now(), isRead: true },
];

const MOCK_USERS: User[] = [
  // Example employee
  { id: 'u1', username: 'emp1', password: '123', name: 'خالد الموظف', role: 'EMPLOYEE', jobRole: 'EMPLOYEE', charityId: 'c1', permissions: ['manage_tasks'] }
];

const MOCK_ACTIVITIES: TaskActivity[] = [
  { id: 'a1', taskId: 't1', userId: 'admin', userName: 'الإدارة العامة', type: 'HISTORY', content: 'تم إنشاء المهمة', timestamp: Date.now() - 100000 },
  { id: 'a2', taskId: 't1', userId: 'u1', userName: 'خالد الموظف', type: 'COMMENT', content: 'تم استلام المهمة وجاري العمل عليها', timestamp: Date.now() }
];

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const [charities, setCharities] = useState<Charity[]>(MOCK_CHARITIES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS); // Employees
  const [activities, setActivities] = useState<TaskActivity[]>(MOCK_ACTIVITIES);
  
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    theme: 'light',
    fontSize: 'normal',
  });

  // Apply theme and font size to body
  useEffect(() => {
    const root = window.document.documentElement;
    if (appState.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (appState.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [appState.theme, appState.fontSize]);

  const addCharity = (charity: Charity) => {
    setCharities([...charities, charity]);
  };

  const updateCharity = (id: string, updates: Partial<Charity>) => {
    setCharities(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
    // Log creation
    addTaskActivity({
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: appState.currentUser?.id || 'system',
      userName: appState.currentUser?.name || 'النظام',
      type: 'HISTORY',
      content: 'تم إنشاء المهمة',
      timestamp: Date.now()
    });
  };

  const updateTask = (updatedTask: Task) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));

    // Auto-log status change
    if (oldTask && oldTask.status !== updatedTask.status) {
      const getStatusLabel = (s: TaskStatus) => {
        switch(s) {
          case 'TODO': return 'قائمة المهام';
          case 'IN_PROGRESS': return 'قيد التنفيذ';
          case 'REVIEW': return 'مراجعة';
          case 'APPROVED': return 'معتمدة';
          default: return s;
        }
      };
      
      addTaskActivity({
        id: `act_${Date.now()}`,
        taskId: updatedTask.id,
        userId: appState.currentUser?.id || 'system',
        userName: appState.currentUser?.name || 'النظام',
        type: 'HISTORY',
        content: `تم تغيير حالة المهمة من "${getStatusLabel(oldTask.status)}" إلى "${getStatusLabel(updatedTask.status)}"`,
        timestamp: Date.now()
      });
    }
  };

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const addUser = (user: User) => {
    setUsers([...users, user]);
  };

  const sendMessage = (msg: Message) => {
    setMessages([msg, ...messages]);
  };

  const markMessageRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const addTaskActivity = (activity: TaskActivity) => {
    setActivities(prev => [...prev, activity]);
  };

  const login = (username: string, pass: string, portal: 'ADMIN' | 'CHARITY'): boolean => {
    if (portal === 'ADMIN') {
      if (username === 'admin' && pass === '123') {
        setAppState(prev => ({ ...prev, currentUser: { id: 'admin', name: 'المدير العام', username: 'admin', role: 'ADMIN' } }));
        return true;
      }
    } else {
      // Charity Login (Manager or Employee)
      // 1. Check Charity Managers (defined in Charity array)
      const charity = charities.find(c => c.username === username && c.password === pass);
      if (charity) {
        setAppState(prev => ({ 
          ...prev, 
          currentUser: { 
            id: charity.id, 
            name: `مدير ${charity.name}`, 
            username: charity.username, 
            role: 'CHARITY_MANAGER', 
            jobRole: 'MANAGER',
            charityId: charity.id,
            permissions: ['manage_tasks', 'manage_projects', 'view_reports', 'manage_team', 'manage_financials'] // All permissions
          } 
        }));
        return true;
      }

      // 2. Check Employees
      const employee = users.find(u => u.username === username && u.password === pass);
      if (employee) {
        setAppState(prev => ({ ...prev, currentUser: employee }));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setAppState(prev => ({ ...prev, currentUser: null }));
  };

  const toggleTheme = () => {
    setAppState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const toggleFontSize = () => {
    setAppState(prev => ({ ...prev, fontSize: prev.fontSize === 'normal' ? 'large' : 'normal' }));
  };

  return (
    <DataContext.Provider value={{ 
      charities, tasks, projects, messages, users, activities, appState, 
      addCharity, updateCharity, addTask, updateTask, addProject, addUser,
      sendMessage, markMessageRead, addTaskActivity, login, logout, toggleTheme, toggleFontSize 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
