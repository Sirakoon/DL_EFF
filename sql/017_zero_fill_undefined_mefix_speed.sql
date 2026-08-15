/* ═══════════════════════════════════════════════════════════════════
   017_zero_fill_undefined_mefix_speed.sql
   ─────────────────────────────────────────────────────────────────
   ถาม Pook แล้ว (2026-08-15) เรื่อง 5 product code ที่ไม่มีค่า capacity/
   mc_speed เลย (310250-30, 310276-30, 312076-30, 313000-30, 313076-30):
   ของจริงในระบบปัจจุบันของ Pook ก็ไม่มีค่าตัวเลขนี้เหมือนกัน (ถาม PD แล้ว
   ไม่มีใครให้คำตอบได้) — ให้ใส่ 0 ไปเลยแทนการปล่อยว่าง (NULL)

   ใส่ที่ mc_speed_pcs_hr (ไม่ใช่ capacity_pcs_hr) เพราะ 5 code นี้ถูก
   assign เข้ากลุ่ม MefixAuto (ฝั่ง Auto) ไปแล้วตั้งแต่ 012_reload_master_data.sql
   — ผลลัพธ์ std_output จะออกมาเป็น 0 แทน NULL (DL Eff ยังเป็น NULL
   เหมือนเดิม เพราะ vw_dl_eff กันหารด้วย 0 ไว้อยู่แล้ว)

   รันซ้ำได้ (idempotent)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

UPDATE dim_product
SET mc_speed_pcs_hr = 0, updated_at = SYSUTCDATETIME()
WHERE product_code IN (N'310250-30', N'310276-30', N'312076-30', N'313000-30', N'313076-30');
PRINT CONCAT('Zero-filled mc_speed_pcs_hr for ', @@ROWCOUNT, ' dim_product rows');
GO

/* backfill record จริง (ไม่ใช่ mock) ที่เคยบันทึกด้วยค่า NULL เดิม */
UPDATE f
SET f.mc_speed_pcs_hr = p.mc_speed_pcs_hr
FROM fact_production_record f
JOIN dim_product p ON p.product_id = f.product_id
WHERE p.product_code IN (N'310250-30', N'310276-30', N'312076-30', N'313000-30', N'313076-30')
  AND ISNULL(f.created_by, '') <> 'mock_data_script';
PRINT CONCAT('Backfilled ', @@ROWCOUNT, ' non-mock fact_production_record rows');
GO
