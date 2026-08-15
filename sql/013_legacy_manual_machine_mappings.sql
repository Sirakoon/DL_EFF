/* ═══════════════════════════════════════════════════════════════════
   013_legacy_manual_machine_mappings.sql
   ─────────────────────────────────────────────────────────────────
   หลัง 012_reload_master_data.sql ล้าง map_machine_product_group แล้ว
   สร้างใหม่ตาม MC_P sheet เครื่อง Armsleeve / ManualDrape / ManualMefix /
   ManualMepore (มีอยู่ใน DB มาก่อนแล้ว) เหลือ 0 mapping เพราะ MC_P sheet
   ไม่มีเครื่องพวกนี้เลย — สอบถาม Sirawit แล้ว (2026-08-15): เครื่องพวกนี้
   ยังใช้งานอยู่จริง ไม่ได้เลิกใช้

   MC_P sheet ไม่ได้ระบุ product group ของเครื่องเหล่านี้ไว้ — เพิ่ม
   mapping ตรงนี้จากการจับคู่ชื่อเครื่อง = ชื่อ product group ตรงๆ (สมเหตุ
   สมผลที่สุดเท่าที่มีข้อมูล ควรให้ Pook ยืนยันอีกครั้ง):
     Armsleeve    -> Armsleeve
     ManualDrape  -> Manualdrape
     ManualMefix  -> MefixManual

   ManualMepore ยังไม่ได้ map (ไม่มี product group "ManualMepore" ใน
   Product_SMS เลย — ค้างไว้เป็น item เดิมที่ยังไม่ตัดสินใจ)

   รันซ้ำได้ (idempotent)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM map_machine_product_group mp
    JOIN dim_machine m ON m.machine_id = mp.machine_id
    JOIN dim_product_group g ON g.product_group_id = mp.product_group_id
    WHERE m.machine_code = N'Armsleeve' AND g.product_group_name = N'Armsleeve'
)
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT m.machine_id, g.product_group_id
FROM dim_machine m, dim_product_group g
WHERE m.machine_code = N'Armsleeve' AND g.product_group_name = N'Armsleeve';

IF NOT EXISTS (
    SELECT 1 FROM map_machine_product_group mp
    JOIN dim_machine m ON m.machine_id = mp.machine_id
    JOIN dim_product_group g ON g.product_group_id = mp.product_group_id
    WHERE m.machine_code = N'ManualDrape' AND g.product_group_name = N'Manualdrape'
)
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT m.machine_id, g.product_group_id
FROM dim_machine m, dim_product_group g
WHERE m.machine_code = N'ManualDrape' AND g.product_group_name = N'Manualdrape';

IF NOT EXISTS (
    SELECT 1 FROM map_machine_product_group mp
    JOIN dim_machine m ON m.machine_id = mp.machine_id
    JOIN dim_product_group g ON g.product_group_id = mp.product_group_id
    WHERE m.machine_code = N'ManualMefix' AND g.product_group_name = N'MefixManual'
)
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT m.machine_id, g.product_group_id
FROM dim_machine m, dim_product_group g
WHERE m.machine_code = N'ManualMefix' AND g.product_group_name = N'MefixManual';

PRINT 'Added legacy manual machine mappings (Armsleeve, ManualDrape, ManualMefix)';
GO
