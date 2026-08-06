/* ═══════════════════════════════════════════════════════════════════
   005_create_procedures.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันหลัง 002/003 (ใช้ table dim_machine, dim_product,
   map_machine_product_group, fact_production_record, fact_daily_summary)

   sp_refresh_daily_summary : MERGE สรุปยอดรายวัน/กะ/เครื่องลง
                               fact_daily_summary สำหรับช่วงวันที่ที่ระบุ
   sp_add_production_record : lookup machine/product → INSERT
                               fact_production_record → เรียก
                               sp_refresh_daily_summary ให้อัตโนมัติ
                               (ใช้โดย POST /api/pd-input)
═══════════════════════════════════════════════════════════════════ */

CREATE OR ALTER PROCEDURE sp_refresh_daily_summary
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
        last_refreshed_at = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN INSERT
        (production_date, shift_code, machine_id, total_actual_output, total_std_output,
         avg_productivity_std, avg_productivity_ac, avg_dl_eff_percent,
         total_loss_hour, total_machine_run_time, record_count, last_refreshed_at)
    VALUES (src.production_date, src.shift_code, src.machine_id, src.total_actual_output, src.total_std_output,
         src.avg_productivity_std, src.avg_productivity_ac, src.avg_dl_eff_percent,
         src.total_loss_hour, src.total_machine_run_time, src.record_count, SYSUTCDATETIME());
END
GO

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
