/* ═══════════════════════════════════════════════════════════════════
   021_truncate_demo_data.sql
   ─────────────────────────────────────────────────────────────────
   ลบข้อมูล demo/mock ออกจาก fact_production_record แบบเจาะจงเฉพาะแถวที่
   ถูก tag ไว้จาก 2 สคริปต์ seed สำหรับทดสอบ/เดโม (ไม่กระทบข้อมูลจริงที่
   กรอกผ่านหน้าเว็บ PD Input เลย เพราะ record จริงไม่มี created_by ตรงกับ
   ค่าพวกนี้):
     - 'demo_seed'        มาจาก 019_demo_seed_realistic_data.sql
     - 'mock_data_script' มาจาก seed_mock_pd_data_aug2026.sql

   รีเฟรช fact_daily_summary เฉพาะช่วงวันที่ที่ได้รับผลกระทบให้อัตโนมัติ
   หลังลบเสร็จ

   ไม่ reseed identity column (ต่างจาก 018_clear_all_production_records.sql
   ที่ล้างทั้งตาราง) เพราะสคริปต์นี้ลบแบบเจาะจง ข้อมูลจริงที่เหลืออยู่ต้อง
   คง record_id เดิมไว้

   รันซ้ำได้ (idempotent — ถ้าไม่มีแถว demo/mock เหลืออยู่แล้วจะไม่มีอะไร
   ให้ลบ)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
GO

DECLARE @dateFrom DATE, @dateTo DATE, @deletedCount INT;

SELECT @dateFrom = MIN(production_date), @dateTo = MAX(production_date)
FROM fact_production_record
WHERE created_by IN ('demo_seed', 'mock_data_script');

DELETE FROM fact_production_record
WHERE created_by IN ('demo_seed', 'mock_data_script');

SET @deletedCount = @@ROWCOUNT;
PRINT CONCAT('Deleted ', @deletedCount, ' demo/mock rows from fact_production_record');

IF @dateFrom IS NOT NULL
BEGIN
    EXEC sp_refresh_daily_summary @date_from = @dateFrom, @date_to = @dateTo;
    PRINT CONCAT('Refreshed fact_daily_summary for ', @dateFrom, ' to ', @dateTo);
END
ELSE
BEGIN
    PRINT 'No demo/mock rows found — nothing to delete.';
END
GO
