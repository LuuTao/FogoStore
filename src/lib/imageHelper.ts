UPDATE "ProductVariant"
SET images = array_replace(images, 'http://localhost:5000', 'https://fogo-store-api.onrender.com');

-- Nếu images lưu dạng mảng text hoặc chuỗi JSON:
UPDATE "ProductVariant"
SET images = array(
  SELECT replace(elem, 'http://localhost:5000', 'https://fogo-store-api.onrender.com')
  FROM unnest(images) elem
);