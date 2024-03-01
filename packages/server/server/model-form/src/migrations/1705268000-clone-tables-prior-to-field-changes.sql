-- Clone to have a backup in case of migration problems
CREATE TABLE IF NOT EXISTS manuscripts_pre3 AS SELECT * FROM manuscripts;
CREATE TABLE IF NOT EXISTS reviews_pre3 AS SELECT * FROM reviews;
CREATE TABLE IF NOT EXISTS forms_pre3 AS SELECT * FROM forms;
CREATE TABLE IF NOT EXISTS configs_pre3 AS SELECT * FROM configs;
