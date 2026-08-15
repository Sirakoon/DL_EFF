/* ═══════════════════════════════════════════════════════════════════
   014_backfill_snapshot_values.sql
   ─────────────────────────────────────────────────────────────────
   fact_production_record เก็บ mc_speed_pcs_hr / capacity_pcs_hr /
   oee_target เป็น "snapshot" ตอน insert (sp_add_production_record) —
   ไม่ได้ join สดกับ dim_product/dim_machine ตอนอ่าน ดังนั้นแถวเก่าที่
   บันทึกไว้ก่อน 011/012/013 (แก้สูตร + แก้ master data) ยังพก snapshot
   ค่าเก่า/ผิดติดอยู่ ทำให้ cal_output_at_oee/std_output/
   productivity_std_pcs_mh (computed จาก snapshot ในแถวเดียวกัน) ยังผิดอยู่

   ไฟล์นี้ backfill snapshot ของ "แถวที่ไม่ใช่ mock data" เท่านั้น
   (created_by <> 'mock_data_script' ตามที่ตกลงกันไว้ว่าข้าม mock data
   ไปเลย ไม่ต้องไปยุ่ง) ให้ตรงกับ dim_product/dim_machine ปัจจุบัน แล้ว
   รีเฟรช fact_daily_summary ของช่วงวันที่ที่ได้รับผลกระทบ

   รันซ้ำได้ (idempotent — UPDATE ค่าเดิมซ้ำก็ได้ผลลัพธ์เดิม)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

UPDATE f
SET
    f.mc_speed_pcs_hr = p.mc_speed_pcs_hr,
    f.capacity_pcs_hr = p.capacity_pcs_hr,
    f.oee_target      = m.oee_target
FROM fact_production_record f
JOIN dim_product p  ON p.product_id = f.product_id
JOIN dim_machine m  ON m.machine_id = f.machine_id
WHERE ISNULL(f.created_by, '') <> 'mock_data_script';

PRINT CONCAT('Backfilled snapshot values for ', @@ROWCOUNT, ' non-mock records');
GO

DECLARE @dateFrom DATE, @dateTo DATE;
SELECT @dateFrom = MIN(production_date), @dateTo = MAX(production_date)
FROM fact_production_record
WHERE ISNULL(created_by, '') <> 'mock_data_script';

IF @dateFrom IS NOT NULL
BEGIN
    EXEC sp_refresh_daily_summary @date_from = @dateFrom, @date_to = @dateTo;
    PRINT CONCAT('Refreshed fact_daily_summary for ', @dateFrom, ' .. ', @dateTo);
END
GO
