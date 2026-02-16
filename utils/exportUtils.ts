
import { Member, Plan } from "../types";
import * as XLSX from 'xlsx';

export const exportToExcel = (members: Member[], plans: Plan[]) => {
  // تحويل البيانات لشكل يفهمه الإكسل كصفوف وأعمدة
  const data = members.map(member => {
    const plan = plans.find(p => p.id === member.planId);
    return {
      "اسم المشترك": member.name,
      "رقم الهاتف": member.phone,
      "نوع الاشتراك": plan?.name || "غير محدد",
      "تاريخ البدء": member.startDate,
      "تاريخ الانتهاء": member.endDate,
      "سعر الاشتراك (₪)": plan?.price || 0,
      "المبلغ المدفوع (₪)": member.totalPaid,
      "المبلغ المتبقي (₪)": member.remainingAmount,
      "طريقة الدفع": member.paymentMethod,
      "الحالة": member.status,
      "ملاحظات": member.notes
    };
  });

  // إنشاء ورقة عمل (Worksheet)
  const worksheet = XLSX.utils.json_to_sheet(data);

  // إعداد اتجاه النص من اليمين لليسار (RTL) في الإكسل
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ RTL: true });

  // ضبط عرض الأعمدة تلقائياً بشكل تقريبي
  const wscols = [
    { wch: 20 }, // اسم المشترك
    { wch: 15 }, // رقم الهاتف
    { wch: 15 }, // نوع الاشتراك
    { wch: 12 }, // تاريخ البدء
    { wch: 12 }, // تاريخ الانتهاء
    { wch: 12 }, // سعر الاشتراك
    { wch: 12 }, // المدفوع
    { wch: 12 }, // المتبقي
    { wch: 12 }, // طريقة الدفع
    { wch: 12 }, // الحالة
    { wch: 30 }, // ملاحظات
  ];
  worksheet['!cols'] = wscols;

  // إنشاء كتاب عمل (Workbook) وإضافة الورقة له
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "المشتركين");

  // تنزيل الملف بصيغة .xlsx
  const timestamp = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
  XLSX.writeFile(workbook, `بيانات_جيم_الجلاء_${timestamp}.xlsx`);
};

// للحفاظ على التوافق مع الكود القديم إذا تم استدعاؤه باسم exportToCSV
export const exportToCSV = exportToExcel;
