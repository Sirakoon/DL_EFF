/* ═══════════════════════════════════════════════════════════════════
   002_create_dimension_tables.sql
   ─────────────────────────────────────────────────────────────────
   Dimension tables ของ schema หลัก (dim_/fact_/vw_) ที่ backend
   ปัจจุบันใช้งานจริง (pdInputController, dashboardController,
   dlEffController)

   ลำดับตาราง: dim_shift, dim_product_group, dim_machine, dim_product,
               map_machine_product_group
═══════════════════════════════════════════════════════════════════ */

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'dim_shift')
BEGIN
    CREATE TABLE dim_shift (
        shift_code CHAR(1) NOT NULL,
        shift_name VARCHAR(30) NULL,
        start_time TIME(7) NULL,
        end_time   TIME(7) NULL,
        CONSTRAINT pk_dim_shift PRIMARY KEY (shift_code)
    );
    PRINT 'Created table dim_shift';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'dim_product_group')
BEGIN
    CREATE TABLE dim_product_group (
        product_group_id   INT IDENTITY(1,1) NOT NULL,
        product_group_name VARCHAR(50) NOT NULL,
        CONSTRAINT pk_dim_product_group PRIMARY KEY (product_group_id),
        CONSTRAINT uq_dim_product_group_name UNIQUE (product_group_name)
    );
    PRINT 'Created table dim_product_group';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'dim_machine')
BEGIN
    CREATE TABLE dim_machine (
        machine_id   INT IDENTITY(1,1) NOT NULL,
        machine_code VARCHAR(30) NOT NULL,
        oee_target   DECIMAL(5,3) NOT NULL,
        version      INT NULL,
        is_active    BIT NOT NULL DEFAULT (1),
        updated_at   DATETIME NOT NULL DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT pk_dim_machine PRIMARY KEY (machine_id),
        CONSTRAINT uq_dim_machine_code UNIQUE (machine_code)
    );
    PRINT 'Created table dim_machine';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'dim_product')
BEGIN
    CREATE TABLE dim_product (
        product_id          INT IDENTITY(1,1) NOT NULL,
        product_code        VARCHAR(30) NOT NULL,
        product_group_id    INT NOT NULL,
        product_description VARCHAR(200) NULL,
        capacity_pcs_hr     DECIMAL(10,2) NULL,
        mc_speed_pcs_hr     DECIMAL(10,2) NULL,
        is_active           BIT NOT NULL DEFAULT (1),
        updated_at          DATETIME NOT NULL DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT pk_dim_product PRIMARY KEY (product_id),
        CONSTRAINT uq_dim_product_code UNIQUE (product_code),
        CONSTRAINT fk_dim_product_group FOREIGN KEY (product_group_id) REFERENCES dim_product_group(product_group_id)
    );
    PRINT 'Created table dim_product';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'map_machine_product_group')
BEGIN
    CREATE TABLE map_machine_product_group (
        machine_id       INT NOT NULL,
        product_group_id INT NOT NULL,
        CONSTRAINT pk_map_machine_product_group PRIMARY KEY (machine_id, product_group_id),
        CONSTRAINT fk_map_machine FOREIGN KEY (machine_id) REFERENCES dim_machine(machine_id),
        CONSTRAINT fk_map_product_group FOREIGN KEY (product_group_id) REFERENCES dim_product_group(product_group_id)
    );
    PRINT 'Created table map_machine_product_group';
END
GO
