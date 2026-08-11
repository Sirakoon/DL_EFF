/* ═══════════════════════════════════════════════════════════════════
   001_create_app_user.sql
   ─────────────────────────────────────────────────────────────────
   สร้างตาราง app_user สำหรับระบบ login/register/approve ของเว็บแอป
   รันสคริปต์นี้ 1 ครั้งบน database RealTimeUpdate (SSMS หรือ sqlcmd)

   role   : admin | editor | viewer
     - admin  : จัดการ user (approve/reject/reset password) + เพิ่ม/แก้/ลบข้อมูลได้
     - editor : เพิ่ม/แก้/ลบข้อมูลได้ (ไม่เห็นเมนูจัดการ user)
     - viewer : ดูข้อมูลได้อย่างเดียว
   status : pending (รอ admin อนุมัติ) | approved | rejected

   หมายเหตุ: ผู้ใช้คนแรกที่ register จะถูก backend อนุมัติเป็น admin
   ให้อัตโนมัติ (bootstrap) เพื่อให้มี admin คนแรกไว้อนุมัติคนต่อไปได้
═══════════════════════════════════════════════════════════════════ */

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'app_user')
BEGIN
    CREATE TABLE app_user (
        user_id        INT IDENTITY(1,1) PRIMARY KEY,
        username       VARCHAR(50)  NOT NULL,
        password_hash  VARCHAR(255) NOT NULL,
        role           VARCHAR(20)  NOT NULL
                        CONSTRAINT ck_app_user_role CHECK (role IN ('admin', 'editor', 'viewer')),
        status         VARCHAR(20)  NOT NULL DEFAULT 'pending'
                        CONSTRAINT ck_app_user_status CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at     DATETIME     NOT NULL DEFAULT SYSUTCDATETIME(),
        last_login     DATETIME     NULL,
        approved_by    INT          NULL,
        approved_at    DATETIME     NULL,
        CONSTRAINT uq_app_user_username UNIQUE (username),
        CONSTRAINT fk_app_user_approved_by FOREIGN KEY (approved_by) REFERENCES app_user(user_id)
    );

    CREATE INDEX ix_app_user_status ON app_user(status);

    PRINT 'Created table app_user';
END
ELSE
BEGIN
    PRINT 'Table app_user already exists — skipped';
END
GO
