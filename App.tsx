
import React, { useState, useEffect, useCallback } from 'react';
import { Member, Plan, SubscriptionStatus } from './types';
import { INITIAL_PLANS, INITIAL_MEMBERS, calculateStatus } from './constants';
import Dashboard from './components/Dashboard';
import MemberTable from './components/MemberTable';
import Reminders from './components/Reminders';
import AddMemberModal from './components/AddMemberModal';
import { getGymInsights } from './services/geminiService';
import { exportToExcel } from './utils/exportUtils';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('gym_members_data');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  
  const [plans] = useState<Plan[]>(INITIAL_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'reminders'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>('جاري تحليل أداء الجيم...');
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('Install prompt is ready');
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert('ميزة التثبيت التلقائي غير متاحة في هذا المتصفح حالياً. يمكنك تثبيت التطبيق يدوياً من إعدادات المتصفح (Install App / Add to Home Screen).');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    localStorage.setItem('gym_members_data', JSON.stringify(members));
  }, [members]);

  const fetchInsights = useCallback(async () => {
    setAiInsight('جاري التفكير...');
    const insight = await getGymInsights(members, plans);
    setAiInsight(insight);
  }, [members, plans]);

  useEffect(() => { fetchInsights(); }, [members.length]);

  const handleSaveMember = (member: Member) => {
    if (editingMember) {
      setMembers(members.map(m => m.id === member.id ? member : m));
    } else {
      setMembers([...members, member]);
    }
    setEditingMember(null);
  };

  const handleExportData = () => {
    exportToExcel(members, plans);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f8fafc] overflow-hidden font-['Tajawal'] text-right select-none" dir="rtl">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-[#0f172a] text-white flex-col shadow-2xl z-30">
        <div className="p-8 border-b border-white/5 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20">🏋️</div>
          <div>
            <h1 className="font-black text-xl">جيم الجلاء</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">نسخة سطح المكتب v4.0</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label="لوحة التحكم" />
          <NavItem active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon="👥" label="قائمة المشتركين" />
          <NavItem active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon="🔔" label="تنبيهات الديون" badge={members.filter(m => m.remainingAmount > 0 || m.status !== 'نشط').length} />
          
          <div className="pt-8 pb-2 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">أدوات النظام</div>
          
          <button 
            onClick={handleExportData}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-emerald-400 hover:bg-emerald-500/10 transition-all font-bold text-[13px] mb-1"
          >
            <span className="text-xl">📊</span> تصدير ملف Excel
          </button>

          <button 
            onClick={handleInstallApp}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-[13px] mb-2 ${canInstall ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <span className="text-xl">💻</span> {canInstall ? 'تثبيت كبرنامج' : 'حول التثبيت'}
          </button>

          <NavItem onClick={() => setIsHelpOpen(true)} icon="❓" label="المساعدة والدعم" />
        </nav>

        <div className="p-6 border-t border-white/5">
           <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-slate-400 font-bold mb-1">حالة التخزين</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-300">يتم الحفظ تلقائياً</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden pb-20 md:pb-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 z-20">
          <div className="flex flex-col">
             <h2 className="font-black text-slate-800 text-lg md:text-xl">
                {activeTab === 'dashboard' ? 'نظرة عامة' : activeTab === 'members' ? 'إدارة المشتركين' : 'التنبيهات والديون'}
             </h2>
             <p className="text-[10px] text-slate-400 font-bold">نظام الجلاء الرياضي - شارع الوحدة</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 md:px-8 py-2.5 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>＋</span> تسجيل عضو
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {/* AI Banner */}
          <div className="mb-6 bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/10 shrink-0 shadow-inner">🤖</div>
                <div className="flex-1">
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">توصيات الذكاء الاصطناعي</p>
                  <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-medium italic">"{aiInsight}"</p>
                </div>
             </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && <Dashboard members={members} plans={plans} />}
            {activeTab === 'members' && (
              <MemberTable 
                members={members} 
                plans={plans} 
                onDelete={(id) => {
                  if(confirm('هل أنت متأكد من حذف هذا المشترك؟')) {
                    setMembers(members.filter(m => m.id !== id));
                  }
                }}
                onEdit={(m) => { setEditingMember(m); setIsModalOpen(true); }}
              />
            )}
            {activeTab === 'reminders' && <Reminders members={members} plans={plans} />}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex justify-between items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
          <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label="الرئيسية" />
          <MobileNavItem active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon="🔔" label="تنبيهات" />
          <button 
            onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
            className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-indigo-200 -mt-12 border-4 border-slate-50 transition-transform active:scale-90"
          >
            ＋
          </button>
          <MobileNavItem active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon="👥" label="الأعضاء" />
          <MobileNavItem onClick={() => setIsHelpOpen(true)} icon="❓" label="مساعدة" />
        </nav>
      </div>

      <AddMemberModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
        plans={plans}
        initialData={editingMember}
      />
      
      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-3xl font-black text-slate-900">دليل التشغيل</h3>
                <button onClick={() => setIsHelpOpen(false)} className="text-2xl text-slate-300 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-6 text-slate-600">
                 <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <h4 className="font-black text-indigo-700 mb-2 flex items-center gap-2"><span>💻</span> التثبيت كبرنامج (Desktop):</h4>
                    <p className="text-xs leading-relaxed">إذا لم يظهر زر التثبيت، يمكنك دائماً من متصفح Chrome الضغط على النقاط الثلاث في الأعلى ثم اختيار <b>"Save and Share"</b> ثم <b>"Install Gym App"</b>.</p>
                 </div>
                 <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <h4 className="font-black text-emerald-700 mb-2 flex items-center gap-2"><span>📊</span> تصدير البيانات:</h4>
                    <p className="text-xs leading-relaxed">استخدم زر <b>"تصدير ملف Excel"</b> للحصول على ملف .xlsx حقيقي يفتح في إكسل بأعمدة مرتبة وتنسيق عربي صحيح.</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h4 className="font-black text-slate-700 mb-2 flex items-center gap-2"><span>💾</span> التخزين:</h4>
                    <p className="text-xs leading-relaxed">يتم حفظ البيانات تلقائياً في متصفحك. لا تقم بمسح "Cache" المتصفح لضمان بقاء البيانات، أو قم بتصدير إكسل دورياً كنسخة احتياطية.</p>
                 </div>
                 <button onClick={() => setIsHelpOpen(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-colors">إغلاق</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-[13px] group mb-1 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
  >
    <div className="flex items-center gap-4">
      <span className={`text-xl transition-transform group-hover:scale-110 ${active ? 'scale-110' : ''}`}>{icon}</span>
      {label}
    </div>
    {badge ? <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm">{badge}</span> : null}
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

export default App;
