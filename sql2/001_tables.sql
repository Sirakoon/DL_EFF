/* ═══════════════════════════════════════════════════════════════════
   001_tables.sql
   ─────────────────────────────────────────────────────────────────
   สแกน (script) ออกมาจากฐานข้อมูล RealTimeUpdate จริงที่กำลังใช้งานอยู่
   ผ่าน sqlcmd + system catalog views (sys.tables/sys.columns/...)
   ตรงกับสิ่งที่ SSMS "Generate Scripts" จะให้ — เป็น snapshot ของ schema
   จริง ณ ปัจจุบัน ไม่ใช่สคริปต์ migration แบบ idempotent เหมือนโฟลเดอร์ sql/

   สร้างเมื่อ: 2026-08-06

   รวม 12 ตาราง: app_user, CalData, dim_machine, dim_product,
   dim_product_group, dim_shift, fact_daily_summary,
   fact_production_record, map_machine_product_group, MasterdData,
   PDInputData, RawDataTest

   หมายเหตุ: CalData, MasterdData, PDInputData คือตารางชุดเก่า (ไม่มี
   controller ใดใน Backend อ้างถึงโดยตรงแล้ว) เก็บสคริปต์ไว้เพื่อความ
   ครบถ้วนของ schema จริงบน server เท่านั้น
═══════════════════════════════════════════════════════════════════ */

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Table: dbo.app_user
CREATE TABLE [dbo].[app_user] (
    [user_id] int IDENTITY(1,1) NOT NULL,
    [username] varchar(50) NOT NULL,
    [password_hash] varchar(255) NOT NULL,
    [role] varchar(20) NOT NULL,
    [status] varchar(20) NOT NULL,
    [created_at] datetime NOT NULL,
    [last_login] datetime NULL,
    [approved_by] int NULL,
    [approved_at] datetime NULL,
    CONSTRAINT [PK__app_user__B9BE370F2C45F194] PRIMARY KEY CLUSTERED ([user_id] ASC)
);
GO

