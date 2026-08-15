/* ═══════════════════════════════════════════════════════════════════
   011_fix_std_output_auto_manual.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว (แก้ fact_production_record ที่สร้าง
   จาก 003_create_fact_tables.sql ไปแล้ว) — รันซ้ำได้ (idempotent)

   ปัญหาเดิม (พบตอนเทียบกับ Data Collection_Design.xlsm + Product_SMS.xlsx
   ของ Pook):
     1. cal_output_at_oee / std_output / productivity_std_pcs_mh ใช้สูตร
        mc_speed_pcs_hr * oee_target * 60 * machine_run_time กับทุกเครื่อง
        เหมือนกันหมด ไม่แยก Auto/Manual เลย ทั้งที่มีคอลัมน์
        capacity_pcs_hr เก็บไว้อยู่แล้วแต่ไม่เคยถูกใช้ในสูตรไหนเลย —
        ผลคือเครื่อง Manual (mc_speed_pcs_hr เป็น NULL ตาม Product_SMS)
        ได้ std_output/productivity_std_pcs_mh = NULL เสมอ → DL Eff
        ผิดทั้งหมดสำหรับกลุ่ม Manual
     2. ตัวคูณ *60 ในสูตรเดิมสมมติว่า mc_speed_pcs_hr เป็นหน่วย pcs/นาที
        แต่ Product_SMS.xlsx (sheet ProductG_Std) และคอลัมน์ DB เองระบุ
        หน่วยเป็น pcs/ชม. ตรงกัน (ไม่ต้องคูณ 60 ซ้ำ) — ของเดิมจะได้
        STD output สูงเกินจริง 60 เท่าสำหรับเครื่อง Auto ทุกเครื่อง

   สูตรใหม่ (ยืนยันกับ Pook แล้ว 2026-08-15 — หลักการคำนวณเหมือนเดิม
   ต่างกันแค่แหล่งที่มาของ "rate" ที่ใช้หา STD output):
     - Auto machine   (มี mc_speed_pcs_hr): rate = mc_speed_pcs_hr * oee_target
     - Manual machine (ไม่มี mc_speed_pcs_hr, มี capacity_pcs_hr แทน):
                                             rate = capacity_pcs_hr
     - std_output ทั้งสองแบบ = rate * machine_run_time (โครงสร้างเดิม
       ตาม Table_Design sheet แถว 22-23 ไม่เปลี่ยน แค่สลับแหล่ง rate)
═══════════════════════════════════════════════════════════════════ */

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'ix_fact_dl_eff_support'
)
BEGIN
    DROP INDEX ix_fact_dl_eff_support ON fact_production_record;
    PRINT 'Dropped index ix_fact_dl_eff_support';
END
GO

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'cal_output_at_oee')
BEGIN
    ALTER TABLE fact_production_record DROP COLUMN cal_output_at_oee;
END
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'std_output')
BEGIN
    ALTER TABLE fact_production_record DROP COLUMN std_output;
END
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'productivity_std_pcs_mh')
BEGIN
    ALTER TABLE fact_production_record DROP COLUMN productivity_std_pcs_mh;
END
GO

SET QUOTED_IDENTIFIER ON;
GO

ALTER TABLE fact_production_record ADD
    cal_output_at_oee AS (
        CASE WHEN mc_speed_pcs_hr IS NOT NULL THEN mc_speed_pcs_hr * oee_target END
    ) PERSISTED,
    std_output AS (
        CASE
            WHEN mc_speed_pcs_hr IS NOT NULL THEN mc_speed_pcs_hr * oee_target * machine_run_time
            ELSE capacity_pcs_hr * machine_run_time
        END
    ) PERSISTED,
    productivity_std_pcs_mh AS (
        (CASE
            WHEN mc_speed_pcs_hr IS NOT NULL THEN mc_speed_pcs_hr * oee_target * machine_run_time
            ELSE capacity_pcs_hr * machine_run_time
        END) / NULLIF(std_hc * std_hour, 0)
    ) PERSISTED;
PRINT 'Rebuilt cal_output_at_oee / std_output / productivity_std_pcs_mh with Auto/Manual split';
GO

SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'ix_fact_dl_eff_support'
)
BEGIN
    CREATE INDEX ix_fact_dl_eff_support ON fact_production_record(productivity_std_pcs_mh, productivity_ac_pcs_mh, total_loss_hour, production_date, machine_id);
    PRINT 'Recreated index ix_fact_dl_eff_support';
END
GO
