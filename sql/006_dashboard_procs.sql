/* ═══════════════════════════════════════════════════════════════════
   006_dashboard_procs.sql
   ─────────────────────────────────────────────────────────────────
   ต้องรันหลัง 004_create_views.sql

   sp_get_dashboard_machine_performance
     เดิม dashboardController.getMachinePerformance ยิง 6 query แยกกัน
     (แต่ละ query สแกน/กรอง vw_oee_productivity ซ้ำด้วย WHERE เดียวกัน)
     รวมเป็น stored procedure เดียว: กรองข้อมูลลง temp table ครั้งเดียว
     แล้ว SELECT ผลลัพธ์ 8 result set จาก temp table นั้น → ลดจำนวน
     round-trip จาก 6 เหลือ 1 และลดจำนวนครั้งที่สแกน/กรองข้อมูลดิบ

   sp_get_dashboard_filters
     รวม 3 query (distinct machine/shift/productGroup) เป็น 1 round-trip
═══════════════════════════════════════════════════════════════════ */

CREATE OR ALTER PROCEDURE sp_get_dashboard_machine_performance
    @dateFrom     DATE          = NULL,
    @dateTo       DATE          = NULL,
    @machine      VARCHAR(30)   = NULL,
    @shift        CHAR(1)       = NULL,
    @productGroup VARCHAR(50)   = NULL,
    @page         INT           = 1,
    @pageSize     INT           = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF OBJECT_ID('tempdb..#filtered') IS NOT NULL DROP TABLE #filtered;

    SELECT machine_code, product_group_name, machine_run_time, loss_hour,
           actual_output, actual_hour
    INTO #filtered
    FROM vw_oee_productivity
    WHERE (@dateFrom IS NULL OR production_date >= @dateFrom)
      AND (@dateTo IS NULL OR production_date <= @dateTo)
      AND (@machine IS NULL OR machine_code = @machine)
      AND (@shift IS NULL OR shift_code = @shift)
      AND (@productGroup IS NULL OR product_group_name = @productGroup);

    /* 1) KPI summary */
    SELECT
        COUNT(DISTINCT machine_code)                                     AS machineCount,
        SUM(machine_run_time)                                            AS totalRunTime,
        SUM(loss_hour)                                                   AS totalLossHour,
        SUM(CAST(actual_output AS FLOAT)) / NULLIF(SUM(actual_hour), 0) AS avgOutputPerHr
    FROM #filtered;

    /* 2) highest-loss machine */
    SELECT TOP 1
        machine_code AS MACHINE,
        SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100 AS lossRate
    FROM #filtered
    GROUP BY machine_code
    ORDER BY lossRate DESC;

    /* 3) loss by machine (top 10) */
    SELECT TOP 10
        machine_code AS MACHINE,
        ROUND(SUM(loss_hour), 1) AS lossHour
    FROM #filtered
    GROUP BY machine_code
    ORDER BY lossHour DESC;

    /* 4) output by machine (top 10) */
    SELECT TOP 10
        machine_code AS MACHINE,
        CAST(ROUND(SUM(CAST(actual_output AS FLOAT)) / NULLIF(SUM(actual_hour), 0), 0) AS INT) AS outputPerHr
    FROM #filtered
    GROUP BY machine_code
    ORDER BY outputPerHr DESC;

    /* 5) run time vs loss (top 10) */
    SELECT TOP 10
        machine_code AS MACHINE,
        ROUND(SUM(machine_run_time), 1) AS runTime,
        ROUND(SUM(loss_hour), 1)        AS lossHour
    FROM #filtered
    GROUP BY machine_code
    ORDER BY runTime DESC;

    /* 6) per-machine loss rate (JS aggregates into normal/watch/problem) */
    SELECT
        machine_code AS MACHINE,
        SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100 AS lossRate
    FROM #filtered
    GROUP BY machine_code;

    /* 7) ranking table (paged) */
    SELECT
        machine_code                                        AS MACHINE,
        MAX(product_group_name)                              AS productGroup,
        CAST(SUM(CAST(actual_output AS BIGINT)) AS BIGINT)  AS totalOutput,
        ROUND(SUM(machine_run_time), 1)                      AS runTime,
        ROUND(SUM(loss_hour), 1)                             AS lossHour,
        ROUND(SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100, 2) AS lossRate
    FROM #filtered
    GROUP BY machine_code
    ORDER BY totalOutput DESC
    OFFSET (@page - 1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;

    /* 8) ranking total count */
    SELECT COUNT(DISTINCT machine_code) AS total FROM #filtered;

    DROP TABLE #filtered;
END
GO

CREATE OR ALTER PROCEDURE sp_get_dashboard_filters
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT machine_code AS val FROM vw_oee_productivity ORDER BY val;
    SELECT DISTINCT shift_code AS val FROM vw_oee_productivity ORDER BY val;
    SELECT DISTINCT product_group_name AS val FROM vw_oee_productivity ORDER BY val;
END
GO
