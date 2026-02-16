
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
    expiring: members.filter(m => m.status === SubscriptionStatus.EXPIRING_SOON).length,
    expired: members.filter(m => m.status === SubscriptionStatus.EXPIRED).length,
    totalCollected: members.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    totalRemaining: members.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0)
  };

  const pieData = [
    { name: 'نشط', value: stats.active, color: '#10b981' },
    { name: 'تنبيه', value: stats.expiring, color: '#f59e0b' },
    { name: 'منتهي', value: stats.expired, color: '#ef4444' },
  ];

  const planStats = plans.map(p => ({
    name: p.name,
    count: members.filter(m => m.planId === p.id).length
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stat Cards - Grid layout changes on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="إجمالي الأعضاء" value={stats.total} icon="👥" color="bg-blue-500" />
        <StatCard title="المحصل" value={`${stats.totalCollected}`} icon="💰" color="bg-emerald-600" />
        <StatCard title="الديون" value={`${stats.totalRemaining}`} icon="💸" color="bg-red-500" />
        <StatCard title="التنبيهات" value={stats.expiring} icon="⏳" color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm md:text-lg font-bold mb-4 text-slate-700">حالة الاشتراكات</h3>
          <div className="h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm md:text-lg font-bold mb-4 text-slate-700">توزيع الخطط</h3>
          <div className="h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
  <div className="bg-white p-3 md:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:justify-between text-center md:text-right gap-2">
    <div className="order-2 md:order-1">
      <p className="text-[10px] md:text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-sm md:text-xl font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
    <div className={`${color} w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-sm md:text-2xl text-white shadow-sm order-1 md:order-2`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
