
import React, { useState, useEffect, useCallback } from 'react';
import { Member, Plan, SubscriptionStatus } from './types';
import { INITIAL_PLANS, INITIAL_MEMBERS, calculateStatus } from './constants';
import Dashboard from './components/Dashboard';
import MemberTable from './components/MemberTable';
import AddMemberModal from './components/AddMemberModal';
import { getGymInsights } from './services/geminiService';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('gym_members_data');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  
  const [plans] = useState<Plan[]>(INITIAL_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>('جاري تحليل أداء الجيم...');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('gym_members_data', JSON.stringify(members));
  }, [members]);

  const fetchInsights = useCallback(async () => {
    setAiInsight('جاري التفكير...');
    const insight = await getGymInsights(members, plans);
    setAiInsight(insight);
  }, [members, plans]);

  useEffect(() => { fetchInsights(); }, []);

  const handleSaveMember = (member: Member) => {
    if (editingMember) {
      setMembers(members.map(m => m.id === member.id ? member : m));
    } else {
      setMembers([...members, member]);
    }
    setEditingMember(null);
  };

  const exportBackup = () => {
    const data = JSON.stringify(members, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gym_jalaa_backup_${new Date().toLocaleDateString('en-CA')}.json`;
    link.click();
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'جيم الجلاء الرياضي',
      text: 'نظام إدارة اشتراكات جيم الجلاء الرياضي - شارع الوحدة. يمكنك تثبيت التطبيق على هاتفك الآن!',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden font-['Tajawal'] text-right select-none" dir="rtl">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-in fade-in slide-in-from-top-4">
          ✅ تم نسخ رابط التطبيق! يمكنك إرساله الآن.
        </div>
      )}

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 bg-[#0f172a] text-white flex-col shadow-2xl z-30 border-l border-white/5">
        <div className="p-8 border-b border-white/5 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl">🏋️</div>
          <div>
            <h1 className="font-black text-xl tracking-tight">نظام جيم الجلاء</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Enterprise Edition</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label="لوحة التحكم" />
          <NavItem active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon="👥" label="سجل المشتركين" />
          <div className="pt-6 pb-2 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-800"></span> أدوات <span className="flex-1 h-[1px] bg-slate-800"></span>
          </div>
          <NavItem onClick={handleShareApp} icon="🔗" label="مشاركة التطبيق" />
          <NavItem onClick={exportBackup} icon="💾" label="تصدير نسخة" />
          <NavItem onClick={() => setIsSetupOpen(true)} icon="⚙️" label="الإعدادات" />
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden pb-20 md:pb-0">
        {/* Header - Compact on mobile */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 z-20 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
             <h2 className="font-black text-slate-800 text-sm md:text-lg">
                {activeTab === 'dashboard' ? 'التحليلات' : 'المشتركين'}
             </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={handleShareApp}
              className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
              title="مشاركة التطبيق"
            >
              🔗
            </button>
            <button 
              onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-8 py-2 rounded-xl font-black text-xs md:text-sm shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
            >
              <span className="text-lg md:text-xl">＋</span> <span className="hidden xs:inline">عضو جديد</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          {/* AI Banner - Compact on mobile */}
          <div className="mb-6 md:mb-10 bg-[#1e293b] rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="flex items-start gap-4 md:gap-6 relative z-10">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-500/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-xl md:text-3xl border border-white/10 shadow-inner shrink-0">🤖</div>
              <div className="flex-1">
                <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1 md:mb-3">مساعد Gemini الذكي</h3>
                <p className="text-slate-100 text-xs md:text-lg leading-relaxed font-medium italic line-clamp-3 md:line-clamp-none">"{aiInsight}"</p>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' ? (
              <Dashboard members={members} plans={plans} />
            ) : (
              <MemberTable 
                members={members} 
                plans={plans} 
                onDelete={(id) => setMembers(members.filter(m => m.id !== id))}
                onEdit={(m) => { setEditingMember(m); setIsModalOpen(true); }}
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label="الرئيسية" />
          <button 
            onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg shadow-indigo-200 -mt-8 border-4 border-slate-50"
          >
            ＋
          </button>
          <MobileNavItem active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon="👥" label="الأعضاء" />
        </nav>
      </div>

      <AddMemberModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
        plans={plans}
        initialData={editingMember}
      />
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active?: boolean; onClick: () => void; icon: string; label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-[13px] group ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
  >
    <span className={`text-xl transition-transform group-hover:scale-125 ${active ? 'scale-110' : ''}`}>{icon}</span>
    {label}
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label }: { active?: boolean; onClick: () => void; icon: string; label: string }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

export default App;
