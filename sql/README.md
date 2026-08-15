# SQL Scripts

รันตามลำดับเลขไฟล์ (SSMS หรือ `sqlcmd -S <server> -d RealTimeUpdate -i <file>`).
ทุกสคริปต์เขียนแบบ idempotent (`IF NOT EXISTS` / `CREATE OR ALTER`) — รันซ้ำได้โดยไม่พัง

| ไฟล์ | เนื้อหา |
|---|---|
| `000_legacy_raw_tables.sql` | ตารางชุดเก่า (CalData, MasterdData, PDInputData, RawDataTest) — เก็บไว้เพื่อความครบถ้วน ไม่ได้ใช้จริงแล้ว |
| `001_create_app_user.sql` | ตาราง `app_user` สำหรับระบบ login/register/approve |
| `002_create_dimension_tables.sql` | dim_shift, dim_product_group, dim_machine, dim_product, map_machine_product_group |
| `003_create_fact_tables.sql` | fact_production_record (มี computed columns), fact_daily_summary |
| `004_create_views.sql` | vw_dl_eff, vw_oee_productivity |
| `005_create_procedures.sql` | sp_refresh_daily_summary, sp_add_production_record |
| `006_dashboard_procs.sql` | sp_get_dashboard_machine_performance, sp_get_dashboard_filters |
| `007_dleff_procs.sql` | sp_get_dl_eff_overview, sp_get_dl_eff_detail, sp_get_dl_eff_filters |
| `008_pdinput_procs.sql` | sp_get_pd_input_list, sp_get_pd_input_filters |
| `009_utc_timestamps.sql` | Migration: เปลี่ยน DEFAULT ของคอลัมน์ timestamp ทั้งหมดจาก `GETDATE()` (local, ไม่มี timezone) เป็น `SYSUTCDATETIME()` (UTC จริง) — **ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว** เพราะ 001/002/003 ข้ามตารางที่มีอยู่แล้ว |
| `010_add_loss_reason.sql` | Migration: เพิ่มคอลัมน์ `loss_reason` ให้ `fact_production_record` + propagate ไปยัง view/procs ที่เกี่ยวข้อง |
| `011_fix_std_output_auto_manual.sql` | Migration: แก้สูตร `cal_output_at_oee`/`std_output`/`productivity_std_pcs_mh` ให้แยก Auto machine (ใช้ mc_speed_pcs_hr × oee_target) กับ Manual machine (ใช้ capacity_pcs_hr ตรงๆ) และลบตัวคูณ ×60 ที่ผิดหน่วยออก — **ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว** (ดูคอมเมนต์หัวไฟล์) |
| `012_reload_master_data.sql` | Migration (auto-generated จาก Pook's Data Collection_Design.xlsm + Product_SMS.xlsx 2026-08-15): เพิ่ม dim_machine ที่ขาด, upsert dim_product (capacity/mc_speed/group) ทั้งหมด, ล้าง+สร้าง map_machine_product_group ใหม่ตาม MC_P sheet — **ต้องรันกับฐานข้อมูลที่มีอยู่แล้ว** รันซ้ำได้ (ดูคอมเมนต์หัวไฟล์ + open items ที่ต้องเช็คกับ Pook) |
| `013_legacy_manual_machine_mappings.sql` | Migration: เพิ่ม mapping ของเครื่อง Armsleeve/ManualDrape/ManualMefix ที่ MC_P sheet ไม่ได้ระบุไว้ (จับคู่ชื่อเครื่อง=ชื่อ product group) — ยังไม่ map ManualMepore (ไม่มี product group นี้ใน Product_SMS) รันซ้ำได้ |
| `014_backfill_snapshot_values.sql` | Migration: backfill mc_speed_pcs_hr/capacity_pcs_hr/oee_target ของ record เก่าที่ไม่ใช่ mock (created_by <> 'mock_data_script') ให้ตรงกับ dim_product/dim_machine หลังแก้ 011/012/013 แล้วรีเฟรช fact_daily_summary — รันซ้ำได้ (หมายเหตุ: sp_refresh_daily_summary อาจ error arithmetic overflow ถ้าช่วงวันที่มี DL Eff % ที่สูงมาก ๆ ปนอยู่ — fact_daily_summary ไม่ได้ถูกใช้จริงโดย controller ไหนในระบบตอนนี้ ไม่กระทบหน้าจอ) |
| `seed_mock_pd_data_aug2026.sql` | ไม่ใช่ migration — สคริปต์ seed ข้อมูล mock 500 แถวลง `fact_production_record` กระจายทุกวัน/ทุกกะของ ส.ค. 2026 สำหรับทดลอง dashboard เท่านั้น (tag `created_by = 'mock_data_script'` เพื่อลบทิ้งได้ง่าย — ดูคอมเมนต์หัวไฟล์) |

สคริปต์ 000-008 ถูกดึงออกมาจากฐานข้อมูล `RealTimeUpdate` จริงที่ใช้งานอยู่ (สร้างเมื่อ 2026-08-06)
ใช้สำหรับ deploy ขึ้นเครื่อง/เซิร์ฟเวอร์ใหม่ หรือเป็นเอกสารอ้างอิงโครงสร้างฐานข้อมูล — **ไม่ต้องรันซ้ำกับฐานข้อมูลปัจจุบันที่มีอยู่แล้ว**
ยกเว้น `005/006/007/008` (เขียนแบบ `CREATE OR ALTER`) ที่ควรรันซ้ำได้เพื่ออัปเดต stored procedure ให้ตรงกับโค้ดล่าสุด และ `009_utc_timestamps.sql` ที่ต้องรันครั้งเดียวกับฐานข้อมูลปัจจุบัน (ดูคอมเมนต์ในไฟล์ก่อนตัดสินใจเรื่อง backfill ข้อมูลเก่า)
