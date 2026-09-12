/* ═══════════════════════════════════════════════════════════════════
   026_dl_eff_entry_time.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว (แก้ sp_get_dl_eff_detail) — รันซ้ำได้

   เพิ่ม ENTRY_TIME (fact_production_record.entry_datetime) ให้
   sp_get_dl_eff_detail เพื่อโชว์ใน DL Eff Dashboard เหมือนที่ Data
   Records โชว์อยู่แล้ว (vw_oee_productivity มี entry_datetime อยู่แล้ว
   จาก migration ก่อนหน้า — แค่ยังไม่เคย select ใน proc นี้)
═══════════════════════════════════════════════════════════════════ */

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
        entry_datetime        AS ENTRY_TIME,
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
