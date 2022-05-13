-- -------------------------------------------------------------
-- -------------------------------------------------------------
-- -------------------------------------------------------------
CREATE SCHEMA pgboss;


ALTER SCHEMA pgboss OWNER TO kotahidev;


DROP TABLE IF EXISTS "pgboss"."archive";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

DROP TYPE IF EXISTS "pgboss"."job_state";
CREATE TYPE "pgboss"."job_state" AS ENUM ('created', 'retry', 'active', 'completed', 'expired', 'cancelled', 'failed');

-- Table Definition
CREATE TABLE "pgboss"."archive" (
    "id" uuid NOT NULL,
    "name" text NOT NULL,
    "priority" int4 NOT NULL,
    "data" jsonb,
    "state" "pgboss"."job_state" NOT NULL,
    "retrylimit" int4 NOT NULL,
    "retrycount" int4 NOT NULL,
    "retrydelay" int4 NOT NULL,
    "retrybackoff" bool NOT NULL,
    "startafter" timestamptz NOT NULL,
    "startedon" timestamptz,
    "singletonkey" text,
    "singletonon" timestamp,
    "expirein" interval NOT NULL,
    "createdon" timestamptz NOT NULL,
    "completedon" timestamptz,
    "keepuntil" timestamptz NOT NULL,
    "on_complete" bool NOT NULL,
    "archivedon" timestamptz NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS "pgboss"."job";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

DROP TYPE IF EXISTS "pgboss"."job_state" CASCADE;
CREATE TYPE "pgboss"."job_state" AS ENUM ('created', 'retry', 'active', 'completed', 'expired', 'cancelled', 'failed');

-- Table Definition
CREATE TABLE "pgboss"."job" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "priority" int4 NOT NULL DEFAULT 0,
    "data" jsonb,
    "state" "pgboss"."job_state" NOT NULL DEFAULT 'created'::pgboss.job_state,
    "retrylimit" int4 NOT NULL DEFAULT 0,
    "retrycount" int4 NOT NULL DEFAULT 0,
    "retrydelay" int4 NOT NULL DEFAULT 0,
    "retrybackoff" bool NOT NULL DEFAULT false,
    "startafter" timestamptz NOT NULL DEFAULT now(),
    "startedon" timestamptz,
    "singletonkey" text,
    "singletonon" timestamp,
    "expirein" interval NOT NULL DEFAULT '00:15:00'::interval,
    "createdon" timestamptz NOT NULL DEFAULT now(),
    "completedon" timestamptz,
    "keepuntil" timestamptz NOT NULL DEFAULT (now() + '30 days'::interval),
    "on_complete" bool NOT NULL DEFAULT true,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "pgboss"."schedule";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "pgboss"."schedule" (
    "name" text NOT NULL,
    "cron" text NOT NULL,
    "timezone" text,
    "data" jsonb,
    "options" jsonb,
    "created_on" timestamptz NOT NULL DEFAULT now(),
    "updated_on" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("name")
);

DROP TABLE IF EXISTS "pgboss"."version";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "pgboss"."version" (
    "version" int4 NOT NULL,
    "maintained_on" timestamptz,
    "cron_on" timestamptz,
    PRIMARY KEY ("version")
);

INSERT INTO "pgboss"."job" ("id", "name", "priority", "data", "state", "retrylimit", "retrycount", "retrydelay", "retrybackoff", "startafter", "startedon", "singletonkey", "singletonon", "expirein", "createdon", "completedon", "keepuntil", "on_complete") VALUES
('21fc8400-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:39:01.866229+00', '2022-05-12 14:39:04.865698+00', NULL, '2022-05-12 14:39:00', '00:15:00', '2022-05-12 14:38:04.866229+00', '2022-05-12 14:39:04.922812+00', '2022-05-12 14:40:01.866229+00', 'f'),
('3022a5a0-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-12 14:40:28.604631+00', '2022-05-12 14:41:28.559148+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-12 14:38:28.604631+00', '2022-05-12 14:41:28.581475+00', '2022-05-12 14:48:28.604631+00', 'f'),
('45c6a7d0-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:40:01.915854+00', '2022-05-12 14:40:04.910113+00', NULL, '2022-05-12 14:40:00', '00:15:00', '2022-05-12 14:39:04.915854+00', '2022-05-12 14:40:04.941333+00', '2022-05-12 14:41:01.915854+00', 'f'),
('5987aea0-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-12 14:32:28.564252+00', '2022-05-12 14:32:28.588767+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-12 14:32:28.564252+00', '2022-05-12 14:32:28.658495+00', '2022-05-12 14:40:28.564252+00', 'f'),
('59906130-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:32:28.628936+00', '2022-05-12 14:32:32.615906+00', NULL, '2022-05-12 14:32:00', '00:15:00', '2022-05-12 14:32:28.628936+00', '2022-05-12 14:32:32.650519+00', '2022-05-12 14:33:28.628936+00', 'f'),
('59987780-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-12 14:34:28.667634+00', '2022-05-12 14:35:28.582074+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-12 14:32:28.667634+00', '2022-05-12 14:35:28.603615+00', '2022-05-12 14:42:28.667634+00', 'f'),
('5bf77620-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:33:01.64357+00', '2022-05-12 14:33:04.637911+00', NULL, '2022-05-12 14:33:00', '00:15:00', '2022-05-12 14:32:32.64357+00', '2022-05-12 14:33:04.65746+00', '2022-05-12 14:34:01.64357+00', 'f'),
('698de570-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:41:01.937359+00', '2022-05-12 14:41:04.939026+00', NULL, '2022-05-12 14:41:00', '00:15:00', '2022-05-12 14:40:04.937359+00', '2022-05-12 14:41:05.005157+00', '2022-05-12 14:42:01.937359+00', 'f'),
('6f0bf3d0-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:34:01.654628+00', '2022-05-12 14:34:04.6958+00', NULL, '2022-05-12 14:34:00', '00:15:00', '2022-05-12 14:33:04.654628+00', '2022-05-12 14:34:04.71831+00', '2022-05-12 14:35:01.654628+00', 'f'),
('8d579410-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:42:02.000096+00', '2022-05-12 14:42:04.987794+00', NULL, '2022-05-12 14:42:00', '00:15:00', '2022-05-12 14:41:05.000096+00', '2022-05-12 14:42:05.026743+00', '2022-05-12 14:43:02.000096+00', 'f'),
('92d86190-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:35:01.715062+00', '2022-05-12 14:35:04.741345+00', NULL, '2022-05-12 14:35:00', '00:15:00', '2022-05-12 14:34:04.715062+00', '2022-05-12 14:35:04.769652+00', '2022-05-12 14:36:01.715062+00', 'f'),
('9b6a06a0-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__maintenance', 0, NULL, 'created', 0, 0, 0, 'f', '2022-05-12 14:43:28.589032+00', NULL, '__pgboss__maintenance', NULL, '00:15:00', '2022-05-12 14:41:28.589032+00', NULL, '2022-05-12 14:51:28.589032+00', 'f'),
('b1200a30-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:43:01.023813+00', '2022-05-12 14:43:01.031669+00', NULL, '2022-05-12 14:43:00', '00:15:00', '2022-05-12 14:42:05.023813+00', '2022-05-12 14:43:01.051966+00', '2022-05-12 14:44:01.023813+00', 'f'),
('b6a348b0-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:36:01.765518+00', '2022-05-12 14:36:04.750573+00', NULL, '2022-05-12 14:36:00', '00:15:00', '2022-05-12 14:35:04.765518+00', '2022-05-12 14:36:04.786826+00', '2022-05-12 14:37:01.765518+00', 'f'),
('c4d996f0-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-12 14:37:28.609193+00', '2022-05-12 14:38:28.551536+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-12 14:35:28.609193+00', '2022-05-12 14:38:28.599411+00', '2022-05-12 14:45:28.609193+00', 'f'),
('d2867470-d201-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'created', 2, 0, 0, 'f', '2022-05-12 14:44:01.049397+00', NULL, NULL, '2022-05-12 14:44:00', '00:15:00', '2022-05-12 14:43:01.049397+00', NULL, '2022-05-12 14:45:01.049397+00', 'f'),
('da686370-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:37:01.77781+00', '2022-05-12 14:37:04.802681+00', NULL, '2022-05-12 14:37:00', '00:15:00', '2022-05-12 14:36:04.77781+00', '2022-05-12 14:37:04.839352+00', '2022-05-12 14:38:01.77781+00', 'f'),
('fe348310-d200-11ec-9e5f-13233ec5b4f3', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-12 14:38:01.835399+00', '2022-05-12 14:38:04.83417+00', NULL, '2022-05-12 14:38:00', '00:15:00', '2022-05-12 14:37:04.835399+00', '2022-05-12 14:38:04.868603+00', '2022-05-12 14:39:01.835399+00', 'f');

INSERT INTO "pgboss"."version" ("version", "maintained_on", "cron_on") VALUES
(16, '2022-05-12 14:41:28.576385+00', '2022-05-12 14:43:01.038193+00');


-- -------------------------------------------------------------
-- -------------------------------------------------------------
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."aliases";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."aliases" (
    "id" uuid NOT NULL,
    "created" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "name" text,
    "email" text,
    "aff" text,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."article_import_history";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."article_import_history" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "date" timestamptz,
    "source_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."article_import_sources";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."article_import_sources" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "server" text NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."channel_members";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."channel_members" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "user_id" uuid NOT NULL,
    "channel_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."channels";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."channels" (
    "id" uuid NOT NULL,
    "manuscript_id" uuid,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "topic" text,
    "type" text,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."entities";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."entities" (
    "id" uuid NOT NULL,
    "data" jsonb,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."files";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."files" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "type" text NOT NULL,
    "name" text NOT NULL,
    "stored_objects" jsonb NOT NULL,
    "tags" jsonb DEFAULT '[]'::jsonb,
    "reference_id" uuid,
    "object_id" uuid,
    "alt" text,
    "upload_status" text,
    "caption" text,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."files_old";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."files_old" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "object_type" text,
    "object_id" uuid,
    "label" text,
    "file_type" text NOT NULL,
    "filename" text NOT NULL,
    "url" text NOT NULL,
    "mime_type" text,
    "size" int4 NOT NULL,
    "type" text NOT NULL,
    "manuscript_id" uuid NOT NULL,
    "review_comment_id" uuid
);

DROP TABLE IF EXISTS "public"."forms";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."forms" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "type" text NOT NULL DEFAULT 'form'::text,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "purpose" text NOT NULL,
    "structure" jsonb NOT NULL,
    "category" text,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."identities";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."identities" (
    "id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "type" text NOT NULL,
    "identifier" text,
    "name" text,
    "aff" text,
    "oauth" jsonb,
    "is_default" bool,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."manuscripts";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS manuscripts_short_id_seq;

-- Table Definition
CREATE TABLE "public"."manuscripts" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "parent_id" uuid,
    "submitter_id" uuid,
    "status" text,
    "decision" text,
    "authors" jsonb,
    "suggestions" jsonb,
    "meta" jsonb,
    "submission" jsonb,
    "published" timestamptz,
    "type" text NOT NULL,
    "evaluations_hypothesis_map" jsonb,
    "is_imported" bool,
    "import_source" uuid,
    "import_source_server" text,
    "short_id" int4 NOT NULL DEFAULT nextval('manuscripts_short_id_seq'::regclass),
    "submitted_date" timestamptz,
    "is_hidden" bool,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."messages";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."messages" (
    "id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "channel_id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "content" text,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."migrations";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."migrations" (
    "id" text NOT NULL,
    "run_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."review_comments";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."review_comments" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "review_id" uuid,
    "user_id" uuid,
    "content" text,
    "comment_type" text,
    "type" text,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."reviews";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."reviews" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "recommendation" text,
    "is_decision" bool DEFAULT false,
    "user_id" uuid,
    "manuscript_id" uuid,
    "type" text NOT NULL,
    "is_hidden_from_author" bool,
    "is_hidden_reviewer_name" bool,
    "can_be_published_publicly" bool,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."team_members";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."team_members" (
    "id" uuid NOT NULL,
    "created" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "status" varchar(255),
    "team_id" uuid,
    "user_id" uuid,
    "alias_id" uuid,
    "is_shared" bool,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."teams";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."teams" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "name" text,
    "role" text NOT NULL,
    "members" jsonb,
    "owners" jsonb,
    "global" bool,
    "type" text NOT NULL,
    "manuscript_id" uuid,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."users";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL,
    "created" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" timestamptz,
    "admin" bool,
    "email" text,
    "username" text,
    "password_hash" text,
    "teams" jsonb,
    "password_reset_token" text,
    "password_reset_timestamp" timestamptz,
    "type" text NOT NULL,
    "profile_picture" text,
    "online" bool,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."channels" ("id", "manuscript_id", "created", "updated", "topic", "type") VALUES
('127d94f8-f352-4f37-b252-fd4b4808f3da', '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8', '2022-05-12 14:35:41.421+00', '2022-05-12 14:35:41.421+00', 'Editorial discussion', 'editorial'),
('9fd7774c-11e5-4802-804c-ab64aefd5080', NULL, '2022-05-12 14:32:14.085174+00', NULL, 'System-wide discussion', 'editorial'),
('cb81d246-6d8d-40fe-89a9-90f70b2e4ea3', '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8', '2022-05-12 14:35:41.421+00', '2022-05-12 14:35:41.421+00', 'Manuscript discussion', 'all');

INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('82fd52d5-4858-470f-bc63-485d289cd9de', '2022-05-12 14:33:33.904+00', '2022-05-12 14:33:33.904+00', 'file', 'sample pdf.pdf', '[{"id": "7034363d-ee07-4a52-96a7-ceec06f003ad", "key": "3771b571ea93.pdf", "size": 3028, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '9cc6104d-4a3c-445c-90f8-c739dc03806f', NULL, NULL, NULL),
('b75303bb-290c-4c28-a1ed-e93362f80d8b', '2022-05-12 14:35:41.421+00', '2022-05-12 14:35:41.421+00', 'file', 'sample.pdf', '[{"id": "c57c0ccb-6937-49ed-bacd-536943bf1846", "key": "ba44b9825e29.pdf", "size": 3028, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8', NULL, NULL, NULL);

INSERT INTO "public"."forms" ("id", "type", "created", "updated", "purpose", "structure", "category") VALUES
('021db3f7-0a14-4537-bdfe-0dbd9beb5362', 'Form', '2022-05-12 14:32:46.55+00', '2022-05-12 14:32:46.55+00', 'submit', '{"name": "Research Object Submission Form", "children": [{"id": "fa0c39ca-0486-4e29-ba24-f86f7d375c3f", "name": "submission.objectType", "title": "Type of Research Object", "options": [{"id": "df5fc212-b055-4cba-9d0e-e85222e3d4f2", "label": "Dataset", "value": "dataset"}, {"id": "ef2ddada-105a-412e-8d7f-56b1df44c02f", "label": "Software", "value": "software"}, {"id": "0fafbfc3-6797-46e3-aff4-3fd4f16261b1", "label": "Figure", "value": "figure"}, {"id": "5117a7c6-2fcf-414b-ac60-47f8d93ccfef", "label": "Notebook", "value": "notebook"}, {"id": "32121b38-b855-465e-b039-b5100177698b", "label": "Research article ", "value": "Research article "}], "component": "Select"}, {"id": "47fd802f-ed30-460d-9617-c8a9b9025e95", "name": "meta.title", "title": "Title", "component": "TextField", "placeholder": "Enter the manuscript''s title", "includeInReviewerPreview": "true"}, {"id": "d76e5b3c-eeaa-4168-9318-95d43a31e3e4", "name": "submission.authorNames", "title": "Author names", "component": "AuthorsInput", "includeInReviewerPreview": "true"}, {"id": "62ca72ad-04b0-41fc-85d1-415469d7e895", "name": "submission.topics", "title": "Topics", "options": [{"id": "2323b6d1-8223-45e8-a0fc-1044a1e39d37", "label": "Neuropsychology ", "value": "Neuropsychology "}, {"id": "ac7cafca-c5c8-4940-9f2f-014d18660e90", "label": "Topic 2", "value": "Topic 2"}, {"id": "93c88240-9c2b-4c23-9301-23ed94ef61d7", "label": "Topic 3", "value": "Topic 3"}], "component": "CheckboxGroup", "includeInReviewerPreview": "true"}, {"id": "1c2e9325-3fa8-41f3-8607-180eb8a25aa3", "name": "submission.DOI", "title": "DOI", "component": "TextField", "placeholder": "Enter the manuscript''s DOI", "doiValidation": "true", "includeInReviewerPreview": "true"}, {"id": "d80b2c88-6144-4003-b671-63990b9b2793", "name": "submission.abstract", "title": "Abstract", "component": "AbstractEditor", "description": "<p>Please provide a short summary of your submission</p>", "placeholder": "Input your abstract...", "shortDescription": "Abstract", "includeInReviewerPreview": "true"}, {"id": "7f5aa395-3486-4067-b636-ae204d472c16", "name": "submission.AuthorCorrespondence", "title": "Author correspondence ", "component": "TextField"}, {"id": "347dc171-f008-45ac-8433-ca0711bf213c", "name": "submission.cover", "title": "Cover letter", "component": "AbstractEditor", "description": "<p>Cover letter describing submission, relevant implications, and timely information to consider</p>", "placeholder": "Enter your cover letter"}, {"id": "14b8da7d-5924-4098-8d1f-e528c7c440b9", "name": "submission.EditorsEvaluation", "title": "Editors evaluation ", "component": "TextField"}, {"id": "bf2f9b4a-377b-4303-8f51-70d836eb1456", "name": "submission.datacode", "title": "Data and Code availability statements", "component": "AbstractEditor", "placeholder": "Enter your data and code availability statement"}, {"id": "fa5e5b75-4b6f-4a2d-9113-c2b4db73ef8a", "name": "submission.competingInterests", "title": "Competing interests", "component": "AbstractEditor", "includeInReviewerPreview": "true"}, {"id": "6bfdc237-814d-4af8-b0f0-064099d679ba", "name": "submission.Funding", "title": "Funding", "component": "TextField"}, {"id": "b769b4d5-f9b3-48d3-a6d5-77bb6a9e95b0", "name": "fileName", "title": "Upload supplementary materials", "component": "SupplementaryFiles"}, {"id": "b127ecb1-4862-4662-a958-3266eb284353", "name": "submission.authorContributions", "title": "Author contributions ", "component": "TextField"}, {"id": "6342cff7-c57a-4fd9-b91d-c4cf77b4c309", "name": "submission.DecisionLetter", "title": "Decision letter and author response", "component": "AbstractEditor"}, {"id": "e8af0c63-e46f-46a8-bc90-5023fe50a541", "name": "submission.references", "title": "References ", "component": "AbstractEditor", "includeInReviewerPreview": "true"}, {"id": "ebe75cec-0ba8-4f00-9024-20e77ed94f1c", "name": "submission.reviewingEditor", "title": "Reviewing editors name ", "component": "AuthorsInput"}, {"id": "6871680a-2278-40b3-80c6-7de06f21aafb", "name": "submission.copyrightHolder", "title": "Copyright holder", "component": "TextField", "description": "<p class=\"paragraph\">e.g. British Medical Journal </p>"}, {"id": "1e9ff636-f850-4d20-b079-36af49fa4ad1", "name": "submission.copyrightStatement", "title": "Copyright statement ", "component": "TextField", "description": "<p class=\"paragraph\">e.g. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.</p>"}, {"id": "7617c919-4413-4306-b709-ef78c3110c3f", "name": "submission.copyrightYear", "title": "Copyright year ", "component": "TextField", "description": "<p class=\"paragraph\">e.g. 2022</p>"}, {"id": "6deaacc6-759a-4a68-b494-c38c664bb665", "name": "submission.dateReceived", "title": "Date received ", "component": "TextField", "description": "<p class=\"paragraph\">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>"}, {"id": "8b858adc-5f65-4385-9f79-5c5af1f67bd5", "name": "submission.dateAccepted", "title": "Date accepted", "component": "TextField", "description": "<p class=\"paragraph\">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>"}, {"id": "f6e46890-4b96-4c90-ab48-b4fc5abb9b40", "name": "submission.datePublished", "title": "Date published ", "component": "TextField", "description": "<p class=\"paragraph\">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>"}], "haspopup": "true", "popuptitle": "By submitting the manuscript, you agree to the following statements.", "description": "<p>Please fill out the form below to complete your submission.</p>", "popupdescription": "<p>The corresponding author confirms that all co-authors are included, and that everyone listed as a co-author agrees to that role and all the following requirements and acknowledgements:</p><p></p><p>The submission represents original work and sources are given proper attribution. The journal employs CrossCheck to compare submissions against a large and growing database of published scholarly content. If in the judgment of a senior editor a submission is genuinely suspected of plagiarism, it will be returned to the author(s) with a request for explanation.</p><p></p><p>The research was conducted in accordance with ethical principles.</p><p></p><p>There is a Data Accessibility Statement, containing information about the location of open data and materials, in the manuscript.</p><p></p><p>A conflict of interest statement is present in the manuscript, even if to state no conflicts of interest.</p>"}', 'submission'),
('2b977b9f-a477-4204-9fde-69acd4fc8390', 'Form', '2022-05-12 14:32:46.557+00', '2022-05-12 14:32:46.557+00', 'review', '{"name": "Review Form", "children": [{"id": "78a82745-2aa7-4725-b42d-d54809dd7926", "name": "meta.abstract", "title": "Comments to the Author", "component": "AbstractEditor", "description": "<p class=\"paragraph\">Text field for comments to the author.</p>", "placeholder": "Enter your review..."}, {"id": "19893e6e-aca6-40ec-9a0a-34c490ba22ac", "name": "authorFileName", "title": "authorFiles", "component": "SupplementaryFiles", "description": "<p class=\"paragraph\">Drag and drop your files here</p>"}, {"id": "e169b0fa-377a-43a4-9365-ce7e9b1f8f38", "name": "meta.abstract", "title": "Confidential comments to editor (optional)", "component": "AbstractEditor", "description": "<p class=\"paragraph\">Confidential note for the editor</p>", "placeholder": "Enter a confidential note to the editor (optional)…", "hideFromAuthors": "true"}, {"id": "78a94bf5-05c9-411d-bc97-5f84d2f686a2", "name": "fileName", "title": "Files", "component": "SupplementaryFiles", "description": "<p class=\"paragraph\">Drag and drop your files here</p>"}, {"id": "5705067e-3ee0-41ae-a953-87167b171c3f", "name": "submission.status", "title": "Decision Status", "inline": "false", "options": [{"id": "1ba634b0-82f9-481c-a135-77c6d3e28fec", "label": "Accept", "value": "accept", "labelColor": "#00ff7b"}, {"id": "459469e8-12ca-426c-9e05-581a14fe7c03", "label": "Revise", "value": "revise", "labelColor": "#daea61"}, {"id": "e38b9433-4e93-4e1d-b4a3-5a14f7ac3fc6", "label": "Reject", "value": "reject", "labelColor": "#e64e3d"}], "validate": [{"id": "76c87808-32cb-41cb-9f72-5254f610015f", "label": "Required", "value": "required"}], "component": "RadioGroup", "description": "<p class=\"paragraph\">Status of decesion </p>"}], "haspopup": "false", "description": "<p class=\"paragraph\">Form for Reviews</p>"}', 'review'),
('cb7fb658-b618-424c-9045-90f796f19671', 'Form', '2022-05-12 14:32:46.559+00', '2022-05-12 14:32:46.559+00', 'decision', '{"name": "Decision Form", "children": [{"id": "74cf4404-3d04-46cb-a3da-e7d70d47db0a", "name": "meta.abstract", "title": "Decision", "component": "AbstractEditor", "description": "<p class=\"paragraph\">Text field for decisions.</p>", "placeholder": "Write/paste your decision letter here, or upload it using the upload button on the right."}, {"id": "78a94bf5-05c9-411d-bc97-5f84d2f686a2", "name": "fileName", "title": "Files", "component": "SupplementaryFiles", "description": "<p class=\"paragraph\">Drag and drop your files here</p>"}, {"id": "5705067e-3ee0-41ae-a953-87167b171c3f", "name": "submission.status", "title": "Decision Status", "inline": "false", "options": [{"id": "1ba634b0-82f9-481c-a135-77c6d3e28fec", "label": "Accept", "value": "accept", "labelColor": "#00ff7b"}, {"id": "459469e8-12ca-426c-9e05-581a14fe7c03", "label": "Revise", "value": "revise", "labelColor": "#daea61"}, {"id": "e38b9433-4e93-4e1d-b4a3-5a14f7ac3fc6", "label": "Reject", "value": "reject", "labelColor": "#e64e3d"}], "validate": [{"id": "76c87808-32cb-41cb-9f72-5254f610015f", "label": "Required", "value": "required"}], "component": "RadioGroup", "description": "<p class=\"paragraph\">Status of decesion </p>"}], "haspopup": "false"}', 'decision');

INSERT INTO "public"."identities" ("id", "user_id", "created", "updated", "type", "identifier", "name", "aff", "oauth", "is_default") VALUES
('1269accc-3dd8-43fa-a432-84109c9d4812', '447c2ca9-a2fc-4c4c-a4cd-65917eca882d', '2022-05-12 14:33:18.309+00', '2022-05-12 14:33:18.309+00', 'orcid', '0000-0003-3483-9210', 'Snehil ', '', '{"accessToken": "344a4a48-519f-4f0c-a080-318f7a0a5804", "refreshToken": "6a071c46-2084-4691-8a6a-3281dc553335"}', 't'),
('89d8380a-a328-4351-bd14-45fd1a087c2b', 'd2e787b5-fa7b-49ec-aa07-f76f6414892d', '2022-05-12 14:39:29.657+00', '2022-05-12 14:39:29.657+00', 'orcid', '0000-0002-1553-9899', 'Shubham  Tiwari', '', '{"accessToken": "d51ab2fb-1cd4-4a3a-a337-56b3cf4109d9", "refreshToken": "1c83d72b-d878-43de-a8cd-a7133bfe92b3"}', 't'),
('d7a3ddec-2b9a-4a1c-9ca0-06c11bf85e58', '2b4a1e65-9211-4579-a967-4dfc1f5980d0', '2022-05-12 14:35:10.511+00', '2022-05-12 14:35:10.511+00', 'orcid', '0000-0002-1851-1103', 'Coloredcow ', '', '{"accessToken": "a328b0aa-1cd5-49c7-98b3-ccdd190e1b44", "refreshToken": "5b0c5228-ab7a-414b-a1de-74f9ff072f91"}', 't');

INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "suggestions", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "is_hidden") VALUES
('8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8', '2022-05-12 14:35:41.418+00', '2022-05-12 14:40:41.371+00', NULL, '2b4a1e65-9211-4579-a967-4dfc1f5980d0', 'accepted', 'accepted', NULL, NULL, '{"notes": [{"content": "", "notesType": "fundingAcknowledgement"}, {"content": "", "notesType": "specialInstructions"}], "title": "sample pdf for review"}', '{"DOI": "", "cover": "", "title": "", "topics": [], "Funding": "", "abstract": "", "datacode": "", "objectType": "", "references": "", "authorNames": "", "dateAccepted": "", "dateReceived": "", "copyrightYear": "", "datePublished": "", "DecisionLetter": "", "copyrightHolder": "", "reviewingEditor": "", "EditorsEvaluation": "", "competingInterests": "", "copyrightStatement": "", "authorContributions": "", "AuthorCorrespondence": ""}', '2022-05-12 14:40:41.252+00', 'Manuscript', NULL, NULL, NULL, NULL, 2, '2022-05-12 14:36:01.281+00', NULL);

INSERT INTO "public"."migrations" ("id", "run_at") VALUES
('1524494862-entities.sql', '2022-05-12 14:32:13.732516+00'),
('1542276313-initial-user-migration.sql', '2022-05-12 14:32:13.740998+00'),
('1560771823-add-unique-constraints-to-users.sql', '2022-05-12 14:32:13.748061+00'),
('1580908536-add-identities.sql', '2022-05-12 14:32:13.761064+00'),
('1581371297-migrate-users-to-identities.js', '2022-05-12 14:32:13.778029+00'),
('1581450834-manuscript.sql', '2022-05-12 14:32:13.793165+00'),
('1582930582-drop-fragments-and-collections.js', '2022-05-12 14:32:13.800062+00'),
('1585323910-add-channels.sql', '2022-05-12 14:32:13.815158+00'),
('1585344885-add-messages.sql', '2022-05-12 14:32:13.826561+00'),
('1585513226-add-profile-pic.sql', '2022-05-12 14:32:13.83213+00'),
('1592915682-change-identities-constraint.sql', '2022-05-12 14:32:13.841281+00'),
('1596830547-review.sql', '2022-05-12 14:32:13.857336+00'),
('1596830548-add-review-comments.sql', '2022-05-12 14:32:13.865346+00'),
('1596830548-initial-team-migration.sql', '2022-05-12 14:32:13.894255+00'),
('1596838897-files.sql', '2022-05-12 14:32:13.905578+00'),
('1616115191-add-first-login.sql', '2022-05-12 14:32:13.910236+00'),
('1616157398-remove-first-login-column.sql', '2022-05-12 14:32:13.914083+00'),
('1618365033-form.sql', '2022-05-12 14:32:13.931567+00'),
('1619180836-add_hypothesis_id.sql', '2022-05-12 14:32:13.937048+00'),
('1621499368-remove_hypothesis_id_column.sql', '2022-05-12 14:32:13.940508+00'),
('1621508277-evaluations_to_hypothesis_map.sql', '2022-05-12 14:32:13.944918+00'),
('1623224645-article-import-sources.sql', '2022-05-12 14:32:13.956027+00'),
('1623224655-article-import-history.sql', '2022-05-12 14:32:13.963083+00'),
('1623225900-add-import-columns.sql', '2022-05-12 14:32:13.967979+00'),
('1625223822-is-shared-team-member.sql', '2022-05-12 14:32:13.972319+00'),
('1625489571-add-is-hidden-from-author.sql', '2022-05-12 14:32:13.976821+00'),
('1625565801-add-is-hidden-reviewer-name.sql', '2022-05-12 14:32:13.980861+00'),
('1625653490-add-column-can-be-published-publicly.sql', '2022-05-12 14:32:13.984857+00'),
('1626669203-add-short_id.sql', '2022-05-12 14:32:14.015586+00'),
('1626669349-add_submitted_date.sql', '2022-05-12 14:32:14.019831+00'),
('1627646181-add-is-hidden-column.sql', '2022-05-12 14:32:14.02404+00'),
('1629434722-set_shortids_to_parent_value.sql', '2022-05-12 14:32:14.027724+00'),
('1629757873-index-created-and-published-dates.sql', '2022-05-12 14:32:14.03757+00'),
('1634271132-non-null-manuscript_id-and-other-fields.sql', '2022-05-12 14:32:14.042196+00'),
('1635472928-prefix_urls.sql', '2022-05-12 14:32:14.049368+00'),
('1638161107-prefix_urls_uploads.sql', '2022-05-12 14:32:14.052338+00'),
('1638227484-rename_existing_files_to_files_old.sql', '2022-05-12 14:32:14.060055+00'),
('1638256284-remove_constraint_files_pkey_in_files_old.sql', '2022-05-12 14:32:14.06698+00'),
('1638357830-init-file.js', '2022-05-12 14:32:14.076988+00'),
('1639635803224-update-username.sql', '2022-05-12 14:32:14.082274+00'),
('1644381481-add-system-wide-discussion.sql', '2022-05-12 14:32:14.086154+00'),
('1648006297-add-category.sql', '2022-05-12 14:32:14.089579+00'),
('1649295531-migrate-files-old-to-files.js', '2022-05-12 14:32:14.100046+00'),
('1649401731-convert-inline-base64-in-source-to-inline-file-urls.js', '2022-05-12 14:32:14.114463+00');

INSERT INTO "public"."review_comments" ("id", "created", "updated", "review_id", "user_id", "content", "comment_type", "type") VALUES
('597a902f-697f-405e-b1ed-446d66cfacd7', '2022-05-12 14:40:33.498+00', '2022-05-12 14:40:35.436+00', 'dafb6118-f9c3-480c-a947-2f34808016af', NULL, '<p class="paragraph">hey hey</p>', 'decision', 'ReviewComment');

INSERT INTO "public"."reviews" ("id", "created", "updated", "recommendation", "is_decision", "user_id", "manuscript_id", "type", "is_hidden_from_author", "is_hidden_reviewer_name", "can_be_published_publicly") VALUES
('dafb6118-f9c3-480c-a947-2f34808016af', '2022-05-12 14:40:33.49+00', '2022-05-12 14:40:37.897+00', 'accepted', 't', '447c2ca9-a2fc-4c4c-a4cd-65917eca882d', '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8', 'Review', NULL, NULL, NULL);

INSERT INTO "public"."team_members" ("id", "created", "updated", "status", "team_id", "user_id", "alias_id", "is_shared") VALUES
('0273f802-cc23-4196-a87b-42d7ef177cc2', '2022-05-12 14:35:41.425+00', '2022-05-12 14:35:41.425+00', NULL, 'f9b56422-e610-4022-90aa-eb21a01f4f44', '2b4a1e65-9211-4579-a967-4dfc1f5980d0', NULL, NULL),
('364923ba-169e-4c9b-b7d7-7f919df461c7', '2022-05-12 14:41:03.165+00', '2022-05-12 14:41:03.165+00', NULL, 'f4cdd051-bf56-4f67-b971-03fcfb817ae0', '2b4a1e65-9211-4579-a967-4dfc1f5980d0', NULL, NULL),
('ad43f03f-f69d-42d0-ab50-acebf287c521', '2022-05-12 14:41:03.176+00', '2022-05-12 14:41:03.176+00', NULL, '2ba3b671-58fa-4766-864a-212955aa3a67', '447c2ca9-a2fc-4c4c-a4cd-65917eca882d', NULL, NULL),
('e58f49a0-08e3-4c5e-8273-84b53447cb8c', '2022-05-12 14:41:03.164+00', '2022-05-12 14:41:03.164+00', NULL, '237d3c4e-84fd-4f5c-8b7e-076ca1d22bc8', 'd2e787b5-fa7b-49ec-aa07-f76f6414892d', NULL, NULL);

INSERT INTO "public"."teams" ("id", "created", "updated", "name", "role", "members", "owners", "global", "type", "manuscript_id") VALUES
('237d3c4e-84fd-4f5c-8b7e-076ca1d22bc8', '2022-05-12 14:40:22.979+00', '2022-05-12 14:40:22.979+00', 'Editor', 'editor', NULL, NULL, NULL, 'team', '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8'),
('2ba3b671-58fa-4766-864a-212955aa3a67', '2022-05-12 14:36:59.974+00', '2022-05-12 14:36:59.974+00', 'Senior Editor', 'seniorEditor', NULL, NULL, NULL, 'team', '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8'),
('f4cdd051-bf56-4f67-b971-03fcfb817ae0', '2022-05-12 14:37:50.626+00', '2022-05-12 14:37:50.626+00', 'Handling Editor', 'handlingEditor', NULL, NULL, NULL, 'team', '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8'),
('f9b56422-e610-4022-90aa-eb21a01f4f44', '2022-05-12 14:35:41.421+00', '2022-05-12 14:35:41.421+00', 'Author', 'author', NULL, NULL, NULL, 'team', '8ca11fa0-2b3c-4cbe-a688-1b0683bd6dd8');

INSERT INTO "public"."users" ("id", "created", "updated", "admin", "email", "username", "password_hash", "teams", "password_reset_token", "password_reset_timestamp", "type", "profile_picture", "online") VALUES
('2b4a1e65-9211-4579-a967-4dfc1f5980d0', '2022-05-12 14:35:10.509+00', '2022-05-12 14:41:03.178+00', NULL, 'cc.test@mailinator.com', 'Emily clay', NULL, NULL, NULL, NULL, 'user', NULL, NULL),
('447c2ca9-a2fc-4c4c-a4cd-65917eca882d', '2022-05-12 14:33:18.301+00', '2022-05-12 14:41:03.193+00', 't', 'admin@gmail.com', 'Sinead Sullivan', NULL, NULL, NULL, NULL, 'user', NULL, NULL),
('d2e787b5-fa7b-49ec-aa07-f76f6414892d', '2022-05-12 14:39:29.655+00', '2022-05-12 14:41:03.18+00', NULL, 'review@gmail.com', 'Joane Pilger', NULL, NULL, NULL, NULL, 'user', NULL, NULL);

ALTER TABLE "public"."article_import_history" ADD FOREIGN KEY ("source_id") REFERENCES "public"."article_import_sources"("id");
ALTER TABLE "public"."channel_members" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."channel_members" ADD FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id");
ALTER TABLE "public"."channels" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;
ALTER TABLE "public"."files_old" ADD FOREIGN KEY ("review_comment_id") REFERENCES "public"."review_comments"("id") ON DELETE CASCADE;
ALTER TABLE "public"."files_old" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;
ALTER TABLE "public"."identities" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."manuscripts" ADD FOREIGN KEY ("import_source") REFERENCES "public"."article_import_sources"("id");
ALTER TABLE "public"."manuscripts" ADD FOREIGN KEY ("submitter_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."messages" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."messages" ADD FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE CASCADE;
ALTER TABLE "public"."review_comments" ADD FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;
ALTER TABLE "public"."review_comments" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;
ALTER TABLE "public"."reviews" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;
ALTER TABLE "public"."team_members" ADD FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."team_members" ADD FOREIGN KEY ("alias_id") REFERENCES "public"."aliases"("id");
ALTER TABLE "public"."team_members" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."teams" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;
