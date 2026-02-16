
export enum SubscriptionStatus {
  ACTIVE = 'نشط',
  EXPIRED = 'منتهي',
  EXPIRING_SOON = 'قريب الانتهاء',
  PENDING = 'معلق'
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  description: string;
}

export type PaymentMethod = 'نقدي' | 'بنكي' | 'غير محدد';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  notes: string;
  totalPaid: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  method: 'نقدي' | 'بطاقة' | 'تحويل';
}
