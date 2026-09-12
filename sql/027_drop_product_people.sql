

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dim_product') AND name = 'product_people'
)
BEGIN
    ALTER TABLE dim_product DROP COLUMN product_people;
    PRINT 'Dropped column dim_product.product_people';
END
GO
