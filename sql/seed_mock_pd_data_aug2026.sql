/* Manual seed script — not part of the numbered migration sequence.
   Inserts 500 randomized fact_production_record rows via
   sp_add_production_record, spread across every day and shift of
   August 2026, for exercising the dashboards with realistic-looking data.

   Machines/products with no usable oee_target / mc_speed are excluded so
   every generated row gets a real (non-null) dl_eff_percent.

   All rows are tagged created_by = 'mock_data_script' — to remove them:
     DELETE FROM fact_production_record WHERE created_by = 'mock_data_script';
     EXEC sp_refresh_daily_summary @date_from = '2026-08-01', @date_to = '2026-08-31';
*/

SET NOCOUNT ON;

DECLARE @total INT = 500;
DECLARE @i INT = 0;

DECLARE @machines TABLE (machine_code VARCHAR(30), oee_target DECIMAL(5,3));
INSERT INTO @machines (machine_code, oee_target)
SELECT machine_code, oee_target FROM dim_machine WHERE is_active = 1 AND oee_target > 0;

DECLARE @products TABLE (product_code VARCHAR(30), mc_speed DECIMAL(10,2));
INSERT INTO @products (product_code, mc_speed)
SELECT product_code, mc_speed_pcs_hr FROM dim_product
WHERE is_active = 1 AND mc_speed_pcs_hr > 0 AND capacity_pcs_hr IS NOT NULL;

DECLARE @machineCount INT = (SELECT COUNT(*) FROM @machines);
DECLARE @productCount INT = (SELECT COUNT(*) FROM @products);

IF @machineCount = 0
BEGIN
    RAISERROR('No active machines with a usable oee_target were found — aborting seed.', 16, 1);
    RETURN;
END

IF @productCount = 0
BEGIN
    RAISERROR('No active products with a usable mc_speed/capacity were found — aborting seed.', 16, 1);
    RETURN;
END

DECLARE @machine_code VARCHAR(30), @product_code VARCHAR(30), @mc_speed DECIMAL(10,2), @oee_target DECIMAL(5,3);
DECLARE @shift_code CHAR(1), @production_date DATE;
DECLARE @machine_run_time DECIMAL(4,1), @std_hc DECIMAL(5,2), @std_hour DECIMAL(5,2), @hour_piece_rate DECIMAL(6,2);
DECLARE @loss_hour DECIMAL(5,2), @bulk DECIMAL(5,2), @pallet DECIMAL(5,2), @assist DECIMAL(5,2), @actual_hc INT;
DECLARE @actual_hour DECIMAL(9,2), @std_pcs_mh DECIMAL(18,4), @variance FLOAT, @actual_output BIGINT;

WHILE @i < @total
BEGIN
    -- TOP 1 ... ORDER BY NEWID() evaluates NEWID() once per row of the
    -- scanned set and picks the true random top row — no rn/modulo
    -- mismatch, and @machine_code/@product_code are guaranteed to be set
    -- since @machineCount/@productCount are already verified > 0.
    SELECT TOP 1 @machine_code = machine_code, @oee_target = oee_target
    FROM @machines ORDER BY NEWID();

    SELECT TOP 1 @product_code = product_code, @mc_speed = mc_speed
    FROM @products ORDER BY NEWID();

    SET @shift_code = (SELECT CASE ABS(CHECKSUM(NEWID())) % 3 WHEN 0 THEN 'A' WHEN 1 THEN 'B' ELSE 'C' END);
    SET @production_date = DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 31, '2026-08-01');

    SET @machine_run_time = 6.0 + (ABS(CHECKSUM(NEWID())) % 60) / 10.0;  -- 6.0–11.9 hr
    SET @std_hc = 3 + ABS(CHECKSUM(NEWID())) % 6;                        -- 3–8
    SET @std_hour = 8;
    SET @hour_piece_rate = 8;
    SET @loss_hour = ROUND((ABS(CHECKSUM(NEWID())) % 200) / 100.0, 2);   -- 0–2.0
    SET @bulk = ROUND((ABS(CHECKSUM(NEWID())) % 50) / 100.0, 2);         -- 0–0.5
    SET @pallet = ROUND((ABS(CHECKSUM(NEWID())) % 50) / 100.0, 2);
    SET @assist = ROUND((ABS(CHECKSUM(NEWID())) % 50) / 100.0, 2);
    SET @actual_hc = @std_hc + (ABS(CHECKSUM(NEWID())) % 5) - 2;
    IF @actual_hc < 1 SET @actual_hc = 1;

    SET @actual_hour = @hour_piece_rate - @loss_hour - @bulk - @pallet - @assist;
    IF @actual_hour < 1 SET @actual_hour = 1;

    -- aim actual output near the standard rate (85%–115%) so dl_eff_percent
    -- lands on both sides of target instead of being uniformly random noise
    SET @std_pcs_mh = (@mc_speed * @oee_target * 60 * @machine_run_time) / NULLIF(@std_hc * @std_hour, 0);
    SET @variance = 0.85 + (ABS(CHECKSUM(NEWID())) % 300) / 1000.0;      -- 0.85–1.15
    SET @actual_output = ROUND(ISNULL(@std_pcs_mh, 0) * @variance * @actual_hour, 0);
    IF @actual_output < 0 SET @actual_output = 0;

    EXEC sp_add_production_record
        @production_date  = @production_date,
        @shift_code       = @shift_code,
        @machine_code     = @machine_code,
        @product_code     = @product_code,
        @machine_run_time = @machine_run_time,
        @std_hc           = @std_hc,
        @std_hour         = @std_hour,
        @hour_piece_rate  = @hour_piece_rate,
        @actual_output    = @actual_output,
        @loss_hour        = @loss_hour,
        @actual_bulk_hr   = @bulk,
        @actual_pallet_hr = @pallet,
        @actual_assist_hr = @assist,
        @actual_hc        = @actual_hc,
        @source_system    = 'MOCK',
        @created_by       = 'mock_data_script';

    SET @i += 1;
END

PRINT CAST(@total AS VARCHAR) + ' mock production records inserted for Aug 2026.';