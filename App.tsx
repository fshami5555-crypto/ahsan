
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { DataProvider, useData } from './context';
import { LOGO_URL, Task, Permission, AVAILABLE_PERMISSIONS, JobRole, Charity } from './types';
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Type, 
  Plus, 
  BarChart3,
  Briefcase,
  Users,
  Mail,
  ArrowLeft,
  Key,
  Shield,
  Send,
  UserCircle,
  X,
  MessageSquare,
  History,
  Paperclip
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import KanbanBoard from './components/KanbanBoard';
import { generateTaskDescription } from './services/geminiService';

// --- COMPONENTS FOR VIEWS ---

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg w-full">
        <img src={LOGO_URL} alt="Ehsan Logo" className="w-48 mx-auto drop-shadow-lg" />
        <h1 className="text-4xl font-bold text-primary-800 mt-4">منصة إحسان</h1>
        <p className="text-xl text-gray-600">لإدارة مهام العمل الخيري</p>
        
        <div className="grid grid-cols-1 gap-4 w-full mt-12">
          <button 
            onClick={() => navigate('/admin-login')}
            className="w-full py-4 px-6 bg-white text-primary-700 text-xl font-semibold rounded-2xl shadow-md hover:shadow-xl border border-primary-100 transition-all flex items-center justify-center gap-3"
          >
            <Building2 className="w-6 h-6" />
            الإدارة العامة
          </button>
          <button 
            onClick={() => navigate('/charity-login')}
            className="w-full py-4 px-6 bg-primary-600 text-white text-xl font-semibold rounded-2xl shadow-lg hover:bg-primary-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <Briefcase className="w-6 h-6" />
            الجمعيات الخيرية
          </button>
        </div>
      </div>
      <footer className="mt-16 text-gray-400 text-sm">
        جميع الحقوق محفوظة © {new Date().getFullYear()} منصة إحسان
      </footer>
    </div>
  );
};

