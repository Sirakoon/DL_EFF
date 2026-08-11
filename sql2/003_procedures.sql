/* ═══════════════════════════════════════════════════════════════════
   003_procedures.sql
   ─────────────────────────────────────────────────────────────────
   สแกน (script) ออกมาจากฐานข้อมูล RealTimeUpdate จริงที่กำลังใช้งานอยู่
   ผ่าน sp_helptext บน sys.procedures — ต้องรันหลัง 001_tables.sql และ
   002_views.sql

   สร้างเมื่อ: 2026-08-06

   รวม 9 stored procedures: sp_add_production_record,
   sp_get_dashboard_filters, sp_get_dashboard_machine_performance,
   sp_get_dl_eff_detail, sp_get_dl_eff_filters, sp_get_dl_eff_overview,
   sp_get_pd_input_filters, sp_get_pd_input_list, sp_refresh_daily_summary
═══════════════════════════════════════════════════════════════════ */

-- Procedure: dbo.sp_add_production_record
CREATE PROCEDURE sp_add_production_record
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
        loss_hour, actual_bulk_hr, actual_pallet_hr, actual_assist_hr, actual_hc,
        source_system, created_by)
    VALUES (
        @production_date, @shift_code, @machine_id, @product_id,
        @mc_speed, @capacity, @oee_target,
        @machine_run_time, @std_hc, @std_hour, @hour_piece_rate, @actual_output,
        @loss_hour, @actual_bulk_hr, @actual_pallet_hr, @actual_assist_hr, @actual_hc,
        @source_system, @created_by);
    EXEC sp_refresh_daily_summary @date_from = @production_date, @date_to = @production_date;
END
GO

-- Procedure: dbo.sp_get_dashboard_filters
CREATE PROCEDURE sp_get_dashboard_filters
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT machine_code AS val FROM vw_oee_productivity ORDER BY val;
    SELECT DISTINCT shift_code AS val FROM vw_oee_productivity ORDER BY val;
    SELECT DISTINCT product_group_name AS val FROM vw_oee_productivity ORDER BY val;
END
GO

-- Procedure: dbo.sp_get_dashboard_machine_performance
CREATE PROCEDURE sp_get_dashboard_machine_performance
    @dateFrom     DATE          = NULL,
    @dateTo       DATE          = NULL,
    @machine      VARCHAR(30)   = NULL,
    @shift        CHAR(1)       = NULL,
    @productGroup VARCHAR(50)   = NULL,
    @page         INT           = 1,
    @pageSize     INT           = 10
