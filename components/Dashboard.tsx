
import React from 'react';
import { Member, Plan, SubscriptionStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  members: Member[];
  plans: Plan[];
}

const Dashboard: React.FC<DashboardProps> = ({ members, plans }) => {
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === SubscriptionStatus.ACTIVE).length,
    debts: members.filter(m => m.remainingAmount > 0).length,
    expired: members.filter(m => m.status === SubscriptionStatus.EXPIRED).length,
    totalCollected: members.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    totalRemaining: members.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0)
  };

  const pieData = [
    { name: 'نشط', value: stats.active, color: '#10b981' },
    { name: 'منتهي', value: stats.expired, color: '#ef4444' },
    { name: 'باقي الديون', value: stats.debts, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="إجمالي الدخل المحصل" value={`${stats.totalCollected} ₪`} subText="صافي الأرباح المستلمة" icon="💰" color="bg-indigo-600" />
        <StatCard title="مستحقات (ديون)" value={`${stats.totalRemaining} ₪`} subText={`${stats.debts} أعضاء مدينون`} icon="📉" color="bg-amber-500" />
        <StatCard title="إجمالي الأعضاء" value={stats.total} subText={`${stats.active} عضو نشط حالياً`} icon="👥" color="bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-800">توزيع اشتراكات الأعضاء</h3>
              <div className="flex gap-2">
                 <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> نشط</span>
                 <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> منتهي</span>
              </div>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={plans.map(p => ({ name: p.name, count: members.filter(m => m.planId === p.id).length }))}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} dy={10} />
                 <YAxis fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                 <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center">
           <h3 className="font-black text-slate-800 mb-8 self-start">حالة الصالة</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={90} paddingAngle={8} stroke="none">
                   {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="w-full space-y-3 mt-4">
              {pieData.map(d => (
                <div key={d.name} className="flex justify-between items-center text-xs">
                   <div className="flex items-center gap-2 font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                      {d.name}
                   </div>
                   <span className="font-black text-slate-800">{d.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subText, icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400">{subText}</p>
    </div>
    <div className={`${color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl text-white shadow-xl shadow-indigo-100 transition-transform group-hover:scale-110`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
