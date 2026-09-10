/* ═══════════════════════════════════════════════════════════════════
   023_pdinput_list_server_sort.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันหลัง 008_pdinput_procs.sql — CREATE OR ALTER (รันซ้ำได้)

   ปัญหาเดิม:
     หน้า "Data Records" (PD Input) ทำ pagination ที่ server (OFFSET/
     FETCH) แต่ทำ sort ที่ client → กดหัวคอลัมน์ให้เรียงข้อมูล มันเรียง
     แค่ 20 แถวของหน้าปัจจุบันเท่านั้น ไม่ใช่ทั้งชุดข้อมูล

   แก้:
     เพิ่มพารามิเตอร์ @sortBy / @sortDir ให้ sp_get_pd_input_list
     เรียงที่ server ก่อน paginate — คุมด้วย whitelist คอลัมน์ (กัน
     SQL injection, ไม่ใช้ dynamic SQL) มี tie-breaker record_id DESC
     เสมอเพื่อให้ลำดับ deterministic ระหว่างหน้า
     ค่า default (ไม่ส่ง @sortBy) = production_date DESC, record_id DESC
     เหมือนเดิมทุกประการ — controller เดิมที่ไม่ส่งพารามิเตอร์ยังทำงานได้
═══════════════════════════════════════════════════════════════════ */

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE sp_get_pd_input_list
    @dateFrom     DATE        = NULL,
    @dateTo       DATE        = NULL,
    @shift        CHAR(1)     = NULL,
    @productGroup VARCHAR(50) = NULL,
    @productCode  VARCHAR(30) = NULL,
    @page         INT         = 1,
    @pageSize     INT         = 100,
    @sortBy       VARCHAR(30) = NULL,
    @sortDir      VARCHAR(4)  = NULL
AS
BEGIN
    SET NOCOUNT ON;

    /* ── normalize paging / sorting input ─────────────────────────── */
    IF @page IS NULL OR @page < 1 SET @page = 1;
    IF @pageSize IS NULL OR @pageSize < 1 SET @pageSize = 100;
    IF @pageSize > 1000 SET @pageSize = 1000;

    SET @sortDir = LOWER(NULLIF(LTRIM(RTRIM(@sortDir)), ''));
    IF @sortDir NOT IN ('asc', 'desc') SET @sortDir = 'desc';

    SET @sortBy = NULLIF(LTRIM(RTRIM(@sortBy)), '');
    IF @sortBy NOT IN (
        'production_date', 'shift_code', 'machine_code', 'product_group_name',
        'product_code', 'machine_run_time', 'actual_hc', 'actual_output',
        'loss_hour', 'productivity_std_pcs_mh', 'productivity_ac_pcs_mh',
        'dl_eff_percent'
    ) SET @sortBy = NULL;

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

    /* ── page of rows ────────────────────────────────────────────────
       one ORDER BY term per (column, direction); only the term matching
       @sortBy/@sortDir yields non-NULL values, the rest collapse to NULL
       and contribute no ordering. Numeric and text columns each live in
       their own term so every CASE stays single-typed. ── */
    SELECT *
    FROM #filtered
    ORDER BY
        CASE WHEN @sortBy = 'production_date'         AND @sortDir = 'asc'  THEN production_date END ASC,
        CASE WHEN @sortBy = 'production_date'         AND @sortDir = 'desc' THEN production_date END DESC,
        CASE WHEN @sortBy = 'shift_code'              AND @sortDir = 'asc'  THEN shift_code END ASC,
        CASE WHEN @sortBy = 'shift_code'              AND @sortDir = 'desc' THEN shift_code END DESC,
        CASE WHEN @sortBy = 'machine_code'            AND @sortDir = 'asc'  THEN machine_code END ASC,
        CASE WHEN @sortBy = 'machine_code'            AND @sortDir = 'desc' THEN machine_code END DESC,
        CASE WHEN @sortBy = 'product_group_name'      AND @sortDir = 'asc'  THEN product_group_name END ASC,
        CASE WHEN @sortBy = 'product_group_name'      AND @sortDir = 'desc' THEN product_group_name END DESC,
        CASE WHEN @sortBy = 'product_code'            AND @sortDir = 'asc'  THEN product_code END ASC,
        CASE WHEN @sortBy = 'product_code'            AND @sortDir = 'desc' THEN product_code END DESC,
        CASE WHEN @sortBy = 'machine_run_time'        AND @sortDir = 'asc'  THEN machine_run_time END ASC,
        CASE WHEN @sortBy = 'machine_run_time'        AND @sortDir = 'desc' THEN machine_run_time END DESC,
        CASE WHEN @sortBy = 'actual_hc'               AND @sortDir = 'asc'  THEN actual_hc END ASC,
        CASE WHEN @sortBy = 'actual_hc'               AND @sortDir = 'desc' THEN actual_hc END DESC,
        CASE WHEN @sortBy = 'actual_output'           AND @sortDir = 'asc'  THEN actual_output END ASC,
        CASE WHEN @sortBy = 'actual_output'           AND @sortDir = 'desc' THEN actual_output END DESC,
        CASE WHEN @sortBy = 'loss_hour'               AND @sortDir = 'asc'  THEN loss_hour END ASC,
        CASE WHEN @sortBy = 'loss_hour'               AND @sortDir = 'desc' THEN loss_hour END DESC,
        CASE WHEN @sortBy = 'productivity_std_pcs_mh' AND @sortDir = 'asc'  THEN productivity_std_pcs_mh END ASC,
        CASE WHEN @sortBy = 'productivity_std_pcs_mh' AND @sortDir = 'desc' THEN productivity_std_pcs_mh END DESC,
        CASE WHEN @sortBy = 'productivity_ac_pcs_mh'  AND @sortDir = 'asc'  THEN productivity_ac_pcs_mh END ASC,
        CASE WHEN @sortBy = 'productivity_ac_pcs_mh'  AND @sortDir = 'desc' THEN productivity_ac_pcs_mh END DESC,
        CASE WHEN @sortBy = 'dl_eff_percent'          AND @sortDir = 'asc'  THEN dl_eff_percent END ASC,
        CASE WHEN @sortBy = 'dl_eff_percent'          AND @sortDir = 'desc' THEN dl_eff_percent END DESC,
        CASE WHEN @sortBy IS NULL THEN production_date END DESC,
        record_id DESC
    OFFSET (@page - 1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;

    SELECT COUNT(*) AS total FROM #filtered;

    DROP TABLE #filtered;
END
GO
