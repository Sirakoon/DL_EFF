-- Stored Procedure TABLE MACHINES  --

-- Stored Procedure สำหรับลบ (CREATE) --
CREATE PROCEDURE [dbo].[sp_CreateMachineWithMapping]
    @machine_code VARCHAR(30),
    @oee_target DECIMAL(5,3),
    @version INT = NULL,
    @is_active BIT,
    @product_group_json NVARCHAR(MAX) -- รับข้อมูล Array เป็น JSON String
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- 1. เช็กซ้ำ
        IF EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = @machine_code)
        BEGIN
            THROW 50001, 'machine_code already exists', 1;
        END

        BEGIN TRANSACTION;

        DECLARE @InsertedMachine TABLE (
            machine_id INT,
            machine_code VARCHAR(30),
            oee_target DECIMAL(5,3),
            version INT,
            is_active BIT,
            updated_at DATETIME2
        );

        -- 2. Insert Table หลัก (dim_machine)
        INSERT INTO dim_machine (machine_code, oee_target, version, is_active, updated_at)
        OUTPUT INSERTED.machine_id, INSERTED.machine_code, INSERTED.oee_target, INSERTED.version, INSERTED.is_active, INSERTED.updated_at
        INTO @InsertedMachine
        VALUES (@machine_code, @oee_target, @version, @is_active, SYSUTCDATETIME());

        DECLARE @NewMachineId INT = (SELECT TOP 1 machine_id FROM @InsertedMachine);

        -- 3. Insert Table รอง (map_machine_product_group) แบบหลายแถว (Multi-row Insert)
        -- เช็กก่อนว่ามีการส่ง JSON มาและไม่ได้ว่างเปล่า
        IF @product_group_json IS NOT NULL AND @product_group_json <> '[]' AND @product_group_json <> ''
        BEGIN
            INSERT INTO map_machine_product_group (machine_id, product_group_id)
            SELECT 
                @NewMachineId,
                JSON_VALUE(value, '$.product_group_id') -- ดึงเฉพาะฟิลด์ product_group_id จาก JSON Object แต่ละตัว
            FROM OPENJSON(@product_group_json); -- OPENJSON จะแตก Array ออกมาเป็นแต่ละแถว
        END

        COMMIT TRANSACTION;

        -- 4. Return
        SELECT * FROM @InsertedMachine;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO


-- Stored Procedure สำหรับอัปเดต (PUT) --
CREATE PROCEDURE [dbo].[sp_UpdateMachineWithMapping]
    @machine_id INT,
    @machine_code VARCHAR(30),
    @oee_target DECIMAL(5,3),
    @version INT = NULL,
    @is_active BIT,
    @product_group_json NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- 1. เช็กว่า machine_code ไปซ้ำกับตัวอื่นหรือไม่
        IF EXISTS (SELECT 1 FROM dim_machine WHERE machine_code = @machine_code AND machine_id <> @machine_id)
        BEGIN
            THROW 50001, 'machine_code already exists', 1;
        END

        BEGIN TRANSACTION;

        -- 2. อัปเดตตารางหลัก (dim_machine)
        UPDATE dim_machine
        SET 
            machine_code = @machine_code,
            oee_target = @oee_target,
            version = @version,
            is_active = @is_active,
            updated_at = SYSUTCDATETIME()
        WHERE machine_id = @machine_id;

        -- เช็กว่ามีข้อมูลให้อัปเดตจริงไหม
        IF @@ROWCOUNT = 0
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50004, 'Machine not found', 1;
        END

        -- 3. ลบข้อมูล Map เก่าออกทั้งหมด
        DELETE FROM map_machine_product_group WHERE machine_id = @machine_id;

        -- 4. Insert ข้อมูล Map ใหม่เข้าไป (เหมือนตอน Create)
        IF ISJSON(@product_group_json) > 0
        BEGIN
            INSERT INTO map_machine_product_group (machine_id, product_group_id)
            SELECT 
                @machine_id,
                product_group_id
            FROM OPENJSON(@product_group_json)
            WITH (
                product_group_id INT '$.product_group_id'
            );
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure สำหรับลบ (DELETE) --
CREATE PROCEDURE [dbo].[sp_DeleteMachineWithMapping]
    @machine_id INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. ลบตาราง Map ก่อน (เพื่อไม่ให้ติด Constraint)
        DELETE FROM map_machine_product_group WHERE machine_id = @machine_id;

        -- 2. ลบตารางหลัก
        DELETE FROM dim_machine WHERE machine_id = @machine_id;

        -- เช็กว่าลบสำเร็จไหม
        IF @@ROWCOUNT = 0
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50004, 'Machine not found', 1;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO