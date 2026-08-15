/* ═══════════════════════════════════════════════════════════════════
   018_clear_all_production_records.sql
   ─────────────────────────────────────────────────────────────────
   ล้าง fact_production_record ทั้งหมด (1,363 แถว ณ วันที่เขียนไฟล์นี้)
   ยืนยันกับ Sirawit แล้ว (2026-08-15): ทั้งตารางเป็นข้อมูลทดสอบ/dev
   ทั้งหมด (mock_data_script 999 แถว + record ที่เหลือ 364 แถวก็เป็น
   ข้อมูลทดสอบเช่นกัน พบว่าจับคู่เครื่อง↔product ผิดเยอะ, actual_output
   เกินกำลังการผลิตจริงหลายสิบเท่า, DL Eff% พุ่งสูงผิดปกติทั้งคู่) —
   ไม่มีข้อมูลที่ต้องเก็บไว้เป็นประวัติจริง เคลียร์ทิ้งทั้งหมด เริ่มตาราง
   ใหม่ รอข้อมูลจริงจากการกรอกผ่านหน้าเว็บ PD Input ต่อจากนี้

   ล้าง fact_daily_summary (cache สรุปรายวัน) ไปด้วยเพราะข้อมูลอ้างอิงถึง
   fact_production_record ที่ถูกลบไปแล้ว

   รันซ้ำได้ (idempotent — ถ้าตารางว่างอยู่แล้วจะไม่มีอะไรให้ลบ)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

DELETE FROM fact_production_record;
PRINT CONCAT('Deleted ', @@ROWCOUNT, ' rows from fact_production_record');
GO

DELETE FROM fact_daily_summary;
PRINT CONCAT('Deleted ', @@ROWCOUNT, ' rows from fact_daily_summary');
GO

DBCC CHECKIDENT ('fact_production_record', RESEED, 0);
DBCC CHECKIDENT ('fact_daily_summary', RESEED, 0);
PRINT 'Reseeded identity columns back to 0';
GO
