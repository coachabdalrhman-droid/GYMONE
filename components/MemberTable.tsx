
import React, { useState, useMemo } from 'react';
import { Member, Plan, SubscriptionStatus } from '../types';
import { exportToCSV } from '../utils/exportUtils';

interface MemberTableProps {
  members: Member[];
  plans: Plan[];
  onDelete: (id: string) => void;
  onEdit: (member: Member) => void;
}

const MemberTable: React.FC<MemberTableProps> = ({ members, plans, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [debtFilter, setDebtFilter] = useState<string>('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesPlan = planFilter === 'all' || m.planId === planFilter;
      const matchesDebt = debtFilter === 'all' || 
                         (debtFilter === 'has_debt' ? m.remainingAmount > 0 : m.remainingAmount === 0);
      
      return matchesSearch && matchesStatus && matchesPlan && matchesDebt;
    });
  }, [members, searchTerm, statusFilter, planFilter, debtFilter]);

  const handlePrintReceipt = (member: Member) => {
    const plan = plans.find(p => p.id === member.planId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `
      <div dir="rtl" style="font-family: Arial; padding: 20px; text-align: right;">
        <h2>جيم الجلاء الرياضي</h2>
        <p>الاسم: ${member.name}</p>
        <p>الاشتراك: ${plan?.name}</p>
        <p>تاريخ الانتهاء: ${member.endDate}</p>
        <p>المبلغ: ${member.totalPaid} شيكل</p>
        <p>المتبقي: ${member.remainingAmount} شيكل</p>
        <script>window.print(); window.close();</script>
      </div>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const getStatusStyle = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case SubscriptionStatus.EXPIRED: return 'bg-red-100 text-red-700 border-red-200';
      case SubscriptionStatus.EXPIRING_SOON: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlanFilter('all');
    setDebtFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Area */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الهاتف..." 
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-bold transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${isFilterVisible ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <span>⚙️</span> تصفية متقدمة
            </button>
            <button 
              onClick={() => exportToCSV(members, plans)} 
              className="flex-1 md:flex-none px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <span>📥</span> تصدير Excel
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {isFilterVisible && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 mr-1">حالة الاشتراك</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value={SubscriptionStatus.ACTIVE}>نشط</option>
                <option value={SubscriptionStatus.EXPIRED}>منتهي</option>
                <option value={SubscriptionStatus.EXPIRING_SOON}>قريب الانتهاء</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 mr-1">نوع الخطة</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">كل الخطط</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 mr-1">حالة الدفع</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                value={debtFilter}
                onChange={(e) => setDebtFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="paid">خالص</option>
                <option value="has_debt">عليه ديون</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={resetFilters}
                className="w-full py-2.5 text-red-500 font-bold text-xs hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="px-2 text-[11px] font-bold text-slate-400 flex justify-between">
        <span>نتائج البحث: {filteredMembers.length} مشترك</span>
        { (statusFilter !== 'all' || planFilter !== 'all' || debtFilter !== 'all') && (
          <span className="text-indigo-500">تم تطبيق الفلاتر</span>
        ) }
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">الاسم</th>
              <th className="px-6 py-5">الهاتف</th>
              <th className="px-6 py-5">تاريخ الانتهاء</th>
              <th className="px-6 py-5">الحالة</th>
              <th className="px-6 py-5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.length > 0 ? filteredMembers.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5 font-black text-slate-800">{m.name}</td>
                <td className="px-6 py-5 text-slate-500 text-sm font-bold tracking-tight">{m.phone}</td>
                <td className="px-6 py-5 text-indigo-600 text-sm font-black">{m.endDate}</td>
                <td className="px-6 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${getStatusStyle(m.status)}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-5 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionButton icon="🖨️" onClick={() => handlePrintReceipt(m)} color="text-slate-600" title="طباعة وصل" />
                  <ActionButton icon="✏️" onClick={() => onEdit(m)} color="text-indigo-600" title="تعديل" />
                  <ActionButton icon="🗑️" onClick={() => onDelete(m.id)} color="text-red-500" title="حذف" />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">لا يوجد نتائج تطابق بحثك</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List - Cards */}
      <div className="md:hidden space-y-4 pb-6">
        {filteredMembers.length > 0 ? filteredMembers.map((m) => {
          const plan = plans.find(p => p.id === m.planId);
          return (
            <div key={m.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-5 active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center text-indigo-600 text-xl font-black shadow-inner">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight">{m.name}</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-wide">{m.phone}</p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${getStatusStyle(m.status)}`}>
                  {m.status}
                </span>
              </div>
              
              <div className="bg-slate-50/50 rounded-[1.75rem] p-5 space-y-3 border border-slate-100">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">نوع الاشتراك</span>
                  <span className="text-slate-700 font-black">{plan?.name}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">تاريخ الانتهاء</span>
                  <span className="text-indigo-600 font-black">{m.endDate}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">الحالة المالية</span>
                  <span className={m.remainingAmount > 0 ? "text-red-600 font-black" : "text-emerald-600 font-black"}>
                    {m.remainingAmount > 0 ? `متبقي ${m.remainingAmount} ₪` : 'تم الدفع بالكامل'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => onEdit(m)} className="flex-1 bg-indigo-600 text-white py-4 rounded-[1.25rem] text-sm font-black shadow-lg shadow-indigo-100 active:bg-indigo-700 transition-colors">تعديل البيانات</button>
                <button onClick={() => handlePrintReceipt(m)} className="w-16 bg-slate-100 text-slate-600 rounded-[1.25rem] text-2xl flex items-center justify-center active:bg-slate-200 transition-colors">🖨️</button>
                <button onClick={() => onDelete(m.id)} className="w-16 bg-red-50 text-red-500 rounded-[1.25rem] text-2xl flex items-center justify-center active:bg-red-100 transition-colors">🗑️</button>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
             <div className="text-4xl mb-4">🔍</div>
             <p className="font-bold text-slate-400">لا يوجد مشتركين بهذه المواصفات</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon, onClick, color, title }: { icon: string; onClick: () => void; color: string; title: string }) => (
  <button 
    onClick={onClick} 
    title={title}
    className={`p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 shadow-sm hover:shadow transition-all ${color}`}
  >
    <span className="text-lg">{icon}</span>
  </button>
);

export default MemberTable;
