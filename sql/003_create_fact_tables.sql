/* ═══════════════════════════════════════════════════════════════════
   003_create_fact_tables.sql
   ─────────────────────────────────────────────────────────────────
   Fact tables — ต้องรันหลัง 002_create_dimension_tables.sql
   (มี FK อ้างถึง dim_machine, dim_product, dim_shift)

   fact_production_record : บันทึกผลผลิตต่อรอบ (1 แถว = 1 shift record)
     - มี computed column (PERSISTED) คำนวณ productivity/DL Eff อัตโนมัติ
       จากฟิลด์ที่ user กรอก — ห้ามใส่ค่าตรงๆ ตอน INSERT
   fact_daily_summary     : สรุปยอดต่อวัน/กะ/เครื่อง รีเฟรชผ่าน
       sp_refresh_daily_summary (ดู 005_create_procedures.sql)
═══════════════════════════════════════════════════════════════════ */

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'fact_production_record')
BEGIN
    CREATE TABLE fact_production_record (
        record_id         BIGINT IDENTITY(1,1) NOT NULL,
        production_date   DATE NOT NULL,
        shift_code        CHAR(1) NOT NULL,
        machine_id        INT NOT NULL,
        product_id        INT NOT NULL,

        mc_speed_pcs_hr   DECIMAL(10,2) NULL,
        capacity_pcs_hr   DECIMAL(10,2) NULL,
        oee_target        DECIMAL(5,3) NULL,

        machine_run_time  DECIMAL(4,1) NOT NULL,
        std_hc            DECIMAL(5,2) NOT NULL,
        std_hour          DECIMAL(5,2) NOT NULL,
        hour_piece_rate   DECIMAL(6,2) NOT NULL,
        actual_output     BIGINT NOT NULL,
        loss_hour         DECIMAL(5,2) NOT NULL,
        actual_bulk_hr    DECIMAL(5,2) NOT NULL DEFAULT (0),
        actual_pallet_hr  DECIMAL(5,2) NOT NULL DEFAULT (0),
        actual_assist_hr  DECIMAL(5,2) NOT NULL DEFAULT (0),
        actual_hc         INT NOT NULL,

        entry_datetime    DATETIME NOT NULL DEFAULT (SYSUTCDATETIME()),
        is_undone         BIT NOT NULL DEFAULT (0),
        source_system     VARCHAR(20) NULL,
        created_by        VARCHAR(50) NULL,
        updated_by        VARCHAR(50) NULL,
        updated_at        DATETIME NULL,

        /* ── computed columns (PERSISTED — เก็บค่าจริงลงดิสก์, index ได้) ──
           Auto machine (มี mc_speed_pcs_hr): rate = mc_speed_pcs_hr * oee_target
           Manual machine (ไม่มี mc_speed_pcs_hr, ใช้ capacity_pcs_hr แทน): rate = capacity_pcs_hr
           mc_speed_pcs_hr/capacity_pcs_hr เก็บหน่วยเป็น pcs/ชม. ตรงกันทั้งคู่ (ตาม Product_SMS)
           ห้ามคูณ 60 ซ้ำ ── */
        cal_output_at_oee        AS (CASE WHEN mc_speed_pcs_hr IS NOT NULL THEN mc_speed_pcs_hr * oee_target END) PERSISTED,
        std_output                AS (CASE
                                          WHEN mc_speed_pcs_hr IS NOT NULL THEN mc_speed_pcs_hr * oee_target * machine_run_time
                                          ELSE capacity_pcs_hr * machine_run_time
                                      END) PERSISTED,
        productivity_std_pcs_mh   AS ((CASE
                                          WHEN mc_speed_pcs_hr IS NOT NULL THEN mc_speed_pcs_hr * oee_target * machine_run_time
                                          ELSE capacity_pcs_hr * machine_run_time
                                      END) / NULLIF(std_hc * std_hour, 0)) PERSISTED,
        actual_hour                AS (hour_piece_rate - loss_hour - actual_bulk_hr - actual_pallet_hr - actual_assist_hr) PERSISTED,
        total_loss_hour             AS (loss_hour * actual_hc) PERSISTED,
        productivity_ac_pcs_mh    AS (actual_output / NULLIF(hour_piece_rate - loss_hour - actual_bulk_hr - actual_pallet_hr - actual_assist_hr, 0)) PERSISTED,

        CONSTRAINT pk_fact_production_record PRIMARY KEY (record_id),
        CONSTRAINT fk_fact_prod_machine FOREIGN KEY (machine_id) REFERENCES dim_machine(machine_id),
        CONSTRAINT fk_fact_prod_product FOREIGN KEY (product_id) REFERENCES dim_product(product_id),
        CONSTRAINT fk_fact_prod_shift FOREIGN KEY (shift_code) REFERENCES dim_shift(shift_code),
        CONSTRAINT ck_fact_prod_machine_run_time CHECK (machine_run_time >= 0 AND machine_run_time <= 24),
        CONSTRAINT ck_fact_prod_std_hc CHECK (std_hc >= 0 AND std_hc <= 25),
        CONSTRAINT ck_fact_prod_std_hour CHECK (std_hour >= 0),
        CONSTRAINT ck_fact_prod_hour_piece_rate CHECK (hour_piece_rate >= 0),
        CONSTRAINT ck_fact_prod_loss_hour CHECK (loss_hour >= 0 AND loss_hour <= 13),
        CONSTRAINT ck_fact_prod_actual_bulk_hr CHECK (actual_bulk_hr >= 0 AND actual_bulk_hr <= 13),
        CONSTRAINT ck_fact_prod_actual_pallet_hr CHECK (actual_pallet_hr >= 0 AND actual_pallet_hr <= 13),
        CONSTRAINT ck_fact_prod_actual_assist_hr CHECK (actual_assist_hr >= 0 AND actual_assist_hr <= 13),
        CONSTRAINT ck_fact_prod_actual_hc CHECK (actual_hc >= 0 AND actual_hc <= 25)
    );

    CREATE INDEX ix_fact_prod_date_machine ON fact_production_record(production_date, machine_id, shift_code);
    CREATE INDEX ix_fact_dl_eff_support ON fact_production_record(productivity_std_pcs_mh, productivity_ac_pcs_mh, total_loss_hour, production_date, machine_id);

    PRINT 'Created table fact_production_record';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'fact_daily_summary')
BEGIN
    CREATE TABLE fact_daily_summary (
        summary_id              BIGINT IDENTITY(1,1) NOT NULL,
        production_date         DATE NOT NULL,
        shift_code               CHAR(1) NOT NULL,
        machine_id                INT NOT NULL,
        total_actual_output      BIGINT NULL,
        total_std_output          DECIMAL(18,2) NULL,
        avg_productivity_std      DECIMAL(10,2) NULL,
        avg_productivity_ac       DECIMAL(10,2) NULL,
        avg_dl_eff_percent        DECIMAL(6,2) NULL,
        total_loss_hour           DECIMAL(10,2) NULL,
        total_machine_run_time    DECIMAL(10,2) NULL,
        record_count               INT NULL,
        last_refreshed_at          DATETIME NOT NULL DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT pk_fact_daily_summary PRIMARY KEY (summary_id),
        CONSTRAINT uq_daily_summary UNIQUE (production_date, shift_code, machine_id),
        CONSTRAINT fk_fact_daily_summary_machine FOREIGN KEY (machine_id) REFERENCES dim_machine(machine_id)
    );
    PRINT 'Created table fact_daily_summary';
END
GO
