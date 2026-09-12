/* ═══════════════════════════════════════════════════════════════════
   025_std_output_headcount.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว (แก้ fact_production_record) — รันซ้ำได้

   ปัญหาเดิม:
     std_output ของ Manual machine (ไม่มี mc_speed_pcs_hr, ใช้
     capacity_pcs_hr แทน) คำนวณจาก capacity_pcs_hr * machine_run_time
     เท่านั้น — ไม่คูณด้วยจำนวนคน (std_hc) ที่ Production กำหนดต่อวัน
     ทั้งที่ capacity_pcs_hr เป็นอัตราต่อคน (pcs/hr ต่อ 1 คน ยืนยันกับ
     ผู้ใช้แล้ว) ผลคือ Prod STD ไม่ขยับตามจำนวนคนที่จัดจริง เช่น
     product 705860-12 วันที่คน 5 คน (capacity 30 pcs/hr) ควรได้
     STD = 5*30 = 150 แต่ระบบเดิมไม่เคยคูณจำนวนคนเข้าไปเลย

   แก้ (ยืนยันกับผู้ใช้แล้ว 2026-09-12):
     - Manual machine: std_output = capacity_pcs_hr * std_hc * machine_run_time
     - เพิ่มคอลัมน์ std_output_v2 (BIT) เป็น feature flag ต่อ record —
       record เก่าทั้งหมด (ก่อน migration นี้) ตั้งเป็น 0 → ยังคำนวณด้วย
       สูตรเดิม (capacity_pcs_hr * machine_run_time) เหมือนเดิมทุก
       ประการ ไม่กระทบ DL Eff ย้อนหลัง; record ใหม่จากนี้ไป default
       เป็น 1 → ใช้สูตรใหม่ที่คูณ std_hc
     - productivity_std_pcs_mh **ไม่แตะ** ตามที่ตกลง — มันคำนวณสูตร
       ของตัวเองแยกต่างหาก (ไม่ได้ reference คอลัมน์ std_output) อยู่
       แล้ว ดังนั้นค่า "Prod STD" (per คน-ชม.) ที่โชว์อยู่ในตาราง
       Data Records / DL Eff เดิม จะไม่เปลี่ยนพฤติกรรมเลย — std_output
       เป็นคอลัมน์ใหม่ที่ต้องเพิ่มไปแสดงแยกต่างหาก (crew-level STD,
       ตัวเลขแบบ 150/180 ในตัวอย่าง) ทั้งฝั่ง Data Records และ DL Eff
       Dashboard (sp_get_dl_eff_detail เดิมไม่เคย select std_output)
═══════════════════════════════════════════════════════════════════ */

/* sqlcmd เปิด QUOTED_IDENTIFIER OFF โดย default — ต้องเปิดไว้ตั้งแต่ต้นไฟล์เพราะตาราง
   มี computed column ที่ persisted/indexed อยู่แล้ว (std_output เดิม) */
SET QUOTED_IDENTIFIER ON;
GO

/* ── 1. std_output_v2: record เก่า = 0 (สูตรเดิม), record ใหม่ default = 1 (สูตรใหม่) ──
   แยก 2 batch (GO คั่น) เพราะ ALTER TABLE ADD คอลัมน์ใหม่แล้วอ้างถึงคอลัมน์นั้น
   ในบล็อก IF/BEGIN เดียวกัน ทำให้ SQL Server compile-error "Invalid column name"
   (deferred name resolution ใช้ไม่ได้กับคอลัมน์ที่เพิ่งเพิ่มเมื่ออยู่ใน control-of-flow
   block เดียวกัน) ── */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'std_output_v2'
)
BEGIN
    ALTER TABLE fact_production_record ADD std_output_v2 BIT NULL;
    PRINT 'Added column fact_production_record.std_output_v2 (nullable, finalizing below)';
