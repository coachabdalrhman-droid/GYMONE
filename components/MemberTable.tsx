
import React, { useState } from 'react';
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

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phone.includes(searchTerm)
  );

  const handlePrintReceipt = (member: Member) => {
    const plan = plans.find(p => p.id === member.planId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `
      <div dir="rtl" style="font-family: Arial; padding: 20px; text-align: right;">
        <h2>جيم الجلاء الرياضي</h2>
        <p>الاسم: ${member.name}</p>
        <p>الاشتراك: ${plan?.name}</p>
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

  return (
    <div className="space-y-4">
      {/* Search & Actions Area */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="بحث بالاسم أو الهاتف..." 
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
        <button onClick={() => exportToCSV(members, plans)} className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
          <span>📥</span> تصدير Excel
        </button>
      </div>

      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">الاسم</th>
              <th className="px-6 py-4">الهاتف</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{m.phone}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusStyle(m.status)}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <ActionButton icon="🖨️" onClick={() => handlePrintReceipt(m)} color="text-slate-600" />
                  <ActionButton icon="✏️" onClick={() => onEdit(m)} color="text-blue-600" />
                  <ActionButton icon="🗑️" onClick={() => onDelete(m.id)} color="text-red-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List - Cards - Shown on Mobile */}
      <div className="md:hidden space-y-3 pb-4">
        {filteredMembers.map((m) => {
          const plan = plans.find(p => p.id === m.planId);
          return (
            <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-900">{m.name}</h4>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">{m.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black border ${getStatusStyle(m.status)}`}>
                  {m.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-y border-slate-50">
                <span className="text-slate-500">{plan?.name}</span>
                <span className={m.remainingAmount > 0 ? "text-red-500 font-black" : "text-emerald-500 font-black"}>
                  {m.remainingAmount > 0 ? `باقي: ${m.remainingAmount} شيكل` : 'خالص'}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(m)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-black">تعديل</button>
                <button onClick={() => handlePrintReceipt(m)} className="w-12 bg-slate-50 text-slate-600 py-2 rounded-lg text-lg flex items-center justify-center">🖨️</button>
                <button onClick={() => onDelete(m.id)} className="w-12 bg-red-50 text-red-500 py-2 rounded-lg text-lg flex items-center justify-center">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ActionButton = ({ icon, onClick, color }: { icon: string; onClick: () => void; color: string }) => (
  <button onClick={onClick} className={`p-2 rounded-lg hover:bg-slate-100 border border-slate-100 transition-all ${color}`}>
    {icon}
  </button>
);

export default MemberTable;
