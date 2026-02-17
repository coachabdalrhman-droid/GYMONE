
import React from 'react';
import { Member, Plan, SubscriptionStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DashboardProps {
  members: Member[];
  plans: Plan[];
}

const Dashboard: React.FC<DashboardProps> = ({ members, plans }) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // إحصائيات تقييم الأداء
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === SubscriptionStatus.ACTIVE).length,
    expired: members.filter(m => m.status === SubscriptionStatus.EXPIRED).length,
    expiringSoon: members.filter(m => m.status === SubscriptionStatus.EXPIRING_SOON).length,
    newThisMonth: members.filter(m => new Date(m.startDate) >= firstDayOfMonth).length,
    totalCollected: members.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    totalRemaining: members.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0)
  };

  // بيانات توزيع المشتركين حسب الباقات
  const distributionData = plans.map(p => ({
    name: p.name,
    value: members.filter(m => m.planId === p.id).length
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Performance Evaluation Overview - بطاقات تقييم الأداء */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EvaluationCard 
          title="المشتركين الجدد" 
          subtitle="خلال هذا الشهر" 
          value={stats.newThisMonth.toLocaleString('en-US')} 
          icon="✨" 
          color="indigo" 
        />
        <EvaluationCard 
          title="اشتراكات منتهية" 
          subtitle="تتطلب متابعة" 
          value={stats.expired.toLocaleString('en-US')} 
          icon="🚫" 
          color="rose" 
        />
        <EvaluationCard 
          title="قريب الانتهاء" 
          subtitle="فرص تجديد" 
          value={stats.expiringSoon.toLocaleString('en-US')} 
          icon="⏳" 
          color="amber" 
        />
        <EvaluationCard 
          title="إجمالي الدخل" 
          subtitle="التحصيل النقدي" 
          value={`${stats.totalCollected.toLocaleString('en-US')} ₪`} 
          icon="💎" 
          color="emerald" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Revenue & Growth - التدفق المالي */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">تحليل النمو المالي</h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Financial Performance Analysis</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
               <button className="px-4 py-1.5 text-[10px] font-black bg-white shadow-sm rounded-lg text-indigo-600">هذا الشهر</button>
               <button className="px-4 py-1.5 text-[10px] font-black text-slate-400">العام الحالي</button>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distributionData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} stroke="#94a3b8" dy={10} />
                <YAxis fontSize={10} fontWeight="700" axisLine={false} tickLine={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Member Distribution - توزيع المشتركين */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center">
          <div className="w-full text-right mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">توزيع المشتركين</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">By Membership Type</p>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-3 mt-6">
            {distributionData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="font-bold text-slate-500">{item.name}</span>
                </div>
                <span className="font-black text-slate-900">{item.value.toLocaleString('en-US')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Efficiency & Health Status - كفاءة النظام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mt-32 -mr-32 blur-[60px]"></div>
           <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 relative z-10">كفاءة التحصيل والديون</h4>
           
           <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-3xl font-black">%{Math.round((stats.totalCollected / (stats.totalCollected + stats.totalRemaining)) * 100) || 0}</span>
              <span className="text-xs text-slate-400 font-bold">نسبة التحصيل الفعلي</span>
           </div>
           
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-10 relative z-10">
              <div 
                className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                style={{ width: `${Math.round((stats.totalCollected / (stats.totalCollected + stats.totalRemaining)) * 100)}%` }}
              ></div>
           </div>

           <div className="grid grid-cols-2 gap-8 relative z-10">
              <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الديون المتبقية</p>
                 <p className="text-xl font-black text-rose-400">{stats.totalRemaining.toLocaleString('en-US')} ₪</p>
              </div>
              <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">صافي التدفق</p>
                 <p className="text-xl font-black text-emerald-400">{(stats.totalCollected + stats.totalRemaining).toLocaleString('en-US')} ₪</p>
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col justify-center">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">حالة استقرار العضويات</h4>
            <div className="space-y-6">
              <ProgressRow label="معدل تجديد الاشتراك" val={85} color="bg-indigo-600" />
              <ProgressRow label="نسبة المشتركين النشطين" val={Math.round((stats.active / stats.total) * 100) || 0} color="bg-emerald-500" />
              <ProgressRow label="الولاء السنوي" val={12} color="bg-amber-500" />
            </div>
        </div>
      </div>
    </div>
  );
};

const EvaluationCard = ({ title, subtitle, value, icon, color }: any) => {
  const colorMap: any = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };
  return (
    <div className={`bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 mb-1">{value}</h4>
      <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
    </div>
  );
};

const ProgressRow = ({ label, val, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-wide">
      <span>{label}</span>
      <span className="text-slate-900">{val}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${val}%` }}></div>
    </div>
  </div>
);

export default Dashboard;
