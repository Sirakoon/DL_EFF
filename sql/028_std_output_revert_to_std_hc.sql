/* ═══════════════════════════════════════════════════════════════════
   028_std_output_revert_to_std_hc.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว (แก้ fact_production_record) — รันซ้ำได้

   แก้กลับ: DB จริงมีสูตร std_output (Manual machine, std_output_v2 = 1)
   ที่คูณด้วย actual_hc อยู่ (ทดลองแล้วยกเลิก) — ผู้ใช้ยืนยันให้กลับไปใช้
   std_hc ตามที่ 025_std_output_headcount.sql ตั้งใจไว้แต่แรก:

     std_output = capacity_pcs_hr * std_hc * machine_run_time

   Auto machine (มี mc_speed_pcs_hr) และ record เก่า (std_output_v2 = 0)
   ไม่เปลี่ยน — เหมือนเดิมทุกประการ
═══════════════════════════════════════════════════════════════════ */

SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'std_output')
BEGIN
    ALTER TABLE fact_production_record DROP COLUMN std_output;
    PRINT 'Dropped column fact_production_record.std_output (will be recreated below)';
END
GO

SET QUOTED_IDENTIFIER ON;
GO

ALTER TABLE fact_production_record ADD
    std_output AS (
        CASE
            WHEN mc_speed_pcs_hr IS NOT NULL THEN mc_speed_pcs_hr * oee_target * machine_run_time
            WHEN std_output_v2 = 1           THEN capacity_pcs_hr * std_hc * machine_run_time
            ELSE capacity_pcs_hr * machine_run_time
        END
    ) PERSISTED;
PRINT 'Reverted std_output: Manual-machine formula back to std_hc';
GO
