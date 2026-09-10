/* ═══════════════════════════════════════════════════════════════════
   022_seed_data_record_100.sql
   ─────────────────────────────────────────────────────────────────
   Seed ข้อมูลตัวอย่าง 100 แถวสำหรับหน้า "Data Records" (PD Input) —
   ใช้ดู/ทดสอบตาราง, filter, pagination, sort, export และ dashboard
   เท่านั้น ไม่ใช่ข้อมูลผลิตจริง

   หลักการ (ต่อยอดจาก 019_demo_seed_realistic_data.sql +
   seed_mock_pd_data_aug2026.sql):
     - จับคู่ machine ↔ product ให้ถูกต้องตาม map_machine_product_group
       จริง และเลือกเฉพาะคู่ที่คำนวณ DL Eff % ออกมาได้ (ไม่ NULL):
         * Auto machine  (oee_target > 0)  ต้องมี mc_speed_pcs_hr > 0
         * Manual machine (oee_target = 0) ต้องมี capacity_pcs_hr > 0
     - actual_output ถูกคำนวณย้อนกลับจาก productivity_std ให้ DL Eff %
       ตกอยู่ราว -8% .. +12% (คร่อมเป้า 3.1%) จะได้เห็นทั้งแถวเขียว/แดง
     - กระจายวันที่ 25 ส.ค. 2026 – 10 ก.ย. 2026 (เอนไปทางสัปดาห์
       ล่าสุด เพื่อให้ค่า default ของหน้า = 7 วันล่าสุด มีข้อมูลโชว์)
     - สุ่มกะ A/B/C, machine_run_time 7.0–8.0, loss/bulk/pallet/assist,
       actual_hc = std_hc ± 1 และใส่ loss_reason (ไทย) ~35% ของแถว
     - ใส่ผ่าน sp_add_production_record เหมือน flow จริง (POST
       /api/pd-input) — tag created_by = 'seed_data_record',
       source_system = 'SEED' เพื่อลบทิ้งได้ง่าย (ดูท้ายไฟล์)

   รันซ้ำได้: ลบแถว seed เดิม (created_by = 'seed_data_record') ทิ้ง
   ก่อนทุกครั้ง แล้วสร้างใหม่ 100 แถว
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;   -- required: fact_production_record has computed-column indexes
SET ANSI_NULLS ON;
GO

/* ── 0) ล้าง seed เดิม (idempotent) ───────────────────────────── */
DECLARE @old_from DATE, @old_to DATE;
SELECT @old_from = MIN(production_date), @old_to = MAX(production_date)
FROM fact_production_record WHERE created_by = 'seed_data_record';

DELETE FROM fact_production_record WHERE created_by = 'seed_data_record';

IF @old_from IS NOT NULL
    EXEC sp_refresh_daily_summary @date_from = @old_from, @date_to = @old_to;
GO

/* ── 1) รายการคู่ machine ↔ product ที่ใช้ได้ (DL Eff % ไม่ NULL) ── */
DECLARE @combos TABLE (
    rn            INT IDENTITY(1,1) PRIMARY KEY,
    machine_code  VARCHAR(30),
    product_code  VARCHAR(30),
    rate          DECIMAL(18,4)   -- pcs/hr ที่ใช้หา STD output
);

INSERT INTO @combos (machine_code, product_code, rate)
SELECT DISTINCT
       m.machine_code,
       p.product_code,
       CASE WHEN p.mc_speed_pcs_hr IS NOT NULL
            THEN p.mc_speed_pcs_hr * m.oee_target
            ELSE p.capacity_pcs_hr
       END AS rate
FROM map_machine_product_group mpg
JOIN dim_machine  m ON m.machine_id = mpg.machine_id AND m.is_active = 1
JOIN dim_product  p ON p.product_group_id = mpg.product_group_id AND p.is_active = 1
WHERE (p.mc_speed_pcs_hr IS NOT NULL AND m.oee_target > 0 AND p.mc_speed_pcs_hr > 0)
   OR (p.mc_speed_pcs_hr IS NULL     AND p.capacity_pcs_hr  > 0);

DECLARE @comboCount INT = (SELECT COUNT(*) FROM @combos);
IF @comboCount = 0
BEGIN
    RAISERROR('No usable machine/product combinations found — aborting seed.', 16, 1);
    RETURN;
END

/* ── 2) loss reasons (ไทย) ───────────────────────────────────── */
DECLARE @reasons TABLE (rn INT IDENTITY(1,1) PRIMARY KEY, txt NVARCHAR(200));
INSERT INTO @reasons (txt) VALUES
    (N'เครื่องหยุดปรับตั้งค่า'),
    (N'รอวัตถุดิบเข้าไลน์'),
    (N'เปลี่ยนม้วนฟิล์ม / เติมวัสดุ'),
    (N'เครื่องขัดข้อง รอช่างซ่อม'),
    (N'ทำความสะอาดเครื่องระหว่างเปลี่ยนรุ่น'),
    (N'ไฟดับ / ระบบลมดันตก'),
    (N'ตรวจสอบคุณภาพ / รอผล QC'),
    (N'ประชุมเช้า / อบรมความปลอดภัย'),
    (N'รอ forklift ย้ายพาเลท'),
    (N'ปรับความเร็วสายพานใหม่');
DECLARE @reasonCount INT = (SELECT COUNT(*) FROM @reasons);

