/* ═══════════════════════════════════════════════════════════════════
   012_reload_master_data_from_pook.sql
   ─────────────────────────────────────────────────────────────────
   AUTO-GENERATED from Pook's source files (2026-08-15):
     - Product_SMS.xlsx (sheet ProductG_Std)         -> dim_product
     - Data Collection_Design.xlsm (sheet MC_P)      -> map_machine_product_group
     - Data Collection_Design.xlsm (sheet Machine_Std) -> dim_machine (missing codes only)

   ไม่ลบ/ไม่แตะ dim_machine, dim_product ที่มีอยู่แล้ว (กัน FK จาก
   fact_production_record พัง) — ใช้ MERGE/UPSERT ตาม code เดิม
   map_machine_product_group ไม่มีใครอ้าง FK มา ลบทั้งหมดแล้วสร้างใหม่
   ตาม MC_P ได้ตรง ๆ (ข้อมูลเดิมเป็น mock ผิดทั้งหมด)

   ชื่อ Product Group ที่สะกดต่างกันระหว่าง MC_P กับ Product_SMS/DB ถูก
   แปลงให้ตรงกับ Product_SMS/DB (ของเดิมในระบบ) แล้ว:
     AutoMefix -> MefixAuto, ManualMefix -> MefixManual, AutoMepore -> MeporeAuto

   ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว รันซ้ำได้ (idempotent — MERGE/DELETE+INSERT)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
GO

/* ── dim_machine: เพิ่มเครื่องที่ยังไม่มีใน DB (พบใน MC_P) ── */
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'1')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'1', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'10')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'10', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'2')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'2', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'3')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'3', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'4')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'4', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'5')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'5', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'6')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'6', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'7')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'7', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'8')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'8', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'9')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'9', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'EDP1')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'EDP1', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'EDP1.1')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'EDP1.1', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'EDP2')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'EDP2', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'EDP3')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'EDP3', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'EDP4')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'EDP4', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'EDP4.1')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'EDP4.1', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M336')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M336', 0.983, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M337')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M337', 0.967, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M373')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M373', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M436')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M436', 0.851, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M507')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M507', 0.867, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M519')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M519', 0.971, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M521')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M521', 0.898, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M522')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M522', 0.841, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M534')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M534', 0.91, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M537')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M537', 0.956, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M555')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M555', 0.85, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M66')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M66', 0, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'M691')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'M691', 0.982, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'MV1')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'MV1', 0.958, 1);
IF NOT EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = N'MV4')
    INSERT INTO dim_machine (machine_code, oee_target, is_active) VALUES (N'MV4', 0.936, 1);
GO

/* ── dim_product: upsert capacity/mc_speed/group/description จาก Product_SMS ── */
MERGE dim_product AS tgt
USING (SELECT N'623501-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve'),
    product_description = N'Pre-sterile for 623501-09',
    capacity_pcs_hr = 75,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'623501-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve'), N'Pre-sterile for 623501-09', 75, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'105982-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Towel 75x75 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1455,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'105982-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Towel 75x75 cm', NULL, 1455, 1);
