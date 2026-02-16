
import { Member, Plan } from "../types";

export const exportToCSV = (members: Member[], plans: Plan[]) => {
  // العناوين المحدثة
  const headers = [
    "الاسم", 
    "الهاتف", 
    "نوع الاشتراك", 
    "تاريخ البدء", 
    "تاريخ الانتهاء", 
    "المبلغ المدفوع", 
    "المبلغ المتبقي", 
    "طريقة الدفع", 
    "الحالة", 
    "ملاحظات"
  ];
  
  // تحويل البيانات إلى صفوف
  const rows = members.map(member => {
    const plan = plans.find(p => p.id === member.planId);
    return [
      member.name,
      member.phone,
      plan?.name || "غير محدد",
      member.startDate,
      member.endDate,
      member.totalPaid,
      member.remainingAmount,
      member.paymentMethod,
      member.status,
      member.notes.replace(/,/g, " ") // إزالة الفواصل لتجنب تداخل الأعمدة
    ];
  });

  // دمج العناوين مع الصفوف
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  // إضافة BOM لدعم العربية في Excel (UTF-8 with BOM)
  const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // إنشاء رابط تحميل وتفعيله
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `gym_alaa_members_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
