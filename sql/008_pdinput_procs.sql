/* ═══════════════════════════════════════════════════════════════════
   008_pdinput_procs.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันหลัง 004_create_views.sql
   ใช้แทน query inline เดิมใน pdInputController.js (getAll, getFilters)

   sp_get_pd_input_list   : กรองข้อมูลลง temp table ครั้งเดียว แล้ว
                             SELECT ทั้งหน้าที่ต้องการ + COUNT รวม
                             จาก temp table เดียวกัน (เดิมยิง 2 query
                             แยกกัน กรองซ้ำ 2 รอบ)
   sp_get_pd_input_filters : รวม 3 query distinct เป็น round-trip เดียว
═══════════════════════════════════════════════════════════════════ */

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

CREATE OR ALTER PROCEDURE sp_get_pd_input_filters
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