const LoginScreen = ({ type }: { type: 'ADMIN' | 'CHARITY' }) => {
  const { login } = useData();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password, type);
    if (success) {
      navigate(type === 'ADMIN' ? '/admin' : '/charity');
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Logo" className="w-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            {type === 'ADMIN' ? 'دخول الإدارة العامة' : 'دخول الجمعيات والموظفين'}
          </h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={type === 'ADMIN' ? 'admin' : 'اسم المستخدم'}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={type === 'ADMIN' ? '123' : '******'}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            تسجيل الدخول
          </button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-gray-500 text-sm hover:underline">
            العودة للرئيسية
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children, sidebarItems }: { children?: React.ReactNode, sidebarItems: any[] }) => {
  const { logout, appState, toggleTheme, toggleFontSize } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
          <img src={LOGO_URL} className="w-8 h-8" alt="Logo" />
          <span className="font-bold text-primary-700 dark:text-primary-400">منصة إحسان</span>
        </div>
        
        {appState.currentUser?.charityId && (
          <div className="px-6 py-2">
             <span className="text-xs font-bold text-gray-400 block mb-1">المستخدم الحالي</span>
             <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{appState.currentUser.name}</p>
             <p className="text-xs text-primary-600">{appState.currentUser.jobRole === 'MANAGER' ? 'مدير الجمعية' : appState.currentUser.jobRole}</p>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
           <div className="flex gap-2 justify-center pb-4">
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
               {appState.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button onClick={toggleFontSize} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
               <Type size={20} />
             </button>
           </div>
           <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
           >
             <LogOut size={18} />
             تسجيل خروج
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-gray-800 z-20 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
         <img src={LOGO_URL} className="w-8 h-8" alt="Logo" />
         <button onClick={handleLogout} className="text-red-600"><LogOut size={20} /></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:mr-64 p-4 md:p-8 mt-16 md:mt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

// --- SHARED COMPONENTS ---

const TaskDetailModal = ({ task, onClose }: { task: Task | null, onClose: () => void }) => {
  const { activities, addTaskActivity, appState } = useData();
  const [comment, setComment] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!task) return null;

  const taskActivities = activities.filter(a => a.taskId === task.id).sort((a,b) => a.timestamp - b.timestamp);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !appState.currentUser) return;

    addTaskActivity({
      id: `act_${Date.now()}`,
      taskId: task.id,
      userId: appState.currentUser.id,
      userName: appState.currentUser.name,
      type: 'COMMENT',
      content: comment,
      timestamp: Date.now()
    });
    setComment('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [taskActivities]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-gray-700">
        
        {/* Left Side: Task Details */}
        <div className="w-full md:w-2/3 p-6 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold dark:text-white mb-2">{task.title}</h2>
              <div className="flex items-center gap-2">
                 <span className={`px-2 py-1 rounded text-xs ${
                   task.status === 'TODO' ? 'bg-gray-100 text-gray-600' :
                   task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                   task.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-600' :
                   'bg-green-100 text-green-600'
                 }`}>
                   {task.status === 'TODO' ? 'قائمة المهام' : task.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : task.status === 'REVIEW' ? 'مراجعة' : 'معتمدة'}
                 </span>
                 {task.isFromAdmin && (
                   <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">مشروع وارد</span>
                 )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">الوصف</h3>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-xs text-gray-400 block mb-1">الموظف المسؤول</span>
                <div className="flex items-center gap-2">
                  <UserCircle size={20} className="text-primary-500" />
                  <span className="font-medium dark:text-gray-200">{task.assigneeName || 'غير مسند'}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-xs text-gray-400 block mb-1">تاريخ الإنشاء</span>
                <span className="font-medium dark:text-gray-200">{new Date(task.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Activity Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700 flex items-center gap-2">
             <History size={18} className="text-primary-600" />
             <h3 className="font-bold dark:text-white">سجل النشاط والدردشة</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {taskActivities.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">لا يوجد نشاط حتى الآن</p>
            )}
            {taskActivities.map(act => (
              <div key={act.id} className={`flex gap-3 ${act.type === 'HISTORY' ? 'opacity-75' : ''}`}>
                 <div className="mt-1">
                   {act.type === 'COMMENT' ? (
                     <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                       <UserCircle size={16} />
                     </div>
                   ) : (
                     <div className="w-8 h-8 flex items-center justify-center">
                       <div className="w-2 h-full bg-gray-200 dark:bg-gray-700"></div>
                     </div>
                   )}
                 </div>
                 <div className="flex-1">
                   {act.type === 'COMMENT' ? (
                     <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tr-none shadow-sm border border-gray-100 dark:border-gray-700">
                       <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-xs dark:text-gray-300">{act.userName}</span>
                         <span className="text-[10px] text-gray-400">{new Date(act.timestamp).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}</span>
                       </div>
                       <p className="text-sm text-gray-700 dark:text-gray-300">{act.content}</p>
                     </div>
                   ) : (
                     <div className="text-xs text-gray-500 dark:text-gray-400 py-1 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                       <span>{act.content}</span>
                       <span className="text-[10px] opacity-60">({new Date(act.timestamp).toLocaleTimeString('ar-SA')})</span>
                     </div>
                   )}
                 </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input 
                className="flex-1 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="اكتب تعليقاً..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button type="button" className="text-gray-400 hover:text-gray-600 p-2">
                 <Paperclip size={18} />
              </button>
              <button type="submit" className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50" disabled={!comment.trim()}>
                 <Send size={18} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

const MailSystem = ({ isAdmin }: { isAdmin: boolean }) => {
  const { messages, sendMessage, markMessageRead, appState, charities } = useData();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', content: '' });

  const currentUser = appState.currentUser;
  if (!currentUser) return null;

  const myId = isAdmin ? 'admin' : currentUser.charityId || '';

  const inbox = messages.filter(m => m.receiverId === myId).sort((a,b) => b.timestamp - a.timestamp);
  const sent = messages.filter(m => m.senderId === myId).sort((a,b) => b.timestamp - a.timestamp);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({
      id: `msg-${Date.now()}`,
      senderId: myId,
      senderName: isAdmin ? 'الإدارة العامة' : (currentUser.name || 'جمعية'),
      receiverId: newMessage.to,
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: Date.now(),
      isRead: false
    });
    setActiveTab('sent');
    setNewMessage({ to: '', subject: '', content: '' });
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
      <div className="flex border-b dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'inbox' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
        >
          البريد الوارد ({inbox.filter(m => !m.isRead).length})
        </button>
        <button 
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'sent' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
        >
          البريد الصادر
        </button>
        <button 
          onClick={() => setActiveTab('compose')}
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'compose' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500'}`}
        >
          رسالة جديدة
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
        {activeTab === 'inbox' && (
          <div className="space-y-3">
            {inbox.length === 0 && <p className="text-center text-gray-500 mt-10">لا توجد رسائل واردة</p>}
            {inbox.map(msg => (
              <div 
                key={msg.id} 
                onClick={() => markMessageRead(msg.id)}
                className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-r-4 cursor-pointer hover:shadow-md transition-all ${msg.isRead ? 'border-gray-200' : 'border-primary-500 bg-blue-50/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold dark:text-gray-200">{msg.senderName}</h4>
                  <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString('ar-SA')}</span>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-1">{msg.subject}</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="space-y-3">
             {sent.length === 0 && <p className="text-center text-gray-500 mt-10">لا توجد رسائل صادرة</p>}
             {sent.map(msg => (
              <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium dark:text-gray-200">إلى: {msg.receiverId === 'admin' ? 'الإدارة العامة' : charities.find(c => c.id === msg.receiverId)?.name || 'مجهول'}</h4>
                  <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString('ar-SA')}</span>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-1">{msg.subject}</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compose' && (
          <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">إلى</label>
              <select 
                value={newMessage.to}
                onChange={e => setNewMessage({...newMessage, to: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">اختر المستلم</option>
                {isAdmin ? (
                  charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                ) : (
                  <option value="admin">الإدارة العامة</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">الموضوع</label>
              <input 
                value={newMessage.subject}
                onChange={e => setNewMessage({...newMessage, subject: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="عنوان الرسالة"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">نص الرسالة</label>
              <textarea 
                value={newMessage.content}
                onChange={e => setNewMessage({...newMessage, content: e.target.value})}
                className="w-full p-2 border rounded h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="اكتب رسالتك هنا..."
                required
              />
            </div>
            <button type="submit" className="w-full py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center justify-center gap-2">
              <Send size={18} /> إرسال
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- ADMIN VIEWS ---

const AdminCharityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { charities, tasks, users, updateCharity } = useData();
  const [editingCreds, setEditingCreds] = useState(false);
  const [newCreds, setNewCreds] = useState({ username: '', password: '' });

  const charity = charities.find(c => c.id === id);
  if (!charity) return <div className="text-center p-10">الجمعية غير موجودة</div>;

  const charityTasks = tasks.filter(t => t.charityId === charity.id);
  const employees = users.filter(u => u.charityId === charity.id);
  const completed = charityTasks.filter(t => t.status === 'APPROVED').length;
  const inProgress = charityTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completionRate = charityTasks.length > 0 ? Math.round((completed / charityTasks.length) * 100) : 0;

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    updateCharity(charity.id, { username: newCreds.username, password: newCreds.password });
    setEditingCreds(false);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const pieData = [
    { name: 'منجز', value: completed },
    { name: 'قيد التنفيذ', value: inProgress },
    { name: 'قائمة المهام', value: charityTasks.filter(t => t.status === 'TODO').length },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin')} className="flex items-center text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft size={18} className="ml-1" /> العودة للقائمة
      </button>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <img src={charity.logo} alt={charity.name} className="w-24 h-24 rounded-full object-cover bg-gray-100" />
          <div>
            <h2 className="text-3xl font-bold dark:text-white">{charity.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">الموظفين: {employees.length} | المهام: {charityTasks.length}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
             onClick={() => { setNewCreds({ username: charity.username, password: charity.password || '' }); setEditingCreds(true); }}
             className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg flex items-center gap-2 hover:bg-yellow-100"
          >
            <Key size={18} /> تعديل بيانات الدخول
          </button>
          <button onClick={() => navigate('/admin/mail')} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-2 hover:bg-blue-100">
             <Mail size={18} /> مراسلة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Stats */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-t-4 border-primary-500">
            <h3 className="text-gray-500 mb-2">نسبة الإنجاز</h3>
            <div className="flex items-end gap-2">
               <span className="text-4xl font-bold text-primary-600">{completionRate}%</span>
               <span className="text-sm text-gray-400 mb-1">من إجمالي المهام</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 dark:bg-gray-700">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm col-span-1 md:col-span-2">
           <h3 className="font-bold mb-4 dark:text-white">توزيع حالات المهام</h3>
           <div className="h-40 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 mr-8">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name}: {entry.value}
                  </div>
                ))}
             </div>
           </div>
         </div>
      </div>

      {/* Employees List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
           <h3 className="font-bold text-lg dark:text-white">موظفو الجمعية</h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-sm">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">المسمى الوظيفي</th>
              <th className="p-4">اسم المستخدم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {employees.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">لا يوجد موظفين مسجلين</td></tr>
            )}
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium dark:text-gray-200">{emp.name}</td>
                <td className="p-4 text-sm dark:text-gray-400">
                  {emp.jobRole === 'PROJECT_MANAGER' && 'مدير مشروع'}
                  {emp.jobRole === 'ACCOUNTANT' && 'محاسب'}
                  {emp.jobRole === 'EMPLOYEE' && 'موظف'}
                </td>
                <td className="p-4 text-sm dark:text-gray-400 text-left" dir="ltr">@{emp.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Credentials Modal */}
      {editingCreds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 dark:text-white">تعديل بيانات الدخول</h3>
            <form onSubmit={handleUpdateCreds} className="space-y-3">
              <div>
                <label className="text-sm dark:text-gray-400">اسم المستخدم</label>
                <input 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={newCreds.username}
                  onChange={e => setNewCreds({...newCreds, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm dark:text-gray-400">كلمة المرور الجديدة</label>
                <input 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={newCreds.password}
                  onChange={e => setNewCreds({...newCreds, password: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded">حفظ</button>
                <button type="button" onClick={() => setEditingCreds(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminCharities = () => {
  const { charities, addCharity } = useData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCharity, setNewCharity] = useState({ name: '', username: '', password: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addCharity({
      id: `c${Date.now()}`,
      name: newCharity.name,
      username: newCharity.username,
      password: newCharity.password,
      logo: `https://picsum.photos/100/100?random=${Date.now()}`,
      memberCount: 0
    });
    setIsModalOpen(false);
    setNewCharity({ name: '', username: '', password: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold dark:text-white">الجمعيات الخيرية</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} /> إضافة جمعية
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map(charity => (
          <div 
            key={charity.id} 
            onClick={() => navigate(`/admin/charity/${charity.id}`)}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
          >
            <img src={charity.logo} alt={charity.name} className="w-16 h-16 rounded-full object-cover bg-gray-100" />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-primary-600 transition-colors">{charity.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{charity.username}</p>
            </div>
            <ArrowLeft size={16} className="text-gray-300" />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">إضافة جمعية جديدة</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="اسم الجمعية" 
                value={newCharity.name}
                onChange={e => setNewCharity({...newCharity, name: e.target.value})}
                required
              />
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="اسم المستخدم" 
                value={newCharity.username}
                onChange={e => setNewCharity({...newCharity, username: e.target.value})}
                required
              />
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="كلمة المرور" 
                type="password"
                value={newCharity.password}
                onChange={e => setNewCharity({...newCharity, password: e.target.value})}
                required
              />
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminStats = () => {
  const { charities, tasks } = useData();

  const statsData = charities.map(c => {
    const cTasks = tasks.filter(t => t.charityId === c.id);
    return {
      name: c.name,
      total: cTasks.length,
      completed: cTasks.filter(t => t.status === 'APPROVED').length
    };
  });

  return (
    <div className="space-y-8">
       <h2 className="text-2xl font-bold dark:text-white">إحصائيات الجمعيات</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-t-4 border-primary-500">
            <h3 className="text-gray-500 dark:text-gray-400">إجمالي الجمعيات</h3>
            <p className="text-3xl font-bold mt-2 dark:text-white">{charities.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
            <h3 className="text-gray-500 dark:text-gray-400">المهام المنجزة</h3>
            <p className="text-3xl font-bold mt-2 dark:text-white">{tasks.filter(t => t.status === 'APPROVED').length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-t-4 border-yellow-500">
            <h3 className="text-gray-500 dark:text-gray-400">قيد التنفيذ</h3>
            <p className="text-3xl font-bold mt-2 dark:text-white">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
          </div>
       </div>

       <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-80">
         <h3 className="mb-4 font-semibold dark:text-gray-300">أداء الجمعيات</h3>
         <ResponsiveContainer width="100%" height="100%">
           <BarChart data={statsData}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} />
             <XAxis dataKey="name" />
             <YAxis />
             <Tooltip />
             <Bar dataKey="total" fill="#8884d8" name="إجمالي المهام" />
             <Bar dataKey="completed" fill="#82ca9d" name="المهام المنجزة" />
           </BarChart>
         </ResponsiveContainer>
       </div>
    </div>
  );
};

const AdminTasks = () => {
  const { charities, addTask } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    charityId: charities[0]?.id || '' 
  });

  const handleAiGenerate = async () => {
    if (!newTask.title) return;
    setLoadingAi(true);
    const desc = await generateTaskDescription(newTask.title);
    setNewTask(prev => ({ ...prev, description: desc }));
    setLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      id: `t${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      charityId: newTask.charityId,
      status: 'TODO',
      isFromAdmin: true,
      createdAt: Date.now()
    });
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', charityId: charities[0]?.id || '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold dark:text-white">إسناد المهام</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} /> إنشاء مهمة
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500">
        <p>يمكنك إنشاء مهام وإسنادها للجمعيات، ستظهر هذه المهام في لوحة تحكم الجمعية.</p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">إسناد مهمة لجمعية</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">عنوان المهمة</label>
                <input 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400">الوصف</label>
                  <button 
                    type="button" 
                    onClick={handleAiGenerate}
                    disabled={loadingAi || !newTask.title}
                    className={`text-xs px-2 py-1 rounded bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors ${loadingAi ? 'opacity-50' : ''}`}
                  >
                    {loadingAi ? 'جاري التوليد...' : '✨ توليد وصف بالذكاء الاصطناعي'}
                  </button>
                </div>
                <textarea 
                  className="w-full p-2 border rounded h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">إسناد إلى</label>
                <select 
                   className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   value={newTask.charityId}
                   onChange={e => setNewTask({...newTask, charityId: e.target.value})}
                >
                  {charities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded">إرسال</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CHARITY VIEWS ---

const CharityProjects = () => {
  const { tasks, projects, addProject, addTask, appState, users } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskModal, setNewTaskModal] = useState<string | null>(null); // project id
  
  // New Project Form
  const [newProject, setNewProject] = useState({ title: '', deadline: '', managerId: '' });
  
  // New Task Form (Linked to Project)
  const [projectTask, setProjectTask] = useState({ title: '', description: '', assigneeId: '' });

  const myProjects = projects.filter(p => p.charityId === appState.currentUser?.charityId);
  const myEmployees = users.filter(u => u.charityId === appState.currentUser?.charityId);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if(appState.currentUser?.charityId) {
      const manager = myEmployees.find(u => u.id === newProject.managerId);
      addProject({
        id: `p${Date.now()}`,
        title: newProject.title,
        deadline: newProject.deadline,
        managerId: newProject.managerId,
        managerName: manager ? manager.name : 'غير محدد',
        charityId: appState.currentUser.charityId,
        progress: 0
      });
      setIsModalOpen(false);
      setNewProject({ title: '', deadline: '', managerId: '' });
    }
  };

  const handleAddTaskToProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (appState.currentUser?.charityId && newTaskModal) {
      const assignee = myEmployees.find(u => u.id === projectTask.assigneeId);
      addTask({
        id: `t${Date.now()}`,
        title: projectTask.title,
        description: projectTask.description,
        charityId: appState.currentUser.charityId,
        projectId: newTaskModal,
        assigneeId: projectTask.assigneeId,
        assigneeName: assignee ? assignee.name : undefined,
        status: 'TODO',
        isFromAdmin: true, // Treated as important/project based
        createdAt: Date.now()
      });
      setNewTaskModal(null);
      setProjectTask({ title: '', description: '', assigneeId: '' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">المشاريع</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} /> مشروع جديد
        </button>
      </div>

      <div className="grid gap-6">
        {myProjects.length === 0 ? (
          <p className="text-gray-500 text-center py-10">لا توجد مشاريع حالياً.</p>
        ) : (
          myProjects.map(project => {
            const pTasks = tasks.filter(t => t.projectId === project.id);
            const pCompleted = pTasks.filter(t => t.status === 'APPROVED').length;
            const progress = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

            return (
              <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold dark:text-gray-200">{project.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">مدير المشروع: {project.managerName} | تسليم: {project.deadline}</p>
                  </div>
                  <button 
                    onClick={() => setNewTaskModal(project.id)}
                    className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Plus size={16} /> إضافة مهمة
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                   <div className="flex justify-between text-xs mb-1 text-gray-500">
                     <span>نسبة الإنجاز</span>
                     <span>{progress}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                     <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                   </div>
                </div>

                {/* Tasks List within Project */}
                <div className="space-y-2 mt-4 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400">مهام المشروع:</h4>
                  {pTasks.length === 0 && <p className="text-xs text-gray-400">لم يتم إضافة مهام لهذا المشروع بعد.</p>}
                  {pTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 shadow-sm">
                       <div>
                         <span className="text-sm font-medium dark:text-gray-200 block">{task.title}</span>
                         <span className="text-xs text-gray-400">{task.assigneeName || 'غير مسند'}</span>
                       </div>
                       <span className={`text-xs px-2 py-1 rounded ${task.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {task.status === 'TODO' ? 'جديد' : task.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : task.status === 'REVIEW' ? 'مراجعة' : 'مكتمل'}
                       </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">مشروع جديد</h3>
            <form onSubmit={handleAddProject} className="space-y-3">
              <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="اسم المشروع" 
                value={newProject.title}
                onChange={e => setNewProject({...newProject, title: e.target.value})}
                required
              />
              <div>
                <label className="text-xs text-gray-500 block mb-1">تاريخ التسليم</label>
                <input 
                  type="date"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={newProject.deadline}
                  onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">مدير المشروع</label>
                <select 
                   className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   value={newProject.managerId}
                   onChange={e => setNewProject({...newProject, managerId: e.target.value})}
                   required
                >
                  <option value="">اختر مديراً...</option>
                  {myEmployees.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.jobRole})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded">إنشاء</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task to Project Modal */}
      {newTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">إضافة مهمة للمشروع</h3>
            <form onSubmit={handleAddTaskToProject} className="space-y-3">
               <input 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="عنوان المهمة" 
                value={projectTask.title}
                onChange={e => setProjectTask({...projectTask, title: e.target.value})}
                required
              />
              <textarea 
                className="w-full p-2 border rounded h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="وصف المهمة" 
                value={projectTask.description}
                onChange={e => setProjectTask({...projectTask, description: e.target.value})}
                required
              />
               <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">إسناد إلى</label>
                <select 
                   className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   value={projectTask.assigneeId}
                   onChange={e => setProjectTask({...projectTask, assigneeId: e.target.value})}
                >
                  <option value="">اختر موظف...</option>
                  {myEmployees.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.jobRole})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded">حفظ</button>
                <button type="button" onClick={() => setNewTaskModal(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">إلغاء</button>
              </div>
            </form>
           </div>
        </div>
      )}
    </div>
  );
};

const CharityTeam = () => {
  const { users, addUser, appState } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', username: '', password: '', jobRole: 'EMPLOYEE' as JobRole, permissions: [] as string[] 
  });

  const myEmployees = users.filter(u => u.charityId === appState.currentUser?.charityId);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if(appState.currentUser?.charityId) {
      addUser({
        id: `u${Date.now()}`,
        name: newEmployee.name,
        username: newEmployee.username,
        password: newEmployee.password,
        role: 'EMPLOYEE',
        jobRole: newEmployee.jobRole,
        charityId: appState.currentUser.charityId,
        permissions: newEmployee.permissions
      });
      setIsModalOpen(false);
      setNewEmployee({ name: '', username: '', password: '', jobRole: 'EMPLOYEE', permissions: [] });
    }
  };

  const togglePermission = (permId: string) => {
    setNewEmployee(prev => {
       const perms = prev.permissions.includes(permId) 
         ? prev.permissions.filter(p => p !== permId)
         : [...prev.permissions, permId];
       return { ...prev, permissions: perms };
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">فريق العمل</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus size={20} /> إضافة موظف
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myEmployees.map(emp => (
          <div key={emp.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                 <UserCircle size={28} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-800 dark:text-gray-200">{emp.name}</h3>
                 <p className="text-xs text-gray-500">
                    {emp.jobRole === 'PROJECT_MANAGER' ? 'مدير مشروع' : 
                     emp.jobRole === 'ACCOUNTANT' ? 'محاسب' : 'موظف'}
                 </p>
               </div>
             </div>
             <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
               <span className="font-semibold">المستخدم:</span> @{emp.username}
             </div>
             <div className="flex flex-wrap gap-1 mt-3">
               {emp.permissions?.map(p => (
                 <span key={p} className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                   {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label}
                 </span>
               ))}
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4 dark:text-white">إضافة موظف جديد</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder="الاسم" 
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    required
                  />
                  <select
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newEmployee.jobRole}
                    onChange={e => setNewEmployee({...newEmployee, jobRole: e.target.value as JobRole})}
                  >
                    <option value="EMPLOYEE">موظف</option>
                    <option value="PROJECT_MANAGER">مدير مشروع</option>
                    <option value="ACCOUNTANT">محاسب</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder="اسم المستخدم" 
                    value={newEmployee.username}
                    onChange={e => setNewEmployee({...newEmployee, username: e.target.value})}
                    required
                  />
                  <input 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder="كلمة المرور" 
                    type="password"
                    value={newEmployee.password}
                    onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                    required
                  />
               </div>
               
               <div className="border-t pt-3 dark:border-gray-700">
                 <label className="block text-sm font-semibold mb-2 dark:text-white">الصلاحيات:</label>
                 <div className="grid grid-cols-2 gap-2">
                   {AVAILABLE_PERMISSIONS.map(perm => (
                     <label key={perm.id} className="flex items-center gap-2 cursor-pointer dark:text-gray-300">
                       <input 
                         type="checkbox" 
                         checked={newEmployee.permissions.includes(perm.id)}
                         onChange={() => togglePermission(perm.id)}
                         className="rounded text-primary-600 focus:ring-primary-500"
                       />
                       <span className="text-sm">{perm.label}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded">إضافة</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CharityKanbanView = () => {
  const { appState, addTask, users } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '' });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const myEmployees = users.filter(u => u.charityId === appState.currentUser?.charityId);

  const handleAiGenerate = async () => {
    if (!newTask.title) return;
    setLoadingAi(true);
    const desc = await generateTaskDescription(newTask.title);
    setNewTask(prev => ({ ...prev, description: desc }));
    setLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appState.currentUser?.charityId) {
      const assignee = myEmployees.find(u => u.id === newTask.assigneeId);
      addTask({
        id: `t${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        charityId: appState.currentUser.charityId,
        assigneeId: newTask.assigneeId,
        assigneeName: assignee ? assignee.name : undefined,
        status: 'TODO',
        isFromAdmin: false,
        createdAt: Date.now()
      });
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', assigneeId: '' });
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">لوحة المهام</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 shadow-md"
        >
          <Plus size={20} /> مهمة سريعة
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {appState.currentUser?.charityId && (
          <KanbanBoard 
            charityId={appState.currentUser.charityId} 
            onTaskClick={(task) => setSelectedTask(task)}
          />
        )}
      </div>

      {/* Quick Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">إضافة مهمة داخلية</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">عنوان المهمة</label>
                <input 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              
               <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400">الوصف</label>
                  <button 
                    type="button" 
                    onClick={handleAiGenerate}
                    disabled={loadingAi || !newTask.title}
                    className={`text-xs px-2 py-1 rounded bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors ${loadingAi ? 'opacity-50' : ''}`}
                  >
                    {loadingAi ? 'جاري التوليد...' : '✨ توليد وصف'}
                  </button>
                </div>
                <textarea 
                  className="w-full p-2 border rounded h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">الموظف المسؤول</label>
                <select 
                   className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   value={newTask.assigneeId}
                   onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                >
                  <option value="">اختر موظف...</option>
                  {myEmployees.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.jobRole})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};

const AdminSettings = () => {
  const { toggleTheme, toggleFontSize, appState } = useData();
  
  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold dark:text-white mb-8">الإعدادات</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
               <Moon size={24} />
             </div>
             <div>
               <h3 className="font-semibold text-gray-800 dark:text-gray-200">المظهر الليلي</h3>
               <p className="text-sm text-gray-500">تبديل ألوان الواجهة للوضع المظلم</p>
             </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-colors relative ${appState.theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${appState.theme === 'dark' ? 'left-1' : 'left-7'}`}></div>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
               <Type size={24} />
             </div>
             <div>
               <h3 className="font-semibold text-gray-800 dark:text-gray-200">حجم الخط</h3>
               <p className="text-sm text-gray-500">تكبير حجم النصوص في الواجهة</p>
             </div>
          </div>
          <button 
            onClick={toggleFontSize}
             className={`w-12 h-6 rounded-full transition-colors relative ${appState.fontSize === 'large' ? 'bg-primary-600' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${appState.fontSize === 'large' ? 'left-1' : 'left-7'}`}></div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ROUTER CONFIG ---

const ProtectedRoute = ({ children, role }: { children?: React.ReactNode, role: 'ADMIN' | 'CHARITY' }) => {
  const { appState } = useData();
  const user = appState.currentUser;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role === 'ADMIN' && user.role !== 'ADMIN') {
    return <Navigate to="/charity" replace />;
  }

  // Charity & Employee use the same route base, differentiation happens inside
  if (role === 'CHARITY' && (user.role !== 'CHARITY_MANAGER' && user.role !== 'EMPLOYEE')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const AdminRouter = () => {
  const sidebarItems = [
    { label: 'الجمعيات الخيرية', path: '/admin', icon: <Building2 size={20} /> },
    { label: 'إسناد المهام', path: '/admin/tasks', icon: <CheckSquare size={20} /> },
    { label: 'البريد', path: '/admin/mail', icon: <Mail size={20} /> },
    { label: 'الإحصائيات', path: '/admin/stats', icon: <BarChart3 size={20} /> },
    { label: 'الإعدادات', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <Routes>
        <Route path="/" element={<AdminCharities />} />
        <Route path="/charity/:id" element={<AdminCharityDetail />} />
        <Route path="/tasks" element={<AdminTasks />} />
        <Route path="/mail" element={<MailSystem isAdmin={true} />} />
        <Route path="/stats" element={<AdminStats />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

const CharityRouter = () => {
  const { appState } = useData();
  const user = appState.currentUser;

  const sidebarItems = [
    { label: 'لوحة المهام', path: '/charity', icon: <LayoutDashboard size={20} /> },
    // Show Projects/Team only if they have permission or are managers
    { label: 'المشاريع', path: '/charity/projects', icon: <Briefcase size={20} /> },
    { label: 'فريق العمل', path: '/charity/team', icon: <Users size={20} /> },
    { label: 'البريد', path: '/charity/mail', icon: <Mail size={20} /> },
  ];

  // Simple permission filter for sidebar (in real app, be more strict)
  const filteredSidebar = sidebarItems.filter(item => {
    if (user?.role === 'CHARITY_MANAGER') return true;
    if (item.path === '/charity/projects') return user?.permissions?.includes('manage_projects');
    if (item.path === '/charity/team') return user?.permissions?.includes('manage_team');
    return true; // Everyone sees tasks & mail
  });

  return (
    <DashboardLayout sidebarItems={filteredSidebar}>
       <Routes>
        <Route path="/" element={<CharityKanbanView />} />
        <Route path="/projects" element={<CharityProjects />} />
        <Route path="/team" element={<CharityTeam />} />
        <Route path="/mail" element={<MailSystem isAdmin={false} />} />
      </Routes>
    </DashboardLayout>
  );
};

const App = () => {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login" element={<LoginScreen type="ADMIN" />} />
          <Route path="/charity-login" element={<LoginScreen type="CHARITY" />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute role="ADMIN">
              <AdminRouter />
            </ProtectedRoute>
          } />
          
          <Route path="/charity/*" element={
            <ProtectedRoute role="CHARITY">
              <CharityRouter />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </DataProvider>
  );
};

export default App;
