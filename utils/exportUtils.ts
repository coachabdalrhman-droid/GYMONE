
import { Member, Plan } from "../types";
import * as XLSX from 'xlsx';

/**
 * وظيفة تصدير البيانات إلى ملف Excel حقيقي (.xlsx)
 * تضمن هذه الوظيفة ظهور البيانات في أعمدة منفصلة ومن اليمين لليسار بشكل تلقائي
 */
export const exportToExcel = (members: Member[], plans: Plan[]) => {
  try {
    // 1. تجهيز البيانات وتحويلها إلى مصفوفة من الكائنات بأسماء أعمدة واضحة باللغة العربية
    const excelData = members.map(member => {
      const plan = plans.find(p => p.id === member.planId);
      return {
        "اسم المشترك": member.name,
        "رقم الهاتف": member.phone,
        "نوع الاشتراك": plan?.name || "غير محدد",
        "تاريخ البدء": member.startDate,
        "تاريخ الانتهاء": member.endDate,
        "قيمة الاشتراك": plan?.price || 0,
        "المبلغ المدفوع": member.totalPaid,
        "المبلغ المتبقي": member.remainingAmount,
        "طريقة الدفع": member.paymentMethod,
        "الحالة": member.status,
        "ملاحظات": member.notes || ""
      };
    });

    // 2. إنشاء ورقة عمل (Worksheet) من البيانات
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 3. ضبط اتجاه الورقة ليكون من اليمين لليسار (RTL) ليتناسب مع اللغة العربية في إكسل
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'] = [{ RTL: true }];

    // 4. تحديد عرض الأعمدة تلقائياً (تعديل الأرقام بناءً على طول المحتوى المتوقع)
    const columnWidths = [
      { wch: 25 }, // اسم المشترك
      { wch: 15 }, // رقم الهاتف
      { wch: 15 }, // نوع الاشتراك
      { wch: 12 }, // تاريخ البدء
      { wch: 12 }, // تاريخ الانتهاء
      { wch: 12 }, // قيمة الاشتراك
      { wch: 12 }, // المبلغ المدفوع
      { wch: 12 }, // المبلغ المتبقي
      { wch: 12 }, // طريقة الدفع
      { wch: 15 }, // الحالة
      { wch: 30 }, // ملاحظات
    ];
    worksheet['!cols'] = columnWidths;

    // 5. إنشاء كتاب العمل (Workbook) وإضافة الورقة إليه
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "كشف المشتركين");

    // 6. توليد اسم الملف
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const fileName = `مشتركي_جيم_الجلاء_${dateStr}.xlsx`;

    // 7. كتابة الملف وتنزيله بصيغة ثنائية .xlsx (تضمن التقسيم لأعمدة)
    XLSX.writeFile(workbook, fileName);
    
    console.log("✅ تم تصدير ملف Excel بنجاح.");
  } catch (error) {
    console.error("❌ خطأ أثناء تصدير ملف Excel:", error);
    alert("حدث خطأ أثناء محاولة تصدير الملف. تأكد من أن البيانات صحيحة.");
  }
};

// الحفاظ على التوافق مع أي استدعاء قديم باسم exportToCSV
export const exportToCSV = exportToExcel;
