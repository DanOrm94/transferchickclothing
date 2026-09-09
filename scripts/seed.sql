INSERT OR REPLACE INTO products (id, slug, name, description, base_price, category, is_active) VALUES
(1,'office-zoo-grid','Office Zoo Grid Tee','A deadpan 3×3 grid of tiny animals pretending to have important meetings.',2800,'Animals',1),
(2,'tiny-panic-grid','Tiny Panic Grid Tee','Nine tiny characters experiencing nine different levels of mild chaos.',2800,'Best Sellers',1),
(3,'garden-committee','Garden Committee Tee','A 2×2 committee of expressive little garden creatures, presented with unnecessary seriousness.',3000,'New Arrivals',1),
(4,'snack-squad','Snack Squad Tee','A 2×2 snack squad built for anyone whose best ideas happen around a packet of crisps.',2800,'Animals',1);

INSERT OR REPLACE INTO product_images (id, product_id, r2_key, alt_text, sort_order) VALUES
(1,1,'demo/office-zoo-grid.svg','Illustrated animal grid on a pale tee',0),
(2,2,'demo/tiny-panic-grid.svg','Cartoon character grid on a light blue tee',0),
(3,3,'demo/garden-committee.svg','Quirky illustrated garden creature grid on a green tee',0),
(4,4,'demo/snack-squad.svg','Funny snack-loving animal illustrations on a cream tee',0);

INSERT OR REPLACE INTO variants (id, product_id, size, color, sku, stock_quantity, stripe_price_id) VALUES
(101,1,'S','Natural','TCC-001-S',12,NULL),(102,1,'M','Natural','TCC-001-M',12,NULL),(103,1,'L','Natural','TCC-001-L',12,NULL),(104,1,'XL','Natural','TCC-001-XL',12,NULL),(105,1,'2XL','Natural','TCC-001-2XL',12,NULL),
(201,2,'S','Sky','TCC-002-S',8,NULL),(202,2,'M','Sky','TCC-002-M',8,NULL),(203,2,'L','Sky','TCC-002-L',8,NULL),(204,2,'XL','Sky','TCC-002-XL',8,NULL),(205,2,'2XL','Sky','TCC-002-2XL',8,NULL),
(301,3,'S','Sage','TCC-003-S',10,NULL),(302,3,'M','Sage','TCC-003-M',10,NULL),(303,3,'L','Sage','TCC-003-L',10,NULL),(304,3,'XL','Sage','TCC-003-XL',10,NULL),(305,3,'2XL','Sage','TCC-003-2XL',10,NULL),
(401,4,'S','Cream','TCC-004-S',7,NULL),(402,4,'M','Cream','TCC-004-M',7,NULL),(403,4,'L','Cream','TCC-004-L',7,NULL),(404,4,'XL','Cream','TCC-004-XL',7,NULL),(405,4,'2XL','Cream','TCC-004-2XL',7,NULL);