AS
BEGIN
    SET NOCOUNT ON;
    IF OBJECT_ID('tempdb..#filtered') IS NOT NULL DROP TABLE #filtered;
    SELECT machine_code, product_group_name, machine_run_time, loss_hour,
           actual_output, actual_hour
    INTO #filtered
    FROM vw_oee_productivity
    WHERE (@dateFrom IS NULL OR production_date >= @dateFrom)
      AND (@dateTo IS NULL OR production_date <= @dateTo)
      AND (@machine IS NULL OR machine_code = @machine)
      AND (@shift IS NULL OR shift_code = @shift)
      AND (@productGroup IS NULL OR product_group_name = @productGroup);
    /* 1) KPI summary */
    SELECT
        COUNT(DISTINCT machine_code)                                     AS machineCount,
        SUM(machine_run_time)                                            AS totalRunTime,
        SUM(loss_hour)                                                   AS totalLossHour,
        SUM(CAST(actual_output AS FLOAT)) / NULLIF(SUM(actual_hour), 0) AS avgOutputPerHr
    FROM #filtered;
    /* 2) highest-loss machine */
    SELECT TOP 1
        machine_code AS MACHINE,
        SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100 AS lossRate
    FROM #filtered
    GROUP BY machine_code
    ORDER BY lossRate DESC;
    /* 3) loss by machine (top 10) */
    SELECT TOP 10
        machine_code AS MACHINE,
        ROUND(SUM(loss_hour), 1) AS lossHour
    FROM #filtered
    GROUP BY machine_code
    ORDER BY lossHour DESC;
    /* 4) output by machine (top 10) */
    SELECT TOP 10
        machine_code AS MACHINE,
        CAST(ROUND(SUM(CAST(actual_output AS FLOAT)) / NULLIF(SUM(actual_hour), 0), 0) AS INT) AS outputPerHr
    FROM #filtered
    GROUP BY machine_code
    ORDER BY outputPerHr DESC;
    /* 5) run time vs loss (top 10) */
    SELECT TOP 10
        machine_code AS MACHINE,
        ROUND(SUM(machine_run_time), 1) AS runTime,
        ROUND(SUM(loss_hour), 1)        AS lossHour
    FROM #filtered
    GROUP BY machine_code
    ORDER BY runTime DESC;
    /* 6) per-machine loss rate (JS aggregates into normal/watch/problem) */
    SELECT
        machine_code AS MACHINE,
        SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100 AS lossRate
    FROM #filtered
    GROUP BY machine_code;
    /* 7) ranking table (paged) */
    SELECT
        machine_code                                        AS MACHINE,
        MAX(product_group_name)                              AS productGroup,
        CAST(SUM(CAST(actual_output AS BIGINT)) AS BIGINT)  AS totalOutput,
        ROUND(SUM(machine_run_time), 1)                      AS runTime,
        ROUND(SUM(loss_hour), 1)                             AS lossHour,
        ROUND(SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100, 2) AS lossRate
    FROM #filtered
    GROUP BY machine_code
    ORDER BY totalOutput DESC
    OFFSET (@page - 1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
    /* 8) ranking total count */
    SELECT COUNT(DISTINCT machine_code) AS total FROM #filtered;
    DROP TABLE #filtered;
END
GO

-- Procedure: dbo.sp_get_dl_eff_detail
CREATE PROCEDURE sp_get_dl_eff_detail
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
        std_hour              AS STD_HOUR,
        hour_piece_rate       AS HOUR_PIECE_RATE,
        loss_hour             AS LOSS_HOUR,
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

-- Procedure: dbo.sp_get_dl_eff_filters
CREATE PROCEDURE sp_get_dl_eff_filters
AS
BEGIN
    SET NOCOUNT ON;
    SELECT shift_code AS val FROM dim_shift ORDER BY shift_code;
    SELECT product_group_name AS val FROM dim_product_group ORDER BY product_group_name;
END
GO

-- Procedure: dbo.sp_get_dl_eff_overview
CREATE PROCEDURE sp_get_dl_eff_overview
    @dateFrom DATE    = NULL,
    @dateTo   DATE    = NULL,
    @shift    CHAR(1) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        product_group_name,
        shift_code,
        ROUND(AVG(dl_eff_percent), 2) AS avg_dl_eff
    FROM vw_oee_productivity
    WHERE (@dateFrom IS NULL OR production_date >= @dateFrom)
      AND (@dateTo IS NULL OR production_date <= @dateTo)
      AND (@shift IS NULL OR shift_code = @shift)
    GROUP BY product_group_name, shift_code
    ORDER BY product_group_name, shift_code;
END
GO

-- Procedure: dbo.sp_get_pd_input_filters
CREATE PROCEDURE sp_get_pd_input_filters
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT s.shift_code AS val, s.shift_name
    FROM fact_production_record f
    JOIN dim_shift s ON s.shift_code = f.shift_code
    ORDER BY val;
    SELECT DISTINCT pg.product_group_name AS val
    FROM fact_production_record f
    JOIN dim_product p ON p.product_id = f.product_id
    JOIN dim_product_group pg ON pg.product_group_id = p.product_group_id
    ORDER BY val;
    SELECT DISTINCT p.product_code AS val
    FROM fact_production_record f
    JOIN dim_product p ON p.product_id = f.product_id
    ORDER BY val;
END
GO

-- Procedure: dbo.sp_get_pd_input_list
CREATE PROCEDURE sp_get_pd_input_list
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
        actual_output, loss_hour, actual_bulk_hr, actual_pallet_hr,
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

-- Procedure: dbo.sp_refresh_daily_summary
CREATE PROCEDURE sp_refresh_daily_summary
    @date_from DATE, @date_to DATE
AS
BEGIN
    SET NOCOUNT ON;
    MERGE fact_daily_summary AS target
    USING (
        SELECT production_date, shift_code, machine_id,
            SUM(actual_output)               AS total_actual_output,
            SUM(std_output)                  AS total_std_output,
            AVG(productivity_std_pcs_mh)     AS avg_productivity_std,
            AVG(productivity_ac_pcs_mh)      AS avg_productivity_ac,
            AVG(CASE WHEN productivity_std_pcs_mh > 0
                THEN ((productivity_ac_pcs_mh - productivity_std_pcs_mh) / productivity_std_pcs_mh) * 100
                ELSE NULL END)                AS avg_dl_eff_percent,
            SUM(total_loss_hour)             AS total_loss_hour,
            SUM(machine_run_time)            AS total_machine_run_time,
            COUNT(*)                         AS record_count
        FROM fact_production_record
        WHERE is_undone = 0 AND production_date BETWEEN @date_from AND @date_to
        GROUP BY production_date, shift_code, machine_id
    ) AS src ON target.production_date = src.production_date
           AND target.shift_code = src.shift_code AND target.machine_id = src.machine_id
    WHEN MATCHED THEN UPDATE SET
        total_actual_output = src.total_actual_output, total_std_output = src.total_std_output,
        avg_productivity_std = src.avg_productivity_std, avg_productivity_ac = src.avg_productivity_ac,
        avg_dl_eff_percent = src.avg_dl_eff_percent, total_loss_hour = src.total_loss_hour,
        total_machine_run_time = src.total_machine_run_time, record_count = src.record_count,
        last_refreshed_at = GETDATE()
    WHEN NOT MATCHED THEN INSERT
        (production_date, shift_code, machine_id, total_actual_output, total_std_output,
         avg_productivity_std, avg_productivity_ac, avg_dl_eff_percent,
         total_loss_hour, total_machine_run_time, record_count, last_refreshed_at)
    VALUES (src.production_date, src.shift_code, src.machine_id, src.total_actual_output, src.total_std_output,
         src.avg_productivity_std, src.avg_productivity_ac, src.avg_dl_eff_percent,
         src.total_loss_hour, src.total_machine_run_time, src.record_count, GETDATE());
END
GO
