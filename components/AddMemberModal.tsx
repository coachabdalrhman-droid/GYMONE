
import React, { useState, useEffect } from 'react';
import { Member, Plan, SubscriptionStatus, PaymentMethod } from '../types';
import { calculateStatus } from '../constants';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  plans: Plan[];
  initialData?: Member | null;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSave, plans, initialData }) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '', phone: '', email: '', planId: plans[0]?.id || '',
    startDate: new Date().toISOString().split('T')[0], notes: '',
    totalPaid: 0, paymentMethod: 'نقدي'
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
      name: '', phone: '', email: '', planId: plans[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0], notes: '',
      totalPaid: 0, paymentMethod: 'نقدي'
    });
  }, [initialData, plans, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === formData.planId);
    if (!plan) return;
    const start = new Date(formData.startDate!);
    const end = new Date(start);
    end.setMonth(start.getMonth() + plan.durationMonths);
    const endDateStr = end.toISOString().split('T')[0];
    const paid = Number(formData.totalPaid) || 0;
    const remaining = Math.max(0, plan.price - paid);

    onSave({
      id: (initialData?.id || Date.now().toString()),
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      planId: formData.planId || plans[0].id,
      startDate: formData.startDate || '',
      endDate: endDateStr,
      status: calculateStatus(endDateStr),
      notes: formData.notes || '',
      totalPaid: paid,
      remainingAmount: remaining,
      paymentMethod: formData.paymentMethod as PaymentMethod || 'نقدي'
    });
    onClose();
  };

  const selectedPlan = plans.find(p => p.id === formData.planId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full h-full md:h-auto md:max-w-xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom md:zoom-in duration-300">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black">{initialData ? 'تعديل بيانات العضو' : 'تسجيل عضو جديد'}</h2>
          <button onClick={onClose} className="text-3xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">المعلومات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="الاسم الكامل" required value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
              <Input label="رقم الهاتف" required type="tel" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">تفاصيل الاشتراك</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الاشتراك</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                  value={formData.planId} onChange={e => setFormData({ ...formData, planId: e.target.value })}>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString('en-US')} شيكل)</option>)}
                </select>
              </div>
              <Input label="تاريخ البدء" type="date" value={formData.startDate} onChange={v => setFormData({ ...formData, startDate: v })} />
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-indigo-600 flex items-center gap-2">💳 الدفع والتحصيل</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="المبلغ المدفوع" type="number" value={formData.totalPaid} onChange={v => setFormData({ ...formData, totalPaid: Number(v) })} />
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">طريقة الدفع</label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                  value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}>
                  <option value="نقدي">نقدي</option>
                  <option value="بنكي">بنكي</option>
                </select>
              </div>
            </div>
            {selectedPlan && (
              <div className="flex justify-between text-[11px] font-black px-1 pt-2 border-t border-slate-200">
                <span className="text-slate-400">سعر الاشتراك: {selectedPlan.price.toLocaleString('en-US')} شيكل</span>
                <span className={Math.max(0, selectedPlan.price - (Number(formData.totalPaid) || 0)) > 0 ? 'text-red-500' : 'text-emerald-500'}>
                  المتبقي: {Math.max(0, selectedPlan.price - (Number(formData.totalPaid) || 0)).toLocaleString('en-US')} شيكل
                </span>
              </div>
            )}
          </div>

          <div className="pb-8 md:pb-0">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">ملاحظات إضافية</label>
            <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[80px]"
              value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="اكتب أي ملاحظات هنا..." />
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold text-sm">إلغاء</button>
          <button onClick={handleSubmit} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            {initialData ? 'حفظ التعديلات' : 'تأكيد التسجيل'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, type = "text", ...props }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}</label>
    <input type={type} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
      value={props.value} onChange={e => props.onChange(e.target.value)} required={props.required} />
  </div>
);

export default AddMemberModal;
