/* ═══════════════════════════════════════════════════════════════════
   015_remove_orphan_products.sql
   ─────────────────────────────────────────────────────────────────
   3 product code ที่มีอยู่ใน dim_product (จาก mock seed เดิม) แต่ไม่มี
   อยู่ใน Product_SMS.xlsx เลย: 310580-30, 311080-30, 311580-30
   ยืนยันกับ Sirawit แล้ว (2026-08-15): ลบทิ้งได้เลย รวมถึง
   fact_production_record ที่อ้างอิงอยู่ด้วย (ติด FK ลบเฉพาะ dim_product
   ไม่ได้) — มี record จริง (ไม่ใช่ mock) ที่เสียไปด้วย 4 แถว:
   record_id 369, 228, 265, 353 (ทั้งหมดอ้างอิง 311080-30/311580-30)

   รันซ้ำได้ (idempotent — ถ้าลบไปแล้วรันซ้ำจะไม่มีอะไรให้ลบ)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

DELETE f
FROM fact_production_record f
JOIN dim_product p ON p.product_id = f.product_id
WHERE p.product_code IN (N'310580-30', N'311080-30', N'311580-30');
PRINT CONCAT('Deleted ', @@ROWCOUNT, ' fact_production_record rows referencing orphan product codes');
GO

DELETE FROM dim_product
WHERE product_code IN (N'310580-30', N'311080-30', N'311580-30');
PRINT CONCAT('Deleted ', @@ROWCOUNT, ' orphan dim_product rows');
GO
