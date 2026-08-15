/* ═══════════════════════════════════════════════════════════════════
   019_demo_seed_realistic_data.sql
   ─────────────────────────────────────────────────────────────────
   Seed ข้อมูลตัวอย่างสำหรับดูการคำนวณ/ทดสอบหน้าเว็บเท่านั้น (ไม่ใช่
   ข้อมูลผลิตจริง) — ต่างจาก seed_mock_pd_data_aug2026.sql เดิมตรงที่
   ตัวเลขนี้ตั้งใจให้ "สมเหตุสมผล": จับคู่เครื่อง↔product ถูกต้องตาม
   map_machine_product_group จริง (มาจาก Data Collection_Design.xlsm),
   ใช้ capacity/mc_speed จริงจาก Product_SMS.xlsx, actual_output ตั้งใจ
   ให้อยู่ในช่วง ±10% ของ STD Output เพื่อให้ DL Eff% ออกมาสมจริง
   (ไม่ใช่หลักพัน/หมื่น% แบบ mock เดิม)

   ครอบคลุมทั้ง 2 สูตร: Auto (MC Speed × OEE target) และ Manual
   (Capacity ตรงๆ) คนละ 2 combo คู่ๆ ผ่านทั้ง 5 product group ตัวอย่าง:
     - M337   + 105982-15  (Autodrape, Auto,  mc_speed=1455,   oee=.967)
     - "1"    + 850101-00  (CLSP,      Manual, capacity=222,   oee=0)
     - M555   + 670700-30  (MeporeAuto,Auto,  mc_speed=21600,  oee=.85)
     - EDP1   + 181603-00  (Manualdrape,Manual,capacity=117.04,oee=0)
     - M521   + 310584-30  (MefixAuto, Auto,  mc_speed=1139.24,oee=.898)

   ใส่ผ่าน sp_add_production_record เหมือน flow จริงของหน้าเว็บ (POST
   /api/pd-input) ทุกประการ — tag created_by = 'demo_seed' เพื่อให้หา/
   ลบทิ้งได้ง่ายทีหลัง (ดูตัวอย่างการลบท้ายไฟล์ ไม่ได้รันอัตโนมัติ)

   รันซ้ำได้ (ไม่ idempotent เต็มรูปแบบ — รันซ้ำจะเพิ่ม record ใหม่ซ้ำ
   ถ้าไม่ต้องการซ้ำให้ลบของเดิมก่อนด้วย DELETE ท้ายไฟล์)
═══════════════════════════════════════════════════════════════════ */

SET NOCOUNT ON;
GO

EXEC sp_add_production_record
  @production_date='2026-08-10', @shift_code='A', @machine_code='M337', @product_code='105982-15',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=10500,
  @loss_hour=1.0, @actual_bulk_hr=0.3, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-11', @shift_code='B', @machine_code='M337', @product_code='105982-15',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=12000,
  @loss_hour=0.8, @actual_bulk_hr=0.2, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-10', @shift_code='A', @machine_code='1', @product_code='850101-00',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=1700,
  @loss_hour=1.0, @actual_bulk_hr=0.3, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-12', @shift_code='C', @machine_code='1', @product_code='850101-00',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=1600,
  @loss_hour=1.5, @actual_bulk_hr=0.2, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @loss_reason=N'เครื่องหยุดปรับตั้งค่า', @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-11', @shift_code='A', @machine_code='M555', @product_code='670700-30',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=140000,
  @loss_hour=1.0, @actual_bulk_hr=0.3, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-13', @shift_code='B', @machine_code='M555', @product_code='670700-30',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=135000,
  @loss_hour=1.2, @actual_bulk_hr=0.3, @actual_pallet_hr=0.2, @actual_assist_hr=0.3, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-12', @shift_code='A', @machine_code='EDP1', @product_code='181603-00',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=900,
  @loss_hour=1.0, @actual_bulk_hr=0.3, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-14', @shift_code='C', @machine_code='EDP1', @product_code='181603-00',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=850,
  @loss_hour=1.3, @actual_bulk_hr=0.2, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-13', @shift_code='A', @machine_code='M521', @product_code='310584-30',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=8000,
  @loss_hour=1.0, @actual_bulk_hr=0.3, @actual_pallet_hr=0.3, @actual_assist_hr=0.2, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';

EXEC sp_add_production_record
  @production_date='2026-08-14', @shift_code='B', @machine_code='M521', @product_code='310584-30',
  @machine_run_time=8.0, @std_hc=4.00, @std_hour=8.00, @hour_piece_rate=32.00, @actual_output=7700,
  @loss_hour=1.1, @actual_bulk_hr=0.3, @actual_pallet_hr=0.2, @actual_assist_hr=0.3, @actual_hc=4,
  @source_system='PD', @created_by='demo_seed';
GO

/* ── ตัวอย่างการลบ demo data ทั้งหมดทีหลัง (ไม่ได้รันอัตโนมัติ) ──
DELETE FROM fact_production_record WHERE created_by = 'demo_seed';
EXEC sp_refresh_daily_summary @date_from='2026-08-10', @date_to='2026-08-14';
*/
