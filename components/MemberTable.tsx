
import React, { useState, useMemo } from 'react';
import { Member, Plan, SubscriptionStatus } from '../types';
import { exportToExcel } from '../utils/exportUtils';

interface MemberTableProps {
  members: Member[];
  plans: Plan[];
  searchTerm: string;
  onDelete: (id: string) => void;
  onEdit: (member: Member) => void;
  onView: (member: Member) => void;
}

const MemberTable: React.FC<MemberTableProps> = ({ members, plans, searchTerm, onDelete, onEdit, onView }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter]);

  const handlePrintReceipt = (member: Member) => {
    const plan = plans.find(p => p.id === member.planId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <div dir="rtl" style="font-family: 'Almarai', sans-serif; padding: 40px; text-align: right; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px;">
        <div style="display: flex; justify-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px;">
           <div>
              <h1 style="color: #4f46e1; margin: 0; font-size: 20px; font-weight: 800;">جيم الجلاء الرياضي</h1>
              <p style="color: #64748b; font-size: 10px; margin-top: 4px;">رقم السند: #${member.id.slice(-6)}</p>
           </div>
           <div style="font-size: 24px;">⚡</div>
        </div>
        
        <div style="margin-bottom: 25px; font-size: 13px;">
          <p style="margin: 6px 0;"><strong>الاسم:</strong> ${member.name}</p>
          <p style="margin: 6px 0;"><strong>نوع الباقة:</strong> ${plan?.name}</p>
          <p style="margin: 6px 0;"><strong>تاريخ الانتهاء:</strong> ${member.endDate}</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #f1f5f9;">
           <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">المبلغ المحصل</p>
           <p style="margin: 6px 0 0 0; font-size: 28px; font-weight: 800; color: #1e293b;">${member.totalPaid.toLocaleString('en-US')} ₪</p>
           ${member.remainingAmount > 0 ? `<p style="margin: 6px 0 0 0; font-size: 12px; color: #ef4444; font-weight: 800;">المبلغ المتبقي: ${member.remainingAmount.toLocaleString('en-US')} ₪</p>` : '<p style="margin: 6px 0 0 0; font-size: 10px; color: #10b981; font-weight: 800;">خالص القيمة ✓</p>'}
        </div>

        <p style="text-align: center; font-size: 9px; color: #94a3b8; margin-top: 30px;">تم الإصدار بواسطة نظام الجلاء برو المكتبي</p>
      </div>
      <script>window.print(); setTimeout(() => window.close(), 500);</script>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Dynamic Filter Section */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية العرض</span>
          <div className="flex gap-1.5">
            <FilterChip active={statusFilter === 'all'} label="الكل" onClick={() => setStatusFilter('all')} />
            <FilterChip active={statusFilter === SubscriptionStatus.ACTIVE} label="نشط" onClick={() => setStatusFilter(SubscriptionStatus.ACTIVE)} />
            <FilterChip active={statusFilter === SubscriptionStatus.EXPIRED} label="منتهي" onClick={() => setStatusFilter(SubscriptionStatus.EXPIRED)} />
            <FilterChip active={statusFilter === SubscriptionStatus.EXPIRING_SOON} label="قريب" onClick={() => setStatusFilter(SubscriptionStatus.EXPIRING_SOON)} />
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase">النتائج المتاحة: {filteredMembers.length.toLocaleString('en-US')}</div>
      </div>

      {/* Main Data Surface */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">المشترك</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">الاشتراك</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">تاريخ الانتهاء</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">المستحقات</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">الحالة</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">أدوات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onView(member)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-extrabold text-slate-500 text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">{member.name.charAt(0)}</div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs hover:text-indigo-600 transition-colors">{member.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600">
                    {plans.find(p => p.id === member.planId)?.name}
                  </td>
                  <td className="px-6 py-5 text-xs font-extrabold text-slate-500">
                    {member.endDate}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-xs font-black ${member.remainingAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {member.remainingAmount.toLocaleString('en-US')} ₪
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-6 py-5 text-left">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionBtn onClick={() => onView(member)} icon={<path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />} />
                      <ActionBtn onClick={() => onEdit(member)} icon={<path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />} />
                      <ActionBtn onClick={() => handlePrintReceipt(member)} icon={<path d="M6.75 3v2.25h10.5V3m-10.5 13.5h10.5M6.75 3a2.25 2.25 0 0 0-2.25 2.25V18a2.25 2.25 0 0 0 2.25 2.25h10.5A2.25 2.25 0 0 0 19.5 18V5.25a2.25 2.25 0 0 0-2.25-2.25" />} />
                      <ActionBtn onClick={() => onDelete(member.id)} variant="danger" icon={<path d="M14.74 9l-.34 9m-4.74 0L9.26 9m9.96-3.24c.06.37.08.75.08 1.14v.13c0 1.1-.9 2-2 2H6.5c-1.1 0-2-.9-2-2v-.13c0-.39.02-.77.08-1.14m12.72 0A49.694 49.694 0 0 0 18 4.5V3c0-1.105-.895-2-2-2H8c-1.105 0-2 .895-2 2v1.5c0 .16-.003.31-.01.46" />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FilterChip = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }: { status: SubscriptionStatus }) => {
  const cfg: any = {
    [SubscriptionStatus.ACTIVE]: "bg-emerald-50 text-emerald-600",
    [SubscriptionStatus.EXPIRED]: "bg-rose-50 text-rose-600",
    [SubscriptionStatus.EXPIRING_SOON]: "bg-amber-50 text-amber-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-tight ${cfg[status] || 'bg-slate-50 text-slate-500'}`}>
      {status}
    </span>
  );
};

const ActionBtn = ({ onClick, icon, variant = 'default' }: any) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-lg transition-all ${variant === 'danger' ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>{icon}</svg>
  </button>
);

export default MemberTable;