/* ── 3) สร้าง 100 แถว ─────────────────────────────────────────── */
DECLARE @total INT = 100, @i INT = 0;
DECLARE @seed_min DATE, @seed_max DATE;

DECLARE @machine_code VARCHAR(30), @product_code VARCHAR(30), @rate DECIMAL(18,4);
DECLARE @shift_code CHAR(1), @production_date DATE;
DECLARE @machine_run_time DECIMAL(4,1), @std_hc DECIMAL(5,2), @std_hour DECIMAL(5,2), @hour_piece_rate DECIMAL(6,2);
DECLARE @loss_hour DECIMAL(5,2), @bulk DECIMAL(5,2), @pallet DECIMAL(5,2), @assist DECIMAL(5,2), @actual_hc INT;
DECLARE @actual_hour DECIMAL(9,2), @prod_std DECIMAL(38,10), @dl_target FLOAT, @actual_output BIGINT;
DECLARE @loss_reason NVARCHAR(200);

WHILE @i < @total
BEGIN
    SELECT TOP 1 @machine_code = machine_code, @product_code = product_code, @rate = rate
    FROM @combos ORDER BY NEWID();

    SET @shift_code      = CASE ABS(CHECKSUM(NEWID())) % 3 WHEN 0 THEN 'A' WHEN 1 THEN 'B' ELSE 'C' END;
    -- 25 Aug 2026 .. 10 Sep 2026, เอนไปทาง 7 วันล่าสุด (default filter ของหน้า)
    SET @production_date = DATEADD(DAY,
        - (ABS(CHECKSUM(NEWID())) % 17) * (ABS(CHECKSUM(NEWID())) % 2 + 1) / 2, '2026-09-10');
    IF @production_date < '2026-08-25' SET @production_date = '2026-08-25';

    SET @machine_run_time = 7.0 + (ABS(CHECKSUM(NEWID())) % 11) / 10.0;   -- 7.0–8.0
    SET @std_hc           = 3 + ABS(CHECKSUM(NEWID())) % 4;               -- 3–6
    SET @std_hour         = 8;
    SET @hour_piece_rate  = 8;
    SET @loss_hour        = ROUND((30 + ABS(CHECKSUM(NEWID())) % 170) / 100.0, 2);  -- 0.30–2.00
    SET @bulk             = ROUND((ABS(CHECKSUM(NEWID())) % 40) / 100.0, 2);        -- 0–0.39
    SET @pallet           = ROUND((ABS(CHECKSUM(NEWID())) % 40) / 100.0, 2);
    SET @assist           = ROUND((ABS(CHECKSUM(NEWID())) % 40) / 100.0, 2);
    SET @actual_hc        = CAST(@std_hc AS INT) + (ABS(CHECKSUM(NEWID())) % 3) - 1; -- ±1
    IF @actual_hc < 1 SET @actual_hc = 1;

    SET @actual_hour = @hour_piece_rate - @loss_hour - @bulk - @pallet - @assist;
    IF @actual_hour < 1 SET @actual_hour = 1;

    -- productivity_std (pcs/man-hour) = rate * run_time / (std_hc * std_hour)
    SET @prod_std = (@rate * @machine_run_time) / NULLIF(@std_hc * @std_hour, 0);

    -- เล็ง DL Eff % ให้อยู่ราว -8% .. +12% (คร่อมเป้า 3.1%)
    SET @dl_target = -8.0 + (ABS(CHECKSUM(NEWID())) % 201) / 10.0;       -- -8.0 .. +12.0
    SET @actual_output = ROUND(ISNULL(@prod_std, 0) * (1 + @dl_target / 100.0) * @actual_hour, 0);
    IF @actual_output < 1 SET @actual_output = 1;

    -- loss_reason ~35% ของแถว (และมักใส่เมื่อ loss สูง)
    SET @loss_reason = NULL;
    IF (ABS(CHECKSUM(NEWID())) % 100) < 35 OR @loss_hour >= 1.7
        SELECT @loss_reason = txt FROM @reasons WHERE rn = 1 + ABS(CHECKSUM(NEWID())) % @reasonCount;

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
        @loss_reason      = @loss_reason,
        @actual_bulk_hr   = @bulk,
        @actual_pallet_hr = @pallet,
        @actual_assist_hr = @assist,
        @actual_hc        = @actual_hc,
        @source_system    = 'SEED',
        @created_by       = 'seed_data_record';

    SET @i += 1;
END

SELECT @seed_min = MIN(production_date), @seed_max = MAX(production_date)
FROM fact_production_record WHERE created_by = 'seed_data_record';
EXEC sp_refresh_daily_summary @date_from = @seed_min, @date_to = @seed_max;

PRINT CAST(@total AS VARCHAR) + ' seed rows inserted for the Data Records page '
    + '(' + CONVERT(VARCHAR, @seed_min, 23) + ' .. ' + CONVERT(VARCHAR, @seed_max, 23) + ').';
GO

/* ── ลบ seed data ทั้งหมดทีหลัง (ไม่รันอัตโนมัติ) ──────────────────
DECLARE @f DATE, @t DATE;
SELECT @f = MIN(production_date), @t = MAX(production_date)
FROM fact_production_record WHERE created_by = 'seed_data_record';
DELETE FROM fact_production_record WHERE created_by = 'seed_data_record';
EXEC sp_refresh_daily_summary @date_from = @f, @date_to = @t;
*/