MERGE dim_product AS tgt
USING (SELECT N'181605-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'OP-Towel 75x90 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1893,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181605-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'OP-Towel 75x90 cm.', NULL, 1893, 1);
MERGE dim_product AS tgt
USING (SELECT N'181606-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'OP-Towel 45x75 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2113,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181606-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'OP-Towel 45x75 cm.', NULL, 2113, 1);
MERGE dim_product AS tgt
USING (SELECT N'181607-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-sheet 140x100cm, narrow adhe',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1254,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181607-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-sheet 140x100cm, narrow adhe', NULL, 1254, 1);
MERGE dim_product AS tgt
USING (SELECT N'181608-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Towel 90x75 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1957,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181608-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Towel 90x75 cm', NULL, 1957, 1);
MERGE dim_product AS tgt
USING (SELECT N'181614-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Absorbent Towel 56 x 80 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2177,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181614-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Absorbent Towel 56 x 80 cm', NULL, 2177, 1);
MERGE dim_product AS tgt
USING (SELECT N'304998-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Absorbent Towel 56x80 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2177,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'304998-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Absorbent Towel 56x80 cm.', NULL, 2177, 1);
MERGE dim_product AS tgt
USING (SELECT N'470632-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Towel 75x50 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1337,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'470632-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Towel 75x50 cm', NULL, 1337, 1);
MERGE dim_product AS tgt
USING (SELECT N'470642-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Towel 50x50 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2276,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'470642-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Towel 50x50 cm', NULL, 2276, 1);
MERGE dim_product AS tgt
USING (SELECT N'520200-16' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-sheet 200x150 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 544,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'520200-16', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-sheet 200x150 cm', NULL, 544, 1);
MERGE dim_product AS tgt
USING (SELECT N'520240-16' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-sheet 200x175 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 544,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'520240-16', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-sheet 200x175 cm', NULL, 544, 1);
MERGE dim_product AS tgt
USING (SELECT N'56500-16' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive Patient Drape 300x175 cm, Reinf',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 729,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'56500-16', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive Patient Drape 300x175 cm, Reinf', NULL, 729, 1);
MERGE dim_product AS tgt
USING (SELECT N'56510-16' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive Patient Drape 200x100 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 673,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'56510-16', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive Patient Drape 200x100 cm', NULL, 673, 1);
MERGE dim_product AS tgt
USING (SELECT N'66051-16' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Sheet 260x175 cm, full adh',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1990,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'66051-16', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Sheet 260x175 cm, full adh', NULL, 1990, 1);
MERGE dim_product AS tgt
USING (SELECT N'66052-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Sheet 175x175 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 707,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'66052-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Sheet 175x175 cm', NULL, 707, 1);
MERGE dim_product AS tgt
USING (SELECT N'66053-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Sheet 300x175 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 558,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'66053-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Sheet 300x175 cm', NULL, 558, 1);
MERGE dim_product AS tgt
USING (SELECT N'66530-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-towel 50x28 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2098,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'66530-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-towel 50x28 cm', NULL, 2098, 1);
MERGE dim_product AS tgt
USING (SELECT N'66540-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Towel 90x75 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 512,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'66540-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Towel 90x75 cm', NULL, 512, 1);
MERGE dim_product AS tgt
USING (SELECT N'688' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M537(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1765,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'688', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M537(Plastic film)', NULL, 1765, 1);
MERGE dim_product AS tgt
USING (SELECT N'691' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M537(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1549,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'691', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M537(Plastic film)', NULL, 1549, 1);
MERGE dim_product AS tgt
USING (SELECT N'6913' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M537(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1549,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6913', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M537(Plastic film)', NULL, 1549, 1);
MERGE dim_product AS tgt
USING (SELECT N'6914' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'2 Lane paper M537(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 459,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6914', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'2 Lane paper M537(Paper film)', NULL, 459, 1);
MERGE dim_product AS tgt
USING (SELECT N'692' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M537(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1549,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'692', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M537(Plastic film)', NULL, 1549, 1);
MERGE dim_product AS tgt
USING (SELECT N'696' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M537(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1552,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'696', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M537(Plastic film)', NULL, 1552, 1);
MERGE dim_product AS tgt
USING (SELECT N'697' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M537(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1549,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'697', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M537(Plastic film)', NULL, 1549, 1);
MERGE dim_product AS tgt
USING (SELECT N'698' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M537 (Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1549,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'698', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M537 (Paper film)', NULL, 1549, 1);
MERGE dim_product AS tgt
USING (SELECT N'706035-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane paper M373(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1788,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'706035-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane paper M373(Paper film)', NULL, 1788, 1);
MERGE dim_product AS tgt
USING (SELECT N'706401-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane paper M519(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1595,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'706401-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane paper M519(Paper film)', NULL, 1595, 1);
MERGE dim_product AS tgt
USING (SELECT N'707035-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane paper M519(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1788,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'707035-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane paper M519(Paper film)', NULL, 1788, 1);
MERGE dim_product AS tgt
USING (SELECT N'716' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'BNS Adhesive OP-Sheet 260x175 cm, full a',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2479,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'716', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'BNS Adhesive OP-Sheet 260x175 cm, full a', NULL, 2479, 1);
MERGE dim_product AS tgt
USING (SELECT N'718' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Sheet 175x150 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2479,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'718', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Sheet 175x150 cm', NULL, 2479, 1);
MERGE dim_product AS tgt
USING (SELECT N'719' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Sheet 240x150 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2479,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'719', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Sheet 240x150 cm', NULL, 2479, 1);
MERGE dim_product AS tgt
USING (SELECT N'7214' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Paper M373(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 205,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'7214', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Paper M373(Plastic film)', NULL, 205, 1);
MERGE dim_product AS tgt
USING (SELECT N'726' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Sheet 140x100 cm, narrow adh',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2032,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'726', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Sheet 140x100 cm, narrow adh', NULL, 2032, 1);
MERGE dim_product AS tgt
USING (SELECT N'728' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'OP-Towel 45x75 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2032,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'728', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'OP-Towel 45x75 cm', NULL, 2032, 1);
MERGE dim_product AS tgt
USING (SELECT N'729' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Suction and diathermy bag,40x35cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2032,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'729', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Suction and diathermy bag,40x35cm', NULL, 2032, 1);
MERGE dim_product AS tgt
USING (SELECT N'7314' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane paper M373(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 205,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'7314', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane paper M373(Paper film)', NULL, 205, 1);
MERGE dim_product AS tgt
USING (SELECT N'733' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Fluid collection pouch, 40x35cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1676,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'733', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Fluid collection pouch, 40x35cm', NULL, 1676, 1);
MERGE dim_product AS tgt
USING (SELECT N'734' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M373(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1676,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'734', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M373(Plastic film)', NULL, 1676, 1);
MERGE dim_product AS tgt
USING (SELECT N'7613' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane paper M373(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'7613', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane paper M373(Paper film)', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'765' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Plastic M373(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'765', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Plastic M373(Plastic film)', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'76540-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane paper M519(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 512,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'76540-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane paper M519(Paper film)', NULL, 512, 1);
MERGE dim_product AS tgt
USING (SELECT N'767' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'3 Lane Paper M373(Paper film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1098,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'767', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'3 Lane Paper M373(Paper film)', NULL, 1098, 1);
MERGE dim_product AS tgt
USING (SELECT N'777025-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'1 Lane Plastic M691(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1254,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'777025-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'1 Lane Plastic M691(Plastic film)', NULL, 1254, 1);
MERGE dim_product AS tgt
USING (SELECT N'777400-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'1 Lane Plastic M691(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1098,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'777400-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'1 Lane Plastic M691(Plastic film)', NULL, 1098, 1);
MERGE dim_product AS tgt
USING (SELECT N'777600-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'1 Lane Plastic M691(Plastic film)',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1120,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'777600-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'1 Lane Plastic M691(Plastic film)', NULL, 1120, 1);
MERGE dim_product AS tgt
USING (SELECT N'800330-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'OP-Sheet 90x150 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2113,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'800330-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'OP-Sheet 90x150 cm', NULL, 2113, 1);
MERGE dim_product AS tgt
USING (SELECT N'800430-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'OP-Sheet 90x150 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2113,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'800430-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'OP-Sheet 90x150 cm', NULL, 2113, 1);
MERGE dim_product AS tgt
USING (SELECT N'8018-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'OP-Towel 37,5x45 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1138,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'8018-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'OP-Towel 37,5x45 cm.', NULL, 1138, 1);
MERGE dim_product AS tgt
USING (SELECT N'80649015-12' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'OP-Towel 45x75 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1138,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'80649015-12', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'OP-Towel 45x75 cm.', NULL, 1138, 1);
MERGE dim_product AS tgt
USING (SELECT N'8254-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'BNS Adhesive Aperture Drape 75X90 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1577,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'8254-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'BNS Adhesive Aperture Drape 75X90 cm.', NULL, 1577, 1);
MERGE dim_product AS tgt
USING (SELECT N'904622-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive aperture drape 45x75 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2036,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'904622-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive aperture drape 45x75 cm.', NULL, 2036, 1);
MERGE dim_product AS tgt
USING (SELECT N'904624-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive aperture drape 75x90 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1577,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'904624-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive aperture drape 75x90 cm.', NULL, 1577, 1);
MERGE dim_product AS tgt
USING (SELECT N'904736-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive aperture drape 75x90cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2258,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'904736-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive aperture drape 75x90cm', NULL, 2258, 1);
MERGE dim_product AS tgt
USING (SELECT N'904737-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive Aperture Drape 75x90cm Ap. 6x8c',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2201,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'904737-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive Aperture Drape 75x90cm Ap. 6x8c', NULL, 2201, 1);
MERGE dim_product AS tgt
USING (SELECT N'904758-08' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Aperture drape 50x60cm, 2-ply',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1566,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'904758-08', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Aperture drape 50x60cm, 2-ply', NULL, 1566, 1);
MERGE dim_product AS tgt
USING (SELECT N'906542-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive Aperture Drape 50x60cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1566,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'906542-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive Aperture Drape 50x60cm', NULL, 1566, 1);
MERGE dim_product AS tgt
USING (SELECT N'906544-08' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Aperture Drape 50x60cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2258,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'906544-08', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Aperture Drape 50x60cm', NULL, 2258, 1);
MERGE dim_product AS tgt
USING (SELECT N'906544-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Aperture Drape 50x60cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2258,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'906544-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Aperture Drape 50x60cm', NULL, 2258, 1);
MERGE dim_product AS tgt
USING (SELECT N'906693-08' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive Aperture Drape 50x60cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2201,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'906693-08', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive Aperture Drape 50x60cm', NULL, 2201, 1);
MERGE dim_product AS tgt
USING (SELECT N'906693-60' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive Aperture Drape 50x60cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2201,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'906693-60', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive Aperture Drape 50x60cm', NULL, 2201, 1);
MERGE dim_product AS tgt
USING (SELECT N'917770-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'BNS Adhesive OP-Sheet 140x100 cm, narrow',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1254,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'917770-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'BNS Adhesive OP-Sheet 140x100 cm, narrow', NULL, 1254, 1);
MERGE dim_product AS tgt
USING (SELECT N'920496-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Adhesive OP-Sheet 175x175 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1098,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'920496-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Adhesive OP-Sheet 175x175 cm', NULL, 1098, 1);
MERGE dim_product AS tgt
USING (SELECT N'930202-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'BNS Adhesive OP-Towel 90x75 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1957,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'930202-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'BNS Adhesive OP-Towel 90x75 cm', NULL, 1957, 1);
MERGE dim_product AS tgt
USING (SELECT N'968003-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'BNS OP-Towel 37,5x45 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2113,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'968003-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'BNS OP-Towel 37,5x45 cm.', NULL, 2113, 1);
MERGE dim_product AS tgt
USING (SELECT N'968004-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'BNS OP-Towel 45x75 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 2113,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'968004-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'BNS OP-Towel 45x75 cm.', NULL, 2113, 1);
MERGE dim_product AS tgt
USING (SELECT N'976035-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Fluid Collection Pouch 40x35cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1788,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'976035-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Fluid Collection Pouch 40x35cm', NULL, 1788, 1);
MERGE dim_product AS tgt
USING (SELECT N'977035-09' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'Suction And Diathermy Bag, 40x35 cm.',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1788,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'977035-09', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'Suction And Diathermy Bag, 40x35 cm.', NULL, 1788, 1);
MERGE dim_product AS tgt
USING (SELECT N'978250-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'),
    product_description = N'BNS Adhesive OP-Sheet 300x175 cm, full a',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 459,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'978250-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape'), N'BNS Adhesive OP-Sheet 300x175 cm, full a', NULL, 459, 1);
MERGE dim_product AS tgt
USING (SELECT N'97000518-06' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline'),
    product_description = N'Pre-sterile Blue line surg gown M 2 towels wrap',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'97000518-06', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline'), N'Pre-sterile Blue line surg gown M 2 towels wrap', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'97000519-06' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline'),
    product_description = N'Pre-sterile Blue line surg gown L 2 towels wrap',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'97000519-06', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline'), N'Pre-sterile Blue line surg gown L 2 towels wrap', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'97000520-06' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline'),
    product_description = N'Pre-sterile Blue line surg gown LL 2 towels wrap',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'97000520-06', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline'), N'Pre-sterile Blue line surg gown LL 2 towels wrap', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860101-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown L 2 towels wrap',
    capacity_pcs_hr = 217,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860101-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown L 2 towels wrap', 217, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown LL',
    capacity_pcs_hr = 217,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown LL', 217, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860103-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown LL 2 towels wrap',
    capacity_pcs_hr = 217,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860103-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown LL 2 towels wrap', 217, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860104-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown LL mask loop 2 towels wrap',
    capacity_pcs_hr = 200,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860104-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown LL mask loop 2 towels wrap', 200, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860105-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown XL',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860105-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown XL', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860106-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown XL 2 towels wrap',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860106-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown XL 2 towels wrap', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860107-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown XLL',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860107-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown XLL', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860108-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterileCL HP FSC Surg gown XLL 2 towels wrap',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860108-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterileCL HP FSC Surg gown XLL 2 towels wrap', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860109-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown XLL mask loop 2 towels wrap',
    capacity_pcs_hr = 188,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860109-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown XLL mask loop 2 towels wrap', 188, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860110-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown XXLL 2 towels wrap',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860110-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown XXLL 2 towels wrap', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'860111-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'Pre-sterile CL HP FSC Surg gown XXLXL 2 towels wrap',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'860111-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'Pre-sterile CL HP FSC Surg gown XXLXL 2 towels wrap', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960101-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown L',
    capacity_pcs_hr = 217,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960101-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown L', 217, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown LL',
    capacity_pcs_hr = 217,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown LL', 217, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960103-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown LL mask loop',
    capacity_pcs_hr = 200,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960103-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown LL mask loop', 200, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960104-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown XL',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960104-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown XL', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960105-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown XLL',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960105-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown XLL', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960106-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown XLL mask loop',
    capacity_pcs_hr = 188,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960106-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown XLL mask loop', 188, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960107-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown XXLL',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960107-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown XXLL', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'960108-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'),
    product_description = N'BNS CL HP FSC Surg gown XXLXL',
    capacity_pcs_hr = 215,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'960108-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP'), N'BNS CL HP FSC Surg gown XXLXL', 215, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'840101-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL Tie-Back FSC Surg gown L 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'840101-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL Tie-Back FSC Surg gown L 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'840102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL Tie-Back FSC Surg gown XLL 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'840102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL Tie-Back FSC Surg gown XLL 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'940101-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL Tie-Back FSC Surg gown L 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'940101-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL Tie-Back FSC Surg gown L 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'940102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL Tie-Back FSC Surg gown XLL 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'940102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL Tie-Back FSC Surg gown XLL 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850101-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown M 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850101-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown M 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown L 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown L 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850103-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown LL',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850103-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown LL', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850104-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown LL 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850104-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown LL 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850106-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown XL 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850106-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown XL 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850107-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown XLL',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850107-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown XLL', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850108-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown XLL 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850108-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown XLL 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850110-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown XXLL 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850110-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown XXLL 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'850111-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'Pre-sterile CL SP FSC Surg gown XXLXL 2 towels wrap',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'850111-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'Pre-sterile CL SP FSC Surg gown XXLXL 2 towels wrap', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'950101-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL SP FSC Surg gown M',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'950101-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL SP FSC Surg gown M', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'950102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL SP FSC Surg gown L',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'950102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL SP FSC Surg gown L', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'950103-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL SP FSC Surg gown LL',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'950103-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL SP FSC Surg gown LL', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'950104-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL SP FSC Surg gown XL',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'950104-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL SP FSC Surg gown XL', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'950105-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL SP FSC Surg gown XLL',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'950105-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL SP FSC Surg gown XLL', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'950106-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL SP FSC Surg gown XXLL',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'950106-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL SP FSC Surg gown XXLL', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'950107-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'),
    product_description = N'BNS CL SP FSC Surg gown XXL-XL',
    capacity_pcs_hr = 222,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'950107-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP'), N'BNS CL SP FSC Surg gown XXL-XL', 222, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'6701021-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Surgical Gown FPP L',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6701021-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Surgical Gown FPP L', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'6701031-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Surgical Gown FPP LL',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6701031-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Surgical Gown FPP LL', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'6701041-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Surgical Gown FPP XL',
    capacity_pcs_hr = 210,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6701041-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Surgical Gown FPP XL', 210, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'6701051-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Surgical Gown FPP XLL',
    capacity_pcs_hr = 210,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6701051-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Surgical Gown FPP XLL', 210, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'6701061-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Surgical Gown FPP XXL-XL',
    capacity_pcs_hr = 206,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6701061-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Surgical Gown FPP XXL-XL', 206, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'6701071-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Surgical Gown FPP XXLL',
    capacity_pcs_hr = 206,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'6701071-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Surgical Gown FPP XXLL', 206, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'670102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Pre-sterile Surgical Gown FPP L',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Pre-sterile Surgical Gown FPP L', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'670103-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Pre-sterile Surgical Gown FPP LL',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670103-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Pre-sterile Surgical Gown FPP LL', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'670104-01' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Pre-sterile Surgical Gown FPP XL',
    capacity_pcs_hr = 210,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670104-01', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Pre-sterile Surgical Gown FPP XL', 210, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'670105-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Pre-sterile Surgical Gown FPP XLL',
    capacity_pcs_hr = 210,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670105-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Pre-sterile Surgical Gown FPP XLL', 210, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'670106-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Pre-sterile Surgical Gown FPP XXL-XL',
    capacity_pcs_hr = 206,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670106-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Pre-sterile Surgical Gown FPP XXL-XL', 206, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'670107-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'Pre-sterile Surgical Gown FPP XXLL',
    capacity_pcs_hr = 206,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670107-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'Pre-sterile Surgical Gown FPP XXLL', 206, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'770102-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'BNS Surgical Gown FPP L',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'770102-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'BNS Surgical Gown FPP L', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'770103-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'BNS Surgical Gown FPP LL',
    capacity_pcs_hr = 218,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'770103-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'BNS Surgical Gown FPP LL', 218, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'770104-01' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'BNS Surgical Gown FPP XL',
    capacity_pcs_hr = 210,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'770104-01', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'BNS Surgical Gown FPP XL', 210, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'770105-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'BNS Surgical Gown FPP XLL',
    capacity_pcs_hr = 210,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'770105-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'BNS Surgical Gown FPP XLL', 210, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'770106-01' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'BNS Surgia Gown FPP XXLXL',
    capacity_pcs_hr = 206,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'770106-01', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'BNS Surgia Gown FPP XXLXL', 206, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'770107-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'),
    product_description = N'BNS Surgical Gown FPP XXLL',
    capacity_pcs_hr = 206,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'770107-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP'), N'BNS Surgical Gown FPP XXLL', 206, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'181603-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Laparoscopy Instrument Bag 30x50cm',
    capacity_pcs_hr = 117.03511053315994,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181603-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Laparoscopy Instrument Bag 30x50cm', 117.03511053315994, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'181604-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Ophthalmic Pouch V Shape, 25x30 cm with',
    capacity_pcs_hr = 60.934326337169935,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181604-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Ophthalmic Pouch V Shape, 25x30 cm with', 60.934326337169935, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'181609-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Adhesive OP-Sheet 200x100 cm, reinfo',
    capacity_pcs_hr = 40.59539918809202,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'181609-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Adhesive OP-Sheet 200x100 cm, reinfo', 40.59539918809202, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'5217-12' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Irrigation Pouch, 50x60 cm',
    capacity_pcs_hr = 59.016393442622956,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'5217-12', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Irrigation Pouch, 50x60 cm', 59.016393442622956, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'5218-12' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Fluid Collection Pouch 83x88 cm, "U" 15x',
    capacity_pcs_hr = 29.98001332445037,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'5218-12', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Fluid Collection Pouch 83x88 cm, "U" 15x', 29.98001332445037, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'66550-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Adhesive OP-Sheet 200x200 cm',
    capacity_pcs_hr = 69.17755572636435,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'66550-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Adhesive OP-Sheet 200x200 cm', 69.17755572636435, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705740-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'INSTRUMENT POCKET 30x50 cm',
    capacity_pcs_hr = 130.0578034682081,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705740-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'INSTRUMENT POCKET 30x50 cm', 130.0578034682081, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705750-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Equipment drape, 90x70 cm',
    capacity_pcs_hr = 78.05724197745013,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705750-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Equipment drape, 90x70 cm', 78.05724197745013, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705815-12' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Equipment Drape 60x60cm',
    capacity_pcs_hr = 49.5049504950495,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705815-12', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Equipment Drape 60x60cm', 49.5049504950495, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705815-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Equipment drape, 90x70 cm',
    capacity_pcs_hr = 49.5049504950495,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705815-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Equipment drape, 90x70 cm', 49.5049504950495, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705820-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Camera Drape, 18x250 cm, elastic tip',
    capacity_pcs_hr = 69.98444790046656,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705820-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Camera Drape, 18x250 cm, elastic tip', 69.98444790046656, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705830-21' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Camera Drape, 14x250 cm, plain tip',
    capacity_pcs_hr = 42.91845493562232,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705830-21', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Camera Drape, 14x250 cm, plain tip', 42.91845493562232, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705856-12' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Camera Drape, 14x250 cm , perforated tip',
    capacity_pcs_hr = 52.50875145857643,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705856-12', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Camera Drape, 14x250 cm , perforated tip', 52.50875145857643, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'705860-12' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Camera Drape, 8x120 cm, plain tip',
    capacity_pcs_hr = 70.53291536050156,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'705860-12', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Camera Drape, 8x120 cm, plain tip', 70.53291536050156, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'76408-15' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Adhesive OP-Sheet 200x240 cm',
    capacity_pcs_hr = 53.635280095351604,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'76408-15', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Adhesive OP-Sheet 200x240 cm', 53.635280095351604, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'76500-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Adhesive OP-Sheet 200x100 cm, reinfo',
    capacity_pcs_hr = 35.307963907414674,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'76500-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Adhesive OP-Sheet 200x100 cm, reinfo', 35.307963907414674, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'76510-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Adhesive OP-Sheet 300x250 cm',
    capacity_pcs_hr = 40.59539918809202,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'76510-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Adhesive OP-Sheet 300x250 cm', 40.59539918809202, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815310-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Instrument bag, 30x50 cm',
    capacity_pcs_hr = 35.19749706687524,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815310-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Instrument bag, 30x50 cm', 35.19749706687524, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'81531-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS X-ray cassette drape, 60x60cm',
    capacity_pcs_hr = 35.19749706687524,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'81531-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS X-ray cassette drape, 60x60cm', 35.19749706687524, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815320-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Equipment drape 90x70 cm',
    capacity_pcs_hr = 70.53291536050156,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815320-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Equipment drape 90x70 cm', 70.53291536050156, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'81532-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Irrigation Pouch, 50x50 cm',
    capacity_pcs_hr = 67.01414743112434,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'81532-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Irrigation Pouch, 50x50 cm', 67.01414743112434, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815330-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'IRRIGATION POUCH FOR GENERAL PURPOSE,50x',
    capacity_pcs_hr = 126.93935119887166,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815330-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'IRRIGATION POUCH FOR GENERAL PURPOSE,50x', 126.93935119887166, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815331-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Irrigation Pouch, 50x50 cm',
    capacity_pcs_hr = 75.88532883642496,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815331-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Irrigation Pouch, 50x50 cm', 75.88532883642496, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815332-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Camera drape 18x250 cm, elastic tip',
    capacity_pcs_hr = 67.01414743112434,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815332-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Camera drape 18x250 cm, elastic tip', 67.01414743112434, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815333-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNSCamera drape 14x250 cm, plain tip',
    capacity_pcs_hr = 40.964952207555754,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815333-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNSCamera drape 14x250 cm, plain tip', 40.964952207555754, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815362-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Camera drape 14x250 cm, perforated t',
    capacity_pcs_hr = 46.51162790697674,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815362-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Camera drape 14x250 cm, perforated t', 46.51162790697674, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'815425-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Camera drape 14x250 cm, perforated tip',
    capacity_pcs_hr = 48,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'815425-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Camera drape 14x250 cm, perforated tip', 48, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'831200-12' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Camera drape 8x120 cm, plain tip',
    capacity_pcs_hr = 35.74265289912629,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'831200-12', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Camera drape 8x120 cm, plain tip', 35.74265289912629, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'9317-03' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Ophthalmic Drainage Pouch 25x30 cm',
    capacity_pcs_hr = 64.51612903225806,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'9317-03', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Ophthalmic Drainage Pouch 25x30 cm', 64.51612903225806, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'9318-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'Fluid Collection Pouch 83x88cm Split 51c',
    capacity_pcs_hr = 56.144728633811596,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'9318-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'Fluid Collection Pouch 83x88cm Split 51c', 56.144728633811596, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'967784-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Adhesive OP-sheet 200x200 cm_1',
    capacity_pcs_hr = 63.60424028268551,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'967784-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Adhesive OP-sheet 200x200 cm_1', 63.60424028268551, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'9901-14' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'),
    product_description = N'BNS Irrigation Pouch, 50x60 cm',
    capacity_pcs_hr = 30.518819938962363,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'9901-14', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape'), N'BNS Irrigation Pouch, 50x60 cm', 30.518819938962363, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'310250-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'2.5cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310250-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'2.5cm x 10m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'310276-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'2.5cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310276-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'2.5cm x 5m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'310299-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'2.5cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310299-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'2.5cm x 10m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'310500-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'X',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1139.240506329114,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310500-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'X', NULL, 1139.240506329114, 1);
MERGE dim_product AS tgt
USING (SELECT N'310570-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'5cm X 2.5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1071.4285714285713,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310570-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'5cm X 2.5m', NULL, 1071.4285714285713, 1);
MERGE dim_product AS tgt
USING (SELECT N'310576-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'5cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1058.8235294117646,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310576-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'5cm x 5m', NULL, 1058.8235294117646, 1);
MERGE dim_product AS tgt
USING (SELECT N'310584-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'5cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1139.240506329114,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310584-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'5cm x 10m', NULL, 1139.240506329114, 1);
MERGE dim_product AS tgt
USING (SELECT N'310586-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'5cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1058.8235294117646,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310586-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'5cm x 5m', NULL, 1058.8235294117646, 1);
MERGE dim_product AS tgt
USING (SELECT N'310599-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'5cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1111.111111111111,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310599-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'5cm x 10m', NULL, 1111.111111111111, 1);
MERGE dim_product AS tgt
USING (SELECT N'311000-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'X',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1139.240506329114,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311000-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'X', NULL, 1139.240506329114, 1);
MERGE dim_product AS tgt
USING (SELECT N'311070-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'10cm x 2.5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1084.3373493975903,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311070-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'10cm x 2.5m', NULL, 1084.3373493975903, 1);
MERGE dim_product AS tgt
USING (SELECT N'311076-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'10cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1111.111111111111,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311076-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'10cm x 5m', NULL, 1111.111111111111, 1);
MERGE dim_product AS tgt
USING (SELECT N'311084-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'10cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1139.240506329114,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311084-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'10cm x 10m', NULL, 1139.240506329114, 1);
MERGE dim_product AS tgt
USING (SELECT N'311086-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'10cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1111.111111111111,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311086-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'10cm x 5m', NULL, 1111.111111111111, 1);
MERGE dim_product AS tgt
USING (SELECT N'311090-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'10cm x 11m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1168.831168831169,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311090-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'10cm x 11m', NULL, 1168.831168831169, 1);
MERGE dim_product AS tgt
USING (SELECT N'311099-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'10cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 1139.240506329114,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311099-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'10cm x 10m', NULL, 1139.240506329114, 1);
MERGE dim_product AS tgt
USING (SELECT N'311500-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'X',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311500-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'X', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'311570-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'15cm x 2.5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311570-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'15cm x 2.5m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'311576-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'15cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311576-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'15cm x 5m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'311586-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'15cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311586-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'15cm x 5m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'311590-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'15cm x 11m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311590-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'15cm x 11m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'311599-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'15cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'311599-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'15cm x 10m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'312000-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'20cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'312000-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'20cm x 10m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'312076-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'20cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'312076-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'20cm x 5m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'313000-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'30cm x 10m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'313000-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'30cm x 10m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'313076-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'),
    product_description = N'30cm x 5m',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'313076-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto'), N'30cm x 5m', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'310299-31' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixManual'),
    product_description = N'X',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'310299-31', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixManual'), N'X', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'312000-31' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixManual'),
    product_description = N'X',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'312000-31', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixManual'), N'X', NULL, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'670700-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 7x8 cm, UK DE',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 21600,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670700-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 7x8 cm, UK DE', NULL, 21600, 1);
MERGE dim_product AS tgt
USING (SELECT N'670800-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 6x7cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 22800,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670800-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 6x7cm', NULL, 22800, 1);
MERGE dim_product AS tgt
USING (SELECT N'670820-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore Pro 6x7cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 22800,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670820-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore Pro 6x7cm', NULL, 22800, 1);
MERGE dim_product AS tgt
USING (SELECT N'670840-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 6x7 cm, ph ES',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 22800,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670840-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 6x7 cm, ph ES', NULL, 22800, 1);
MERGE dim_product AS tgt
USING (SELECT N'670860-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 6x7cm OTC Norden',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 22800,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670860-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 6x7cm OTC Norden', NULL, 22800, 1);
MERGE dim_product AS tgt
USING (SELECT N'670880-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 6x7 cm, ph FR',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 22800,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670880-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 6x7 cm, ph FR', NULL, 22800, 1);
MERGE dim_product AS tgt
USING (SELECT N'670900-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 9x10cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 21600,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'670900-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 9x10cm', NULL, 21600, 1);
MERGE dim_product AS tgt
USING (SELECT N'672000-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 5x7cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 24300,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'672000-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 5x7cm', NULL, 24300, 1);
MERGE dim_product AS tgt
USING (SELECT N'672100-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 8x10cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 21600,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'672100-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 8x10cm', NULL, 21600, 1);
MERGE dim_product AS tgt
USING (SELECT N'672200-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore 8x15cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 21600,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'672200-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore 8x15cm', NULL, 21600, 1);
MERGE dim_product AS tgt
USING (SELECT N'680825-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore Ultra 7x8 cm',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 21600,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'680825-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore Ultra 7x8 cm', NULL, 21600, 1);
MERGE dim_product AS tgt
USING (SELECT N'680860-30' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'),
    product_description = N'Mepore Pro 6x7cm OTC Norden',
    capacity_pcs_hr = NULL,
    mc_speed_pcs_hr = 22800,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'680860-30', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto'), N'Mepore Pro 6x7cm OTC Norden', NULL, 22800, 1);
MERGE dim_product AS tgt
USING (SELECT N'870301-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'),
    product_description = N'Pre-sterile CL Urology FSC Surg gown L',
    capacity_pcs_hr = 120,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'870301-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'), N'Pre-sterile CL Urology FSC Surg gown L', 120, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'870302-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'),
    product_description = N'Pre-sterile CL Urology FSC Surg gown XL',
    capacity_pcs_hr = 120,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'870302-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'), N'Pre-sterile CL Urology FSC Surg gown XL', 120, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'970301-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'),
    product_description = N'BNS CL Urology FSC Surg gown L',
    capacity_pcs_hr = 120,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'970301-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'), N'BNS CL Urology FSC Surg gown L', 120, NULL, 1);
MERGE dim_product AS tgt
USING (SELECT N'970302-00' AS product_code) AS src
ON tgt.product_code = src.product_code
WHEN MATCHED THEN UPDATE SET
    product_group_id = (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'),
    product_description = N'BNS CL Urology FSC Surg gown XL',
    capacity_pcs_hr = 120,
    mc_speed_pcs_hr = NULL,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (product_code, product_group_id, product_description, capacity_pcs_hr, mc_speed_pcs_hr, is_active)
    VALUES (N'970302-00', (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology'), N'BNS CL Urology FSC Surg gown XL', 120, NULL, 1);
GO

/* ── map_machine_product_group: ล้างของเดิม (mock ผิดทั้งหมด) แล้วสร้างใหม่ตาม MC_P ── */
DELETE FROM map_machine_product_group;
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'2';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'2';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'2';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'2';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'2';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'2';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'3';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'3';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'3';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'3';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'3';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'3';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'5';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'5';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'5';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'5';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'5';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'5';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'6';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'6';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'6';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'6';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'6';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'6';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'7';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'7';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'7';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'7';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'7';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'7';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'8';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'8';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'8';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'8';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'8';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'8';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'9';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'9';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'9';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'9';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'9';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'9';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'10';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'10';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'10';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'10';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'10';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Armsleeve')
FROM dim_machine WHERE machine_code = N'10';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLSP')
FROM dim_machine WHERE machine_code = N'MV1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'CLHP')
FROM dim_machine WHERE machine_code = N'MV4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'FPP')
FROM dim_machine WHERE machine_code = N'MV4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Blueline')
FROM dim_machine WHERE machine_code = N'MV4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Urology')
FROM dim_machine WHERE machine_code = N'MV4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M336';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M337';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M373';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M436';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M507';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M519';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M522';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M534';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M537';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Autodrape')
FROM dim_machine WHERE machine_code = N'M691';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape')
FROM dim_machine WHERE machine_code = N'EDP1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape')
FROM dim_machine WHERE machine_code = N'EDP1.1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape')
FROM dim_machine WHERE machine_code = N'EDP2';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape')
FROM dim_machine WHERE machine_code = N'EDP3';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape')
FROM dim_machine WHERE machine_code = N'EDP4';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape')
FROM dim_machine WHERE machine_code = N'EDP4.1';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'Manualdrape')
FROM dim_machine WHERE machine_code = N'M66';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixAuto')
FROM dim_machine WHERE machine_code = N'M521';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MefixManual')
FROM dim_machine WHERE machine_code = N'M521';
INSERT INTO map_machine_product_group (machine_id, product_group_id)
SELECT machine_id, (SELECT product_group_id FROM dim_product_group WHERE product_group_name = N'MeporeAuto')
FROM dim_machine WHERE machine_code = N'M555';
GO
