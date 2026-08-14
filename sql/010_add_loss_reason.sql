/* ═══════════════════════════════════════════════════════════════════
   010_add_loss_reason.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันหลัง 008_pdinput_procs.sql (แก้ตาราง/view/proc ที่มีอยู่แล้ว)

   เพิ่มคอลัมน์ loss_reason ให้ fact_production_record (ใส่จากฟอร์ม
   Data Records ตอน add/edit — อ้างอิงแนวทางเดียวกับ BREAKDOWN_REASON
   ใน legacy RawDataTest แต่ผูกกับ record เดียวแทนที่จะแยกตาราง)
   แล้ว propagate ไปยัง view + stored procs ที่เกี่ยวข้อง:
     - vw_oee_productivity      (ใช้โดยทุก controller)
     - sp_add_production_record (POST /api/pd-input)
     - sp_get_pd_input_list     (GET  /api/pd-input — หน้า Data Records)
     - sp_get_dl_eff_detail     (GET  /api/dl-eff/detail — ตาราง Dashboard)
═══════════════════════════════════════════════════════════════════ */

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('fact_production_record') AND name = 'loss_reason'
)
BEGIN
    ALTER TABLE fact_production_record ADD loss_reason NVARCHAR(200) NULL;
    PRINT 'Added column fact_production_record.loss_reason';
END
GO

/* ── view: expose loss_reason ── */
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

/* ── sp_add_production_record: accept @loss_reason (Add Record form) ── */
CREATE OR ALTER PROCEDURE sp_add_production_record
    @production_date   DATE,
    @shift_code        CHAR(1),
    @machine_code      VARCHAR(30),
    @product_code      VARCHAR(30),
    @machine_run_time  DECIMAL(4,1),
    @std_hc            DECIMAL(5,2),
    @std_hour          DECIMAL(5,2),
    @hour_piece_rate   DECIMAL(6,2),
    @actual_output     BIGINT,
    @loss_hour         DECIMAL(5,2),
    @loss_reason       NVARCHAR(200) = NULL,
    @actual_bulk_hr    DECIMAL(5,2) = 0,
    @actual_pallet_hr  DECIMAL(5,2) = 0,
    @actual_assist_hr  DECIMAL(5,2) = 0,
    @actual_hc         INT,
    @source_system     VARCHAR(20) = 'PD',
    @created_by        VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @machine_id INT, @product_id INT, @product_group_id INT;
    DECLARE @mc_speed DECIMAL(10,2), @capacity DECIMAL(10,2), @oee_target DECIMAL(5,3);

    SELECT @machine_id = machine_id, @oee_target = oee_target
    FROM dim_machine WHERE machine_code = @machine_code;

    SELECT @product_id = product_id, @product_group_id = product_group_id,
           @mc_speed = mc_speed_pcs_hr, @capacity = capacity_pcs_hr
    FROM dim_product WHERE product_code = @product_code;

    IF @machine_id IS NULL BEGIN RAISERROR('Machine %s not found', 16, 1, @machine_code); RETURN; END
    IF @product_id IS NULL BEGIN RAISERROR('Product %s not found', 16, 1, @product_code); RETURN; END

    -- Auto-register mapping (ไม่ block การบันทึก)
    IF NOT EXISTS (SELECT 1 FROM map_machine_product_group WHERE machine_id = @machine_id AND product_group_id = @product_group_id)
        INSERT INTO map_machine_product_group (machine_id, product_group_id) VALUES (@machine_id, @product_group_id);

    INSERT INTO fact_production_record (
        production_date, shift_code, machine_id, product_id,
        mc_speed_pcs_hr, capacity_pcs_hr, oee_target,
        machine_run_time, std_hc, std_hour, hour_piece_rate, actual_output,
        loss_hour, loss_reason, actual_bulk_hr, actual_pallet_hr, actual_assist_hr, actual_hc,
        source_system, created_by)
    VALUES (
        @production_date, @shift_code, @machine_id, @product_id,
        @mc_speed, @capacity, @oee_target,
        @machine_run_time, @std_hc, @std_hour, @hour_piece_rate, @actual_output,
        @loss_hour, @loss_reason, @actual_bulk_hr, @actual_pallet_hr, @actual_assist_hr, @actual_hc,
        @source_system, @created_by);

    EXEC sp_refresh_daily_summary @date_from = @production_date, @date_to = @production_date;
END
GO

/* ── sp_get_pd_input_list: return loss_reason (Data Records table) ── */
CREATE OR ALTER PROCEDURE sp_get_pd_input_list
    @dateFrom     DATE        = NULL,
    @dateTo       DATE        = NULL,
    @shift        CHAR(1)     = NULL,
    @productGroup VARCHAR(50) = NULL,
    @productCode  VARCHAR(30) = NULL,
    @page         INT         = 1,
    @pageSize     INT         = 100
AS
BEGIN
    SET NOCOUNT ON;

    IF OBJECT_ID('tempdb..#filtered') IS NOT NULL DROP TABLE #filtered;

    SELECT
        record_id, production_date, shift_code, machine_code,
        product_group_name, product_code, product_description,
        mc_speed_pcs_hr, capacity_pcs_hr, oee_target,
        machine_run_time, std_hc, std_hour, hour_piece_rate,
        actual_output, loss_hour, loss_reason, actual_bulk_hr, actual_pallet_hr,
        actual_assist_hr, actual_hc,
        cal_output_at_oee, std_output,
        productivity_std_pcs_mh, actual_hour, total_loss_hour,
        productivity_ac_pcs_mh,
        ROUND(dl_eff_percent, 2) AS dl_eff_percent,
        is_undone, entry_datetime
    INTO #filtered
    FROM vw_oee_productivity
    WHERE (@dateFrom IS NULL OR production_date >= @dateFrom)
      AND (@dateTo IS NULL OR production_date <= @dateTo)
      AND (@shift IS NULL OR shift_code = @shift)
      AND (@productGroup IS NULL OR product_group_name = @productGroup)
      AND (@productCode IS NULL OR product_code = @productCode);

    SELECT *
    FROM #filtered
    ORDER BY production_date DESC, record_id DESC
    OFFSET (@page - 1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;

    SELECT COUNT(*) AS total FROM #filtered;

    DROP TABLE #filtered;
END
GO

/* ── sp_get_dl_eff_detail: return LOSS_REASON (Dashboard detail table) ── */
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
