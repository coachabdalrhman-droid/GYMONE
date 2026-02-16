
import { Plan, Member, SubscriptionStatus } from './types';

export const INITIAL_PLANS: Plan[] = [
  { id: '1', name: 'اشتراك شهري', price: 120, durationMonths: 1, description: 'دخول كامل للصالة الرياضية' },
  { id: '2', name: 'اشتراك 3 شهور', price: 300, durationMonths: 3, description: 'وفر 60 شيكل + حصة تدريبية مجانية' },
  { id: '3', name: 'اشتراك سنوي', price: 1000, durationMonths: 12, description: 'أفضل قيمة: دخول كامل طوال العام' },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: '101',
    name: 'أحمد محمد',
    phone: '0501234567',
    email: 'ahmed@example.com',
    planId: '1',
    startDate: '2024-05-01',
    endDate: '2024-06-01',
    status: SubscriptionStatus.ACTIVE,
    notes: 'يفضل التدريب صباحاً',
    totalPaid: 120,
    remainingAmount: 0,
    paymentMethod: 'نقدي'
  },
  {
    id: '102',
    name: 'سارة خالد',
    phone: '0559876543',
    email: 'sara@example.com',
    planId: '2',
    startDate: '2024-02-15',
    endDate: '2024-05-15',
    status: SubscriptionStatus.EXPIRING_SOON,
    notes: 'تحتاج تجديد الأسبوع القادم',
    totalPaid: 200,
    remainingAmount: 100,
    paymentMethod: 'بنكي'
  }
];

export const calculateStatus = (endDate: string): SubscriptionStatus => {
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return SubscriptionStatus.EXPIRED;
  if (diffDays <= 7) return SubscriptionStatus.EXPIRING_SOON;
  return SubscriptionStatus.ACTIVE;
};
