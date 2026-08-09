# sql2 — Schema Snapshot (extracted from live DB)

สคริปต์ในโฟลเดอร์นี้ดึงออกมาจากฐานข้อมูล `RealTimeUpdate` จริงบนเซิร์ฟเวอร์
`Sirawit` โดยตรง ผ่าน `sqlcmd` + system catalog views (`sys.tables`,
`sys.columns`, `sys.foreign_keys`, `sp_helptext`, ฯลฯ) เทียบเท่ากับการ
คลิกขวา database → **Tasks → Generate Scripts** ใน SSMS

สร้างเมื่อ: 2026-08-06

## ต่างจากโฟลเดอร์ `sql/` ยังไง

`sql/` คือสคริปต์ migration ที่เขียนด้วยมือแบบ idempotent (`IF NOT EXISTS`,
`CREATE OR ALTER`) ไล่ตามลำดับประวัติการพัฒนา — ใช้รันกับฐานข้อมูลใหม่หรือ
apply การเปลี่ยนแปลงทีละ step

`sql2/` คือ **snapshot ปัจจุบัน** ของ schema จริงตอนนี้ (raw `CREATE`
statements ไม่มี `IF NOT EXISTS` guard) — ใช้เป็นเอกสารอ้างอิงว่า schema
ตอนนี้หน้าตาเป็นอย่างไรจริง ๆ หรือ deploy ขึ้นฐานข้อมูลเปล่าใหม่ครั้งเดียว
(ห้ามรันซ้ำกับฐานข้อมูลที่มีอยู่แล้ว — จะ error เพราะ object ซ้ำ)

รันตามลำดับ: `001_tables.sql` → `002_views.sql` → `003_procedures.sql`

| ไฟล์ | เนื้อหา |
|---|---|
| `001_tables.sql` | 12 ตาราง + PK/UQ/CHECK/FK/DEFAULT constraints + index ทั้งหมด |
| `002_views.sql` | `vw_dl_eff`, `vw_oee_productivity` |
| `003_procedures.sql` | stored procedure ทั้ง 9 ตัว |

## รายชื่อ object ที่ scan ได้จริงบน server

**Tables (12):** `app_user`, `CalData`, `dim_machine`, `dim_product`,
`dim_product_group`, `dim_shift`, `fact_daily_summary`,
`fact_production_record`, `map_machine_product_group`, `MasterdData`,
`PDInputData`, `RawDataTest`

**Views (2):** `vw_dl_eff`, `vw_oee_productivity`

**Stored Procedures (9):** `sp_add_production_record`,
`sp_get_dashboard_filters`, `sp_get_dashboard_machine_performance`,
`sp_get_dl_eff_detail`, `sp_get_dl_eff_filters`, `sp_get_dl_eff_overview`,
`sp_get_pd_input_filters`, `sp_get_pd_input_list`,
`sp_refresh_daily_summary`

> `CalData`, `MasterdData`, `PDInputData` เป็นตารางชุดเก่าที่ยังอยู่บน
> server จริงแต่ไม่มี controller ใน `Backend/src` อ้างถึงแล้ว (ดู
> `sql/000_legacy_raw_tables.sql`) — เก็บสคริปต์ไว้เพื่อความครบถ้วนของ
> schema เท่านั้น

`fact_production_record` มี **computed columns (PERSISTED)** 6 คอลัมน์
(`cal_output_at_oee`, `std_output`, `productivity_std_pcs_mh`,
`actual_hour`, `total_loss_hour`, `productivity_ac_pcs_mh`) — คำนวณ
อัตโนมัติจากคอลัมน์อื่นในแถวเดียวกัน ไม่ต้อง insert ค่าตรง ๆ
