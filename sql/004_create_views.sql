/* ═══════════════════════════════════════════════════════════════════
   004_create_views.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันหลัง 003_create_fact_tables.sql

   vw_dl_eff           : คำนวณ DL Eff % ต่อ record จาก productivity
                         (แยก view ต่างหากเพราะสูตรอาจถูกปรับ/ทดแทนในอนาคต)
   vw_oee_productivity : view หลักที่ backend ทุก controller ใช้อ่านข้อมูล
                         (join fact_production_record + dimension ทั้งหมด)
═══════════════════════════════════════════════════════════════════ */

CREATE OR ALTER VIEW vw_dl_eff AS
SELECT
    record_id,
    productivity_std_pcs_mh,
    productivity_ac_pcs_mh,
    CASE WHEN productivity_std_pcs_mh IS NULL OR productivity_std_pcs_mh = 0 THEN NULL
         ELSE ((productivity_ac_pcs_mh - productivity_std_pcs_mh) / productivity_std_pcs_mh) * 100
    END AS dl_eff_percent
FROM fact_production_record;
GO

CREATE OR ALTER VIEW vw_oee_productivity AS
SELECT
    f.record_id,
    f.production_date,
    f.shift_code,
    m.machine_code,
    pg.product_group_name,
    p.product_code,
    p.product_description,

    f.mc_speed_pcs_hr,
    f.capacity_pcs_hr,
    f.oee_target,
    f.machine_run_time,
    f.std_hc,
    f.std_hour,
    f.hour_piece_rate,
    f.actual_output,
    f.loss_hour,
    f.actual_bulk_hr,
    f.actual_pallet_hr,
    f.actual_assist_hr,
    f.actual_hc,

    f.cal_output_at_oee,
    f.std_output,
    f.productivity_std_pcs_mh,
    f.actual_hour,
    f.total_loss_hour,
    f.productivity_ac_pcs_mh,
    d.dl_eff_percent,

    f.is_undone,
    f.entry_datetime
FROM fact_production_record f
JOIN dim_machine m         ON m.machine_id = f.machine_id
JOIN dim_product p         ON p.product_id = f.product_id
JOIN dim_product_group pg  ON pg.product_group_id = p.product_group_id
JOIN vw_dl_eff d            ON d.record_id = f.record_id;
GO
