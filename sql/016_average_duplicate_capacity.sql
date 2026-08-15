/* ═══════════════════════════════════════════════════════════════════
   016_average_duplicate_capacity.sql
   ─────────────────────────────────────────────────────────────────
   5 product code นี้มี 2 แถวใน Product_SMS.xlsx (sheet ProductG_Std)
   ค่า capacity ไม่เท่ากัน (ชื่อมี suffix "_1"/"_2" กำกับ ลักษณะเหมือน
   time-study วัดหลายรอบ) — 012_reload_master_data.sql ตอนแรกเก็บแค่
   ค่าแถวแรกไว้ ยืนยันกับ Sirawit แล้ว (2026-08-15): ใช้ค่าเฉลี่ยของทั้ง
   สองแทน

     66550-21  : (69.17755572636435 + 59.21052631578947) / 2 = 64.19404102107691
     76408-15  : (53.635280095351604 + 46.13018964633521) / 2 = 49.88273487084341
     76500-00  : (35.307963907414674 + 29.3446364525595)  / 2 = 32.326300179987086
     76510-00  : (40.59539918809202 + 32.72727272727273)  / 2 = 36.66133595768237
     967784-00 : (63.60424028268551 + 59.21052631578947)  / 2 = 61.407383299237495

   รันซ้ำได้ (idempotent)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
GO

UPDATE dim_product SET capacity_pcs_hr = 64.19404102107691, updated_at = SYSUTCDATETIME() WHERE product_code = N'66550-21';
UPDATE dim_product SET capacity_pcs_hr = 49.88273487084341, updated_at = SYSUTCDATETIME() WHERE product_code = N'76408-15';
UPDATE dim_product SET capacity_pcs_hr = 32.326300179987086, updated_at = SYSUTCDATETIME() WHERE product_code = N'76500-00';
UPDATE dim_product SET capacity_pcs_hr = 36.66133595768237, updated_at = SYSUTCDATETIME() WHERE product_code = N'76510-00';
UPDATE dim_product SET capacity_pcs_hr = 61.407383299237495, updated_at = SYSUTCDATETIME() WHERE product_code = N'967784-00';
GO