END
GO

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'std_output_v2' AND is_nullable = 1
)
BEGIN
    UPDATE fact_production_record SET std_output_v2 = 0 WHERE std_output_v2 IS NULL;
    ALTER TABLE fact_production_record ALTER COLUMN std_output_v2 BIT NOT NULL;
    ALTER TABLE fact_production_record
        ADD CONSTRAINT df_fact_prod_std_output_v2 DEFAULT (1) FOR std_output_v2;
    PRINT 'Finalized fact_production_record.std_output_v2 (existing rows = 0, new rows default = 1)';
END
GO

/* ── 2. rebuild std_output only — cal_output_at_oee / productivity_std_pcs_mh untouched ── */
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
PRINT 'Rebuilt std_output with headcount-aware Manual-machine formula (gated by std_output_v2)';
GO

/* ── 3. expose std_output_v2 for debugging/traceability (optional, not required by UI) ── */
CREATE OR ALTER VIEW vw_oee_productivity AS
SELECT
    f.record_id,
    f.production_date,
    f.shift_code,
    m.machine_code,
    pg.product_group_name,
    p.product_code,
    p.product_description,

    f.mc_speed_pcs_hr,
    f.capacity_pcs_hr,
    f.oee_target,
    f.machine_run_time,
    f.std_hc,
    f.std_hour,
    f.hour_piece_rate,
    f.actual_output,
    f.loss_hour,
    f.loss_reason,
    f.actual_bulk_hr,
    f.actual_pallet_hr,
    f.actual_assist_hr,
    f.actual_hc,

    f.cal_output_at_oee,
    f.std_output,
    f.std_output_v2,
    f.productivity_std_pcs_mh,
    f.actual_hour,
    f.total_loss_hour,
    f.productivity_ac_pcs_mh,
    d.dl_eff_percent,

    f.is_undone,
    f.entry_datetime
FROM fact_production_record f
JOIN dim_machine m         ON m.machine_id = f.machine_id
JOIN dim_product p         ON p.product_id = f.product_id
JOIN dim_product_group pg  ON pg.product_group_id = p.product_group_id
JOIN vw_dl_eff d            ON d.record_id = f.record_id;
GO

/* ── 4. sp_get_dl_eff_detail: add STD_OUTPUT (crew-level, headcount-aware) ── */
CREATE OR ALTER PROCEDURE sp_get_dl_eff_detail
    @dateFrom     DATE        = NULL,
    @dateTo       DATE        = NULL,
    @shift        CHAR(1)     = NULL,
    @productGroup VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        record_id             AS ID,
        production_date       AS PRODUCTION_DATE,
        shift_code            AS SHIFT,
        machine_code          AS MACHINE,
        product_group_name    AS PRODUCT_GROUP,
        product_code          AS PRODUCT_CODE,
        product_description   AS PRODUCT_DESC,
        actual_hc             AS ACTUAL_HC,
        std_hc                AS STD_HC,
        machine_run_time      AS MC_RUN_TIME,
        std_hour               AS STD_HOUR,
        hour_piece_rate       AS HOUR_PIECE_RATE,
        loss_hour             AS LOSS_HOUR,
        loss_reason           AS LOSS_REASON,
        actual_bulk_hr        AS ACTUAL_BULK,
        actual_pallet_hr      AS ACTUAL_PALLET,
        actual_assist_hr      AS ACTUAL_ASSIST,
        actual_output         AS ACTUAL_OUTPUT,
        std_output            AS STD_OUTPUT,
        productivity_std_pcs_mh,
        productivity_ac_pcs_mh,
        ROUND(dl_eff_percent, 2) AS dlEff
    FROM vw_oee_productivity
    WHERE (@dateFrom IS NULL OR production_date >= @dateFrom)
      AND (@dateTo IS NULL OR production_date <= @dateTo)
      AND (@shift IS NULL OR shift_code = @shift)
      AND (@productGroup IS NULL OR product_group_name = @productGroup)
    ORDER BY production_date DESC, shift_code;
END
GO
