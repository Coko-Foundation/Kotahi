-- Clone to create a backup in case of migration problems
CREATE TABLE IF NOT EXISTS manuscripts_pre3 AS SELECT * FROM manuscripts;
