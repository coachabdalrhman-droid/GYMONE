
import React, { useState, useEffect, useRef } from 'react';
import { Member, Plan, SubscriptionStatus } from './types';
import { INITIAL_PLANS, INITIAL_MEMBERS } from './constants';
import Dashboard from './components/Dashboard';
import MemberTable from './components/MemberTable';
import Reminders from './components/Reminders';
import AddMemberModal from './components/AddMemberModal';
import MemberDetailModal from './components/MemberDetailModal';
import { exportToExcel } from './utils/exportUtils';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('gym_members_data');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  
  const [plans] = useState<Plan[]>(INITIAL_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'reminders'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('gym_members_data', JSON.stringify(members));
  }, [members]);

  return (
    <div className="h-screen flex bg-[#020617] text-right overflow-hidden font-['Almarai']" dir="rtl">
      
      {/* Sidebar - Optimized for Enterprise Branding */}
      <aside className="w-[260px] flex flex-col no-print shrink-0 border-l border-white/5 bg-[#020617]">
        <div className="px-6 py-10">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-600/30">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-lg leading-tight tracking-tight">جيم الجلاء</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-slate-500 text-[9px] font-bold uppercase tracking-[2px]">Core Enterprise</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />} 
              label="لوحة التحكم" 
            />
            <NavItem 
              active={activeTab === 'members'} 
              onClick={() => setActiveTab('members')} 
              icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />} 
              label="المشتركين" 
            />
            <NavItem 
              active={activeTab === 'reminders'} 
              onClick={() => setActiveTab('reminders')} 
              icon={<path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />} 
              label="الديون والتنبيهات" 
              badge={members.filter(m => m.remainingAmount > 0).length}
            />
          </nav>

          <div className="mt-12 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-3">العمليات</p>
            <SidebarActionBtn onClick={() => exportToExcel(members, plans)} label="تحميل التقارير" icon="📊" />
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
           <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">Crevia Intel v8.2</p>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                 <span className="text-white text-[11px] font-bold">النظام متصل</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Workspace Area - Refined for Professional Use */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden rounded-tr-[32px] shadow-2xl">
        
        {/* Navigation Bar - Clean and Elevated */}
        <header className="h-20 px-10 flex items-center justify-between border-b border-slate-100 bg-white no-print">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {activeTab === 'dashboard' ? 'لوحة البيانات المركزية' : activeTab === 'members' ? 'قائمة المشتركين' : 'مركز التحصيل'}
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <input 
                type="text" 
                placeholder="بحث..." 
                className="w-56 bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600/20 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button 
              onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              إضافة مشترك
            </button>
          </div>
        </header>

        {/* Dynamic Content Surface */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard members={members} plans={plans} />}
            {activeTab === 'members' && (
              <MemberTable 
                members={members} 
                plans={plans} 
                searchTerm={searchTerm}
                onDelete={(id) => { if(confirm('تأكيد حذف المشترك؟')) setMembers(members.filter(m => m.id !== id)); }}
                onEdit={(m) => { setEditingMember(m); setIsModalOpen(true); }}
                onView={(m) => setViewingMember(m)}
              />
            )}
            {activeTab === 'reminders' && <Reminders members={members} plans={plans} />}
          </div>
        </div>

        {/* Enterprise Footer */}
        <footer className="h-10 px-10 flex items-center justify-between border-t border-slate-100 text-[10px] font-bold text-slate-400 bg-white no-print">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> المشتركين: {members.length.toLocaleString('en-US')}</span>
            <span>النسخة: 8.2.0 Enterprise</span>
          </div>
          <div>© 2025 Crevia Business Intelligence</div>
        </footer>
      </main>

      <AddMemberModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(m) => {
          if(editingMember) setMembers(members.map(x => x.id === m.id ? m : x));
          else setMembers([...members, m]);
          setEditingMember(null);
        }}
        plans={plans}
        initialData={editingMember}
      />

      <MemberDetailModal 
        isOpen={!!viewingMember}
        onClose={() => setViewingMember(null)}
        member={viewingMember}
        plans={plans}
      />
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-[13px] ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
  >
    <div className="flex items-center gap-3">
      <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icon}</svg>
      {label}
    </div>
    {badge ? <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-lg font-black">{badge.toLocaleString('en-US')}</span> : null}
  </button>
);

const SidebarActionBtn = ({ onClick, label, icon }: any) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold group">
    <span className="text-base group-hover:scale-110 transition-transform">{icon}</span>
    {label}
  </button>
);

export default App;
