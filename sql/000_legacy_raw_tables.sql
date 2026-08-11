/* ═══════════════════════════════════════════════════════════════════
   000_legacy_raw_tables.sql
   ─────────────────────────────────────────────────────────────────
   ตารางชุดเดิมก่อนย้ายมาใช้ schema แบบ dim_/fact_/vw_ (ดู 002–004)
   ปัจจุบัน backend ไม่ได้ query ตารางกลุ่มนี้แล้ว — เก็บไว้เพื่อ
   ความครบถ้วนของ schema จริงในฐานข้อมูล / เผื่อยังมี process อื่น
   (เช่น import job เดิม) อ้างอิงอยู่

   ตาราง: CalData, MasterdData, PDInputData, RawDataTest
═══════════════════════════════════════════════════════════════════ */

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CalData')
BEGIN
    CREATE TABLE CalData (
        id                     INT IDENTITY(1,1) NOT NULL,
        CalOutputAtOEEpercent  FLOAT NULL,
        STD_Output             FLOAT NULL,
        Productivity_STD       FLOAT NULL,
        Actual_Hour            FLOAT NULL,
        Total_Loss_Hour        FLOAT NULL,
        Productivity_AC        FLOAT NULL,
        DL_EFF                 FLOAT NULL,
        CONSTRAINT pk_caldata PRIMARY KEY (id)
    );
    PRINT 'Created table CalData';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'MasterdData')
BEGIN
    CREATE TABLE MasterdData (
        id           INT IDENTITY(1,1) NOT NULL,
        Product_Code VARCHAR(50) NULL,
        MC_Sppeed    FLOAT NULL,
        Capacity     FLOAT NULL,
        OEE_target   FLOAT NULL,
        CONSTRAINT pk_masterddata PRIMARY KEY (id)
    );
    PRINT 'Created table MasterdData';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PDInputData')
BEGIN
    CREATE TABLE PDInputData (
        id               INT IDENTITY(1,1) NOT NULL,
        Production_Date  DATETIME2(7) NULL,
        Shift            VARCHAR(10) NULL,
        Machine          VARCHAR(200) NULL,
        Product_Group    VARCHAR(250) NULL,
        Product_Code     VARCHAR(100) NULL,
        Product_Des      VARCHAR(MAX) NULL,
        Machine_Run_time FLOAT NULL,
        STD_HC           FLOAT NULL,
        STD_Hour         FLOAT NULL,
        Hour_Piece_Rate  FLOAT NULL,
        Loss_Hour        FLOAT NULL,
        Actual_Bulk      FLOAT NULL,
        Actual_Pallet    FLOAT NULL,
        Actual_Assit     FLOAT NULL,
        Actual_Hc        FLOAT NULL,
        Undone           VARCHAR(MAX) NULL,
        TimeStamp        DATETIME2(7) NULL DEFAULT (GETDATE()),
        CONSTRAINT pk_pdinputdata PRIMARY KEY (id)
    );
    PRINT 'Created table PDInputData';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'RawDataTest')
BEGIN
    CREATE TABLE RawDataTest (
        ID               INT IDENTITY(1,1) NOT NULL,
        PRODUCTION_DATE  DATETIME2(2) NULL,
        SHIFT            VARCHAR(10) NULL,
        MACHINE          VARCHAR(100) NULL,
        PRODUCT_GROUP    VARCHAR(150) NULL,
        PRODUCT_CODE     VARCHAR(100) NULL,
        PRODUCT_DESC     NVARCHAR(MAX) NULL,
        MC_SPEED         INT NULL,
        CAPACITY         INT NULL,
        OEE_TARGET       FLOAT NULL,
        MC_RUN_TIME      INT NULL,
        STD_HC           FLOAT NULL,
        STD_HOUR         FLOAT NULL,
        HOUR_PIECE_RATE  FLOAT NULL,
        ACTUAL_OUTPUT    FLOAT NULL,
        LOSS_HOUR        FLOAT NULL,
        ACTUAL_BULK      FLOAT NULL,
        ACTUAL_PALLET    FLOAT NULL,
        ACTUAL_ASSIT     FLOAT NULL,
        ACTUAL_HC        INT NULL,
        ENTRY_DATE       DATETIME2(2) NULL,
        UNDONE           VARCHAR(50) NULL,
        BREAKDOWN_TAG    NVARCHAR(100) NULL,
        BREAKDOWN_REASON NVARCHAR(200) NULL,
        CONSTRAINT pk_rawdatatest PRIMARY KEY (ID)
    );
    PRINT 'Created table RawDataTest';
END
GO
