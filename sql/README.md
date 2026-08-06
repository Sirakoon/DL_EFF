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
| `seed_mock_pd_data_aug2026.sql` | ไม่ใช่ migration — สคริปต์ seed ข้อมูล mock 500 แถวลง `fact_production_record` กระจายทุกวัน/ทุกกะของ ส.ค. 2026 สำหรับทดลอง dashboard เท่านั้น (tag `created_by = 'mock_data_script'` เพื่อลบทิ้งได้ง่าย — ดูคอมเมนต์หัวไฟล์) |

สคริปต์ 000-008 ถูกดึงออกมาจากฐานข้อมูล `RealTimeUpdate` จริงที่ใช้งานอยู่ (สร้างเมื่อ 2026-08-06)
ใช้สำหรับ deploy ขึ้นเครื่อง/เซิร์ฟเวอร์ใหม่ หรือเป็นเอกสารอ้างอิงโครงสร้างฐานข้อมูล — **ไม่ต้องรันซ้ำกับฐานข้อมูลปัจจุบันที่มีอยู่แล้ว**
ยกเว้น `005/006/007/008` (เขียนแบบ `CREATE OR ALTER`) ที่ควรรันซ้ำได้เพื่ออัปเดต stored procedure ให้ตรงกับโค้ดล่าสุด และ `009_utc_timestamps.sql` ที่ต้องรันครั้งเดียวกับฐานข้อมูลปัจจุบัน (ดูคอมเมนต์ในไฟล์ก่อนตัดสินใจเรื่อง backfill ข้อมูลเก่า)