-- Table: dbo.CalData
CREATE TABLE [dbo].[CalData] (
    [id] int IDENTITY(1,1) NOT NULL,
    [CalOutputAtOEEpercent] float NULL,
    [STD_Output] float NULL,
    [Productivity_STD] float NULL,
    [Actual_Hour] float NULL,
    [Total_Loss_Hour] float NULL,
    [Productivity_AC] float NULL,
    [DL_EFF] float NULL,
    CONSTRAINT [PK__CalData__3213E83FFAE62167] PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- Table: dbo.dim_machine
CREATE TABLE [dbo].[dim_machine] (
    [machine_id] int IDENTITY(1,1) NOT NULL,
    [machine_code] varchar(30) NOT NULL,
    [oee_target] decimal(5,3) NOT NULL,
    [version] int NULL,
    [is_active] bit NOT NULL,
    [updated_at] datetime NOT NULL,
    CONSTRAINT [PK__dim_mach__7B75BEA9E085BC0E] PRIMARY KEY CLUSTERED ([machine_id] ASC)
);
GO

-- Table: dbo.dim_product
CREATE TABLE [dbo].[dim_product] (
    [product_id] int IDENTITY(1,1) NOT NULL,
    [product_code] varchar(30) NOT NULL,
    [product_group_id] int NOT NULL,
    [product_description] varchar(200) NULL,
    [capacity_pcs_hr] decimal(10,2) NULL,
    [mc_speed_pcs_hr] decimal(10,2) NULL,
    [is_active] bit NOT NULL,
    [updated_at] datetime NOT NULL,
    CONSTRAINT [PK__dim_prod__47027DF5B0D51FC9] PRIMARY KEY CLUSTERED ([product_id] ASC)
);
GO

-- Table: dbo.dim_product_group
CREATE TABLE [dbo].[dim_product_group] (
    [product_group_id] int IDENTITY(1,1) NOT NULL,
    [product_group_name] varchar(50) NOT NULL,
    CONSTRAINT [PK__dim_prod__D578601AD595ECD8] PRIMARY KEY CLUSTERED ([product_group_id] ASC)
);
GO

-- Table: dbo.dim_shift
CREATE TABLE [dbo].[dim_shift] (
    [shift_code] char(1) NOT NULL,
    [shift_name] varchar(30) NULL,
    [start_time] time(7) NULL,
    [end_time] time(7) NULL,
    CONSTRAINT [PK__dim_shif__657F4D58212593E1] PRIMARY KEY CLUSTERED ([shift_code] ASC)
);
GO

-- Table: dbo.fact_daily_summary
CREATE TABLE [dbo].[fact_daily_summary] (
    [summary_id] bigint IDENTITY(1,1) NOT NULL,
    [production_date] date NOT NULL,
    [shift_code] char(1) NOT NULL,
    [machine_id] int NOT NULL,
    [total_actual_output] bigint NULL,
    [total_std_output] decimal(18,2) NULL,
    [avg_productivity_std] decimal(10,2) NULL,
    [avg_productivity_ac] decimal(10,2) NULL,
    [avg_dl_eff_percent] decimal(6,2) NULL,
    [total_loss_hour] decimal(10,2) NULL,
    [total_machine_run_time] decimal(10,2) NULL,
    [record_count] int NULL,
    [last_refreshed_at] datetime NOT NULL,
    CONSTRAINT [PK__fact_dai__85F93E8381B24D0E] PRIMARY KEY CLUSTERED ([summary_id] ASC)
);
GO

-- Table: dbo.fact_production_record
CREATE TABLE [dbo].[fact_production_record] (
    [record_id] bigint IDENTITY(1,1) NOT NULL,
    [production_date] date NOT NULL,
    [shift_code] char(1) NOT NULL,
    [machine_id] int NOT NULL,
    [product_id] int NOT NULL,
    [mc_speed_pcs_hr] decimal(10,2) NULL,
    [capacity_pcs_hr] decimal(10,2) NULL,
    [oee_target] decimal(5,3) NULL,
    [machine_run_time] decimal(4,1) NOT NULL,
    [std_hc] decimal(5,2) NOT NULL,
    [std_hour] decimal(5,2) NOT NULL,
    [hour_piece_rate] decimal(6,2) NOT NULL,
    [actual_output] bigint NOT NULL,
    [loss_hour] decimal(5,2) NOT NULL,
    [actual_bulk_hr] decimal(5,2) NOT NULL,
    [actual_pallet_hr] decimal(5,2) NOT NULL,
    [actual_assist_hr] decimal(5,2) NOT NULL,
    [actual_hc] int NOT NULL,
    [entry_datetime] datetime NOT NULL,
    [is_undone] bit NOT NULL,
    [source_system] varchar(20) NULL,
    [created_by] varchar(50) NULL,
    [updated_by] varchar(50) NULL,
    [updated_at] datetime NULL,
    -- computed columns (PERSISTED) คำนวณอัตโนมัติจากคอลัมน์อื่นในแถวเดียวกัน
    [cal_output_at_oee] AS (([mc_speed_pcs_hr]*[oee_target])*(60)) PERSISTED,
    [std_output] AS ((([mc_speed_pcs_hr]*[oee_target])*(60))*[machine_run_time]) PERSISTED,
    [productivity_std_pcs_mh] AS (((([mc_speed_pcs_hr]*[oee_target])*(60))*[machine_run_time])/nullif([std_hc]*[std_hour],(0))) PERSISTED,
    [actual_hour] AS (((([hour_piece_rate]-[loss_hour])-[actual_bulk_hr])-[actual_pallet_hr])-[actual_assist_hr]) PERSISTED,
    [total_loss_hour] AS ([loss_hour]*[actual_hc]) PERSISTED,
    [productivity_ac_pcs_mh] AS ([actual_output]/nullif(((([hour_piece_rate]-[loss_hour])-[actual_bulk_hr])-[actual_pallet_hr])-[actual_assist_hr],(0))) PERSISTED,
    CONSTRAINT [PK__fact_pro__BFCFB4DD43296EB6] PRIMARY KEY CLUSTERED ([record_id] ASC)
);
GO

-- Table: dbo.map_machine_product_group
CREATE TABLE [dbo].[map_machine_product_group] (
    [machine_id] int NOT NULL,
    [product_group_id] int NOT NULL,
    CONSTRAINT [PK__map_mach__C62238A87F21EE74] PRIMARY KEY CLUSTERED ([machine_id] ASC, [product_group_id] ASC)
);
GO

-- Table: dbo.MasterdData
CREATE TABLE [dbo].[MasterdData] (
    [id] int IDENTITY(1,1) NOT NULL,
    [Product_Code] varchar(50) NULL,
    [MC_Sppeed] float NULL,
    [Capacity] float NULL,
    [OEE_target] float NULL,
    CONSTRAINT [PK__MasterdD__3213E83FE6ABA4DC] PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- Table: dbo.PDInputData
CREATE TABLE [dbo].[PDInputData] (
    [id] int IDENTITY(1,1) NOT NULL,
    [Production_Date] datetime2(7) NULL,
    [Shift] varchar(10) NULL,
    [Machine] varchar(200) NULL,
    [Product_Group] varchar(250) NULL,
    [Product_Code] varchar(100) NULL,
    [Product_Des] varchar(MAX) NULL,
    [Machine_Run_time] float NULL,
    [STD_HC] float NULL,
    [STD_Hour] float NULL,
    [Hour_Piece_Rate] float NULL,
    [Loss_Hour] float NULL,
    [Actual_Bulk] float NULL,
    [Actual_Pallet] float NULL,
    [Actual_Assit] float NULL,
    [Actual_Hc] float NULL,
    [Undone] varchar(MAX) NULL,
    [TimeStamp] datetime2(7) NULL,
    CONSTRAINT [PK__PDInputD__3213E83FD9D71E5E] PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- Table: dbo.RawDataTest
CREATE TABLE [dbo].[RawDataTest] (
    [ID] int IDENTITY(1,1) NOT NULL,
    [PRODUCTION_DATE] datetime2(2) NULL,
    [SHIFT] varchar(10) NULL,
    [MACHINE] varchar(100) NULL,
    [PRODUCT_GROUP] varchar(150) NULL,
    [PRODUCT_CODE] varchar(100) NULL,
    [PRODUCT_DESC] nvarchar(MAX) NULL,
    [MC_SPEED] int NULL,
    [CAPACITY] int NULL,
    [OEE_TARGET] float NULL,
    [MC_RUN_TIME] int NULL,
    [STD_HC] float NULL,
    [STD_HOUR] float NULL,
    [HOUR_PIECE_RATE] float NULL,
    [ACTUAL_OUTPUT] float NULL,
    [LOSS_HOUR] float NULL,
    [ACTUAL_BULK] float NULL,
    [ACTUAL_PALLET] float NULL,
    [ACTUAL_ASSIT] float NULL,
    [ACTUAL_HC] int NULL,
    [ENTRY_DATE] datetime2(2) NULL,
    [UNDONE] varchar(50) NULL,
    [BREAKDOWN_TAG] nvarchar(100) NULL,
    [BREAKDOWN_REASON] nvarchar(200) NULL,
    CONSTRAINT [PK__RawDataT__3214EC27610E8F57] PRIMARY KEY CLUSTERED ([ID] ASC)
);
GO

-- ===== DEFAULT CONSTRAINTS =====

ALTER TABLE [dbo].[app_user] ADD CONSTRAINT [DF__app_user__status__04E4BC85] DEFAULT ('pending') FOR [status];
GO
ALTER TABLE [dbo].[app_user] ADD CONSTRAINT [df_app_user_created_at_utc] DEFAULT (sysutcdatetime()) FOR [created_at];
GO
ALTER TABLE [dbo].[dim_machine] ADD CONSTRAINT [DF__dim_machi__is_ac__534D60F1] DEFAULT ((1)) FOR [is_active];
GO
ALTER TABLE [dbo].[dim_machine] ADD CONSTRAINT [df_dim_machine_updated_at_utc] DEFAULT (sysutcdatetime()) FOR [updated_at];
GO
ALTER TABLE [dbo].[dim_product] ADD CONSTRAINT [DF__dim_produ__is_ac__5BE2A6F2] DEFAULT ((1)) FOR [is_active];
GO
ALTER TABLE [dbo].[dim_product] ADD CONSTRAINT [df_dim_product_updated_at_utc] DEFAULT (sysutcdatetime()) FOR [updated_at];
GO
ALTER TABLE [dbo].[fact_daily_summary] ADD CONSTRAINT [df_fact_daily_summary_last_refreshed_at_utc] DEFAULT (sysutcdatetime()) FOR [last_refreshed_at];
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [DF__fact_prod__actua__6D0D32F4] DEFAULT ((0)) FOR [actual_bulk_hr];
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [DF__fact_prod__actua__6EF57B66] DEFAULT ((0)) FOR [actual_pallet_hr];
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [DF__fact_prod__actua__70DDC3D8] DEFAULT ((0)) FOR [actual_assist_hr];
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [df_fact_production_record_entry_datetime_utc] DEFAULT (sysutcdatetime()) FOR [entry_datetime];
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [DF__fact_prod__is_un__74AE54BC] DEFAULT ((0)) FOR [is_undone];
GO
ALTER TABLE [dbo].[PDInputData] ADD CONSTRAINT [DF__PDInputDa__TimeS__49C3F6B7] DEFAULT (getdate()) FOR [TimeStamp];
GO

-- ===== UNIQUE CONSTRAINTS =====

ALTER TABLE [dbo].[app_user] ADD CONSTRAINT [uq_app_user_username] UNIQUE ([username]);
GO
ALTER TABLE [dbo].[dim_machine] ADD CONSTRAINT [UQ__dim_mach__FDCF4D7324A3D0BB] UNIQUE ([machine_code]);
GO
ALTER TABLE [dbo].[dim_product] ADD CONSTRAINT [UQ__dim_prod__AE1A8CC4EA3B641B] UNIQUE ([product_code]);
GO
ALTER TABLE [dbo].[dim_product_group] ADD CONSTRAINT [UQ__dim_prod__225F7A76AF62FD3E] UNIQUE ([product_group_name]);
GO
ALTER TABLE [dbo].[fact_daily_summary] ADD CONSTRAINT [uq_daily_summary] UNIQUE ([production_date], [shift_code], [machine_id]);
GO

-- ===== CHECK CONSTRAINTS =====

ALTER TABLE [dbo].[app_user] ADD CONSTRAINT [ck_app_user_role] CHECK ([role]='viewer' OR [role]='editor' OR [role]='admin');
GO
ALTER TABLE [dbo].[app_user] ADD CONSTRAINT [ck_app_user_status] CHECK ([status]='rejected' OR [status]='approved' OR [status]='pending');
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__machi__68487DD7] CHECK ([machine_run_time]>=(0) AND [machine_run_time]<=(24));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__std_h__693CA210] CHECK ([std_hc]>=(0) AND [std_hc]<=(25));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__std_h__6A30C649] CHECK ([std_hour]>=(0));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__hour___6B24EA82] CHECK ([hour_piece_rate]>=(0));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__loss___6C190EBB] CHECK ([loss_hour]>=(0) AND [loss_hour]<=(13));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__actua__6E01572D] CHECK ([actual_bulk_hr]>=(0) AND [actual_bulk_hr]<=(13));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__actua__6FE99F9F] CHECK ([actual_pallet_hr]>=(0) AND [actual_pallet_hr]<=(13));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__actua__71D1E811] CHECK ([actual_assist_hr]>=(0) AND [actual_assist_hr]<=(13));
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [CK__fact_prod__actua__72C60C4A] CHECK ([actual_hc]>=(0) AND [actual_hc]<=(25));
GO

