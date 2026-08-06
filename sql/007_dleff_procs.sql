-- Must run after 004_create_views.sql. See Frontend/src/components/pages/DlEff/README.md
-- for how these procs feed the DL Efficiency dashboard.

CREATE OR ALTER PROCEDURE sp_get_dl_eff_overview
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

CREATE OR ALTER PROCEDURE sp_get_dl_eff_filters
AS
BEGIN
    SET NOCOUNT ON;
    SELECT shift_code AS val FROM dim_shift ORDER BY shift_code;
    SELECT product_group_name AS val FROM dim_product_group ORDER BY product_group_name;
END
GO
