/* ═══════════════════════════════════════════════════════════════════
   009_utc_timestamps.sql
   ─────────────────────────────────────────────────────────────────
   ปัญหาเดิม: created_at / last_login / approved_at / entry_datetime /
   updated_at / last_refreshed_at ทุกคอลัมน์ใช้ DEFAULT GETDATE() ซึ่ง
   คืนเวลา "local" ของเครื่อง SQL Server (ไม่มี timezone กำกับ) แต่ตอน
   backend อ่านค่ากลับไปทำ JSON.stringify มันจะแปะ "Z" (UTC) ให้เฉยๆ
   โดยไม่ได้แปลงจริง → เวลาที่ frontend อ่านได้ผิดจากความเป็นจริง

   ไฟล์นี้แก้ DEFAULT constraint ของทุกคอลัมน์ให้ใช้ SYSUTCDATETIME()
   แทน (เก็บเป็น UTC จริง) — รันได้ปลอดภัย รันซ้ำได้ (idempotent)
   ต้องรันกับฐานข้อมูลที่มีอยู่แล้วเท่านั้น (001/002/003 จะไม่ไปแก้ตาราง
   ที่มีอยู่แล้วเพราะเช็ค IF NOT EXISTS)

   หมายเหตุสำคัญ: ไฟล์นี้แก้ "ค่า default ของแถวใหม่ที่จะ insert ต่อจากนี้"
   เท่านั้น — แถวเก่าที่มีอยู่แล้วยังเป็นตัวเลขเดิม (เวลา local ของตอนที่
   insert) ไม่ได้ถูกแปลงย้อนหลัง ดูส่วน "OPTIONAL BACKFILL" ท้ายไฟล์
   ก่อนตัดสินใจรัน — ควรตรวจสอบให้แน่ใจก่อนว่า timezone ของเครื่อง
   SQL Server เป็น Asia/Bangkok (UTC+7) จริง แล้วค่อยรัน backfill
═══════════════════════════════════════════════════════════════════ */

/* ── generic helper: find & drop the auto-named default constraint, add a
      named one back with SYSUTCDATETIME() ── */
DECLARE @table SYSNAME, @column SYSNAME, @cn NVARCHAR(200), @sql NVARCHAR(MAX);

DECLARE targets CURSOR LOCAL FOR
    SELECT * FROM (VALUES
        ('app_user',              'created_at'),
        ('dim_machine',           'updated_at'),
        ('dim_product',           'updated_at'),
        ('fact_production_record','entry_datetime'),
        ('fact_daily_summary',    'last_refreshed_at')
    ) AS t(table_name, column_name);

OPEN targets;
FETCH NEXT FROM targets INTO @table, @column;

WHILE @@FETCH_STATUS = 0
BEGIN
    SELECT @cn = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID(@table) AND c.name = @column;

    IF @cn IS NOT NULL
    BEGIN
        SET @sql = 'ALTER TABLE ' + QUOTENAME(@table) + ' DROP CONSTRAINT ' + QUOTENAME(@cn);
        EXEC (@sql);
        PRINT 'Dropped old default on ' + @table + '.' + @column + ' (' + @cn + ')';
    END

    SET @sql = 'ALTER TABLE ' + QUOTENAME(@table) + ' ADD CONSTRAINT '
             + QUOTENAME('df_' + @table + '_' + @column + '_utc')
             + ' DEFAULT (SYSUTCDATETIME()) FOR ' + QUOTENAME(@column);
    EXEC (@sql);
    PRINT 'Set UTC default on ' + @table + '.' + @column;

    FETCH NEXT FROM targets INTO @table, @column;
END

CLOSE targets;
DEALLOCATE targets;
GO

/* ═══════════════════════════════════════════════════════════════════
   OPTIONAL BACKFILL — do NOT run blindly.

   ตารางเก่าตอนนี้เก็บเวลา local (Asia/Bangkok, UTC+7) เป็นตัวเลขดิบ
   ถ้าอยากให้ข้อมูลเก่ากับใหม่สอดคล้องกัน (เป็น UTC จริงทั้งหมด) ต้อง
   ลบ 7 ชั่วโมงออกจากค่าที่มีอยู่ — ทำได้ครั้งเดียว ย้อนกลับไม่ได้ถ้าไม่มี
   backup ตรวจสอบก่อนว่าเครื่อง SQL Server ตั้ง timezone เป็น
   Asia/Bangkok จริง (เทียบ GETDATE() กับเวลาปัจจุบันจริงบนจอ) ก่อนรัน

   UPDATE app_user               SET created_at   = DATEADD(HOUR, -7, created_at);
   UPDATE app_user               SET last_login   = DATEADD(HOUR, -7, last_login)   WHERE last_login   IS NOT NULL;
   UPDATE app_user               SET approved_at  = DATEADD(HOUR, -7, approved_at)  WHERE approved_at  IS NOT NULL;
   UPDATE dim_machine            SET updated_at   = DATEADD(HOUR, -7, updated_at);
   UPDATE dim_product            SET updated_at   = DATEADD(HOUR, -7, updated_at);
   UPDATE fact_production_record SET entry_datetime = DATEADD(HOUR, -7, entry_datetime);
   UPDATE fact_production_record SET updated_at     = DATEADD(HOUR, -7, updated_at) WHERE updated_at IS NOT NULL;
   UPDATE fact_daily_summary     SET last_refreshed_at = DATEADD(HOUR, -7, last_refreshed_at);
═══════════════════════════════════════════════════════════════════ */
