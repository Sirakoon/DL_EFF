/* ═══════════════════════════════════════════════════════════════════
   024_add_product_people.sql
   ─────────────────────────────────────────────────────────────────
   เพิ่มคอลัมน์ product_people ให้ dim_product (จำนวนคนสำหรับ product
   ที่ใช้ Manual machine — กรอกจากฟอร์ม Product Management เมื่อเลือก
   Product Group id 7) แล้วให้ productController อ่าน/เขียนคอลัมน์นี้
═══════════════════════════════════════════════════════════════════ */

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dim_product') AND name = 'product_people'
)
BEGIN
    ALTER TABLE dim_product ADD product_people DECIMAL(10, 2) NULL;
    PRINT 'Added column dim_product.product_people';
END
GO
