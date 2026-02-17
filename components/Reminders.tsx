
import React, { useState } from 'react';
import { Member, Plan, SubscriptionStatus } from '../types';

interface RemindersProps {
  members: Member[];
  plans: Plan[];
}

const Reminders: React.FC<RemindersProps> = ({ members, plans }) => {
  const [filter, setFilter] = useState<'debts' | 'expiring'>('debts');

  const membersWithDebts = members.filter(m => m.remainingAmount > 0);
  const membersExpiring = members.filter(m => m.status === SubscriptionStatus.EXPIRING_SOON || m.status === SubscriptionStatus.EXPIRED);

  const displayedMembers = filter === 'debts' ? membersWithDebts : membersExpiring;

  const sendWhatsApp = (member: Member) => {
    const plan = plans.find(p => p.id === member.planId);
    let message = "";
    
    if (filter === 'debts') {
      message = `مرحباً كابتن ${member.name}، نود تذكيرك بأن لديك مبلغ متبقي (${member.remainingAmount.toLocaleString('en-US')} شيكل) من اشتراك ${plan?.name} الذي ينتهي بتاريخ ${member.endDate}. ننتظرك في جيم الجلاء!`;
    } else {
      message = `مرحباً كابتن ${member.name}، نود تذكيرك بأن اشتراكك في جيم الجلاء (${plan?.name}) ${member.status === SubscriptionStatus.EXPIRED ? 'قد انتهى' : 'سينتهي'} بتاريخ ${member.endDate}. يسعدنا تجديد اشتراكك في أي وقت!`;
    }
    
    const url = `https://wa.me/${member.phone.replace(/^0/, '970')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit overflow-x-auto max-w-full">
        <TabButton active={filter === 'debts'} onClick={() => setFilter('debts')} label="الديون والمستحقات" count={membersWithDebts.length} />
        <TabButton active={filter === 'expiring'} onClick={() => setFilter('expiring')} label="تنبيهات انتهاء الاشتراك" count={membersExpiring.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedMembers.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
             <div className="text-6xl mb-6">🌟</div>
             <p className="font-black text-slate-500 text-lg">لا يوجد تنبيهات حالياً، العمل يسير بشكل رائع!</p>
          </div>
        ) : (
          displayedMembers.map(member => (
            <ReminderCard 
              key={member.id} 
              member={member} 
              plan={plans.find(p => p.id === member.planId)} 
              type={filter}
              onWhatsApp={() => sendWhatsApp(member)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-3 whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
  >
    {label}
    <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{count.toLocaleString('en-US')}</span>
  </button>
);

const ReminderCard = ({ member, plan, type, onWhatsApp }: any) => (
  <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">👤</div>
       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${member.status === SubscriptionStatus.EXPIRED ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          {member.status}
       </span>
    </div>
    <h4 className="font-black text-slate-800 text-xl mb-1">{member.name}</h4>
    <p className="text-xs text-slate-400 font-bold mb-6 tracking-wide">{member.phone}</p>
    
    <div className="bg-slate-50 rounded-[1.5rem] p-5 mb-8 space-y-3">
       <div className="flex justify-between text-[11px] text-slate-500 font-bold">
          <span>نوع الاشتراك:</span>
          <span className="text-slate-800">{plan?.name}</span>
       </div>
       <div className="flex justify-between text-[11px] text-slate-500 font-bold">
          <span>تاريخ الانتهاء:</span>
          <span className="text-indigo-600 font-black">{member.endDate}</span>
       </div>
       {type === 'debts' && (
         <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-bold">المبلغ المطلوب:</span>
            <span className="font-black text-red-600 text-lg">{member.remainingAmount.toLocaleString('en-US')} ₪</span>
         </div>
       )}
    </div>

    <button 
      onClick={onWhatsApp}
      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.25rem] font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-50 hover:shadow-emerald-100 active:scale-95"
    >
      <span className="text-2xl">💬</span> تذكير عبر واتساب
    </button>
  </div>
);

export default Reminders;
