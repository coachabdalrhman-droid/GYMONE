
import React from 'react';
import { Member, Plan, SubscriptionStatus } from '../types';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  plans: Plan[];
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ isOpen, onClose, member, plans }) => {
  if (!isOpen || !member) return null;

  const plan = plans.find(p => p.id === member.planId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="bg-[#020617] p-10 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mt-32 -mr-32 blur-[60px]"></div>
          <button onClick={onClose} className="absolute left-8 top-8 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all text-xl">
            &times;
          </button>
          
          <div className="flex items-end gap-8 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-600/30">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-black mb-2">{member.name}</h2>
              <div className="flex items-center gap-4">
                <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-slate-300 border border-white/5">#{member.id.slice(-6)}</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${member.status === SubscriptionStatus.ACTIVE ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {member.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Info Side */}
          <div className="space-y-8">
            <SectionTitle title="المعلومات الشخصية" />
            <div className="space-y-4">
              <DetailRow label="رقم الهاتف" value={member.phone} icon="📞" />
              <DetailRow label="البريد الإلكتروني" value={member.email || 'غير متوفر'} icon="✉️" />
              <DetailRow label="تاريخ الانضمام" value={member.startDate} icon="📅" />
              <DetailRow label="تاريخ الانتهاء" value={member.endDate} icon="⌛" />
            </div>

            <SectionTitle title="ملاحظات النظام" />
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[100px] text-sm text-slate-600 font-bold leading-relaxed italic">
              {member.notes || 'لا توجد ملاحظات مسجلة لهذا العضو حتى الآن.'}
            </div>
          </div>

          {/* Financial Side */}
          <div className="space-y-8">
            <SectionTitle title="حالة العضوية والمالية" />
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">نوع الباقة الحالية</span>
                <span className="text-indigo-600 font-black text-sm">{plan?.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                 <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-black uppercase mb-1">إجمالي المدفوع</p>
                    <p className="text-2xl font-black text-emerald-700">{member.totalPaid.toLocaleString('en-US')} ₪</p>
                 </div>
                 <div className={`text-center p-4 rounded-2xl border ${member.remainingAmount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] font-black uppercase mb-1 ${member.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>المبلغ المتبقي</p>
                    <p className={`text-2xl font-black ${member.remainingAmount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>{member.remainingAmount.toLocaleString('en-US')} ₪</p>
                 </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-4">
                 <span className="font-bold text-slate-400">طريقة الدفع الأخيرة</span>
                 <span className="font-black text-slate-700">{member.paymentMethod}</span>
              </div>
            </div>

            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
               <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">📊</span>
                  <h4 className="text-xs font-black text-indigo-900 uppercase">سجل الدفعات الأخير</h4>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 text-[11px] font-bold">
                     <span className="text-slate-500">{member.startDate}</span>
                     <span className="text-slate-800">تحصيل دفعة أولية</span>
                     <span className="text-emerald-600 font-black">+{member.totalPaid.toLocaleString('en-US')} ₪</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-slate-500 font-black text-sm hover:bg-slate-100 rounded-2xl transition-all">إغلاق النافذة</button>
          <button 
            onClick={() => window.open(`https://wa.me/${member.phone.replace(/^0/, '970')}`, '_blank')}
            className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-xl">💬</span> مراسلة المشترك
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-3">
    {title}
    <div className="flex-1 h-px bg-slate-200"></div>
  </h3>
);

const DetailRow = ({ label, value, icon }: any) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
        <span className="text-sm">{icon}</span>
      </div>
      <span className="text-xs font-bold text-slate-400">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-800">{value}</span>
  </div>
);

export default MemberDetailModal;