-- ===== FOREIGN KEYS =====

ALTER TABLE [dbo].[app_user] ADD CONSTRAINT [fk_app_user_approved_by] FOREIGN KEY ([approved_by]) REFERENCES [dbo].[app_user] ([user_id]);
GO
ALTER TABLE [dbo].[dim_product] ADD CONSTRAINT [FK__dim_produ__produ__5AEE82B9] FOREIGN KEY ([product_group_id]) REFERENCES [dbo].[dim_product_group] ([product_group_id]);
GO
ALTER TABLE [dbo].[fact_daily_summary] ADD CONSTRAINT [FK__fact_dail__machi__7A672E12] FOREIGN KEY ([machine_id]) REFERENCES [dbo].[dim_machine] ([machine_id]);
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [FK__fact_prod__shift__656C112C] FOREIGN KEY ([shift_code]) REFERENCES [dbo].[dim_shift] ([shift_code]);
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [FK__fact_prod__machi__66603565] FOREIGN KEY ([machine_id]) REFERENCES [dbo].[dim_machine] ([machine_id]);
GO
ALTER TABLE [dbo].[fact_production_record] ADD CONSTRAINT [FK__fact_prod__produ__6754599E] FOREIGN KEY ([product_id]) REFERENCES [dbo].[dim_product] ([product_id]);
GO
ALTER TABLE [dbo].[map_machine_product_group] ADD CONSTRAINT [FK__map_machi__machi__5FB337D6] FOREIGN KEY ([machine_id]) REFERENCES [dbo].[dim_machine] ([machine_id]);
GO
ALTER TABLE [dbo].[map_machine_product_group] ADD CONSTRAINT [FK__map_machi__produ__60A75C0F] FOREIGN KEY ([product_group_id]) REFERENCES [dbo].[dim_product_group] ([product_group_id]);
GO

-- ===== INDEXES (non-PK/UQ) =====

CREATE NONCLUSTERED INDEX [ix_app_user_status] ON [dbo].[app_user] ([status] ASC);
GO
CREATE NONCLUSTERED INDEX [ix_fact_dl_eff_support] ON [dbo].[fact_production_record] ([productivity_std_pcs_mh] ASC, [productivity_ac_pcs_mh] ASC, [total_loss_hour] ASC, [production_date] ASC, [machine_id] ASC);
GO
CREATE NONCLUSTERED INDEX [ix_fact_prod_date_machine] ON [dbo].[fact_production_record] ([production_date] ASC, [machine_id] ASC, [shift_code] ASC);
GO
