CREATE SCHEMA pgboss;


ALTER SCHEMA pgboss OWNER TO kotahidev;

DROP TABLE IF EXISTS "pgboss"."archive";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

DROP TYPE IF EXISTS "pgboss"."job_state" CASCADE;
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
('1dc684c0-d2ac-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'created', 2, 0, 0, 'f', '2022-05-13 11:03:01.742784+00', NULL, NULL, '2022-05-13 11:03:00', '00:15:00', '2022-05-13 11:02:01.742784+00', NULL, '2022-05-13 11:04:01.742784+00', 'f'),
('1ff79590-d2ac-11ec-9bad-d18b77d86d23', '__pgboss__maintenance', 0, NULL, 'created', 0, 0, 0, 'f', '2022-05-13 11:04:05.421466+00', NULL, '__pgboss__maintenance', NULL, '00:15:00', '2022-05-13 11:02:05.421466+00', NULL, '2022-05-13 11:12:05.421466+00', 'f'),
('234dbae0-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 10:56:01.52136+00', '2022-05-13 10:56:01.526769+00', NULL, '2022-05-13 10:56:00', '00:15:00', '2022-05-13 10:55:01.52136+00', '2022-05-13 10:56:01.545739+00', '2022-05-13 10:57:01.52136+00', 'f'),
('47148350-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 10:57:01.542941+00', '2022-05-13 10:57:05.532135+00', NULL, '2022-05-13 10:57:00', '00:15:00', '2022-05-13 10:56:01.542941+00', '2022-05-13 10:57:05.54742+00', '2022-05-13 10:58:01.542941+00', 'f'),
('4962e020-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-13 10:58:05.412445+00', '2022-05-13 10:59:05.359356+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-13 10:56:05.412445+00', '2022-05-13 10:59:05.395813+00', '2022-05-13 11:06:05.412445+00', 'f'),
('6d271080-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 10:58:01.41778+00', '2022-05-13 10:58:01.567218+00', NULL, '2022-05-13 10:58:00', '00:15:00', '2022-05-13 10:57:05.41778+00', '2022-05-13 10:58:01.61424+00', '2022-05-13 10:59:01.41778+00', 'f'),
('8ea4d350-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 10:59:01.609956+00', '2022-05-13 10:59:01.62243+00', NULL, '2022-05-13 10:59:00', '00:15:00', '2022-05-13 10:58:01.609956+00', '2022-05-13 10:59:01.642694+00', '2022-05-13 11:00:01.609956+00', 'f'),
('b26cfb50-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 11:00:01.639764+00', '2022-05-13 11:00:01.680066+00', NULL, '2022-05-13 11:00:00', '00:15:00', '2022-05-13 10:59:01.639764+00', '2022-05-13 11:00:01.710609+00', '2022-05-13 11:01:01.639764+00', 'f'),
('b4ab79a0-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-13 11:01:05.407349+00', '2022-05-13 11:02:05.360268+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-13 10:59:05.407349+00', '2022-05-13 11:02:05.397952+00', '2022-05-13 11:09:05.407349+00', 'f'),
('d63a7a80-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 11:01:01.706942+00', '2022-05-13 11:01:05.704131+00', NULL, '2022-05-13 11:01:00', '00:15:00', '2022-05-13 11:00:01.706942+00', '2022-05-13 11:01:05.727876+00', '2022-05-13 11:02:01.706942+00', 'f'),
('de127e70-d2aa-11ec-9bad-d18b77d86d23', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-13 10:53:05.373851+00', '2022-05-13 10:53:05.390018+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-13 10:53:05.373851+00', '2022-05-13 10:53:05.454079+00', '2022-05-13 11:01:05.373851+00', 'f'),
('de193530-d2aa-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 10:53:05.43335+00', '2022-05-13 10:53:09.419799+00', NULL, '2022-05-13 10:53:00', '00:15:00', '2022-05-13 10:53:05.43335+00', '2022-05-13 10:53:09.462332+00', '2022-05-13 10:54:05.43335+00', 'f'),
('de20d650-d2aa-11ec-9bad-d18b77d86d23', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, 'f', '2022-05-13 10:55:05.464524+00', '2022-05-13 10:56:05.387199+00', '__pgboss__maintenance', NULL, '00:15:00', '2022-05-13 10:53:05.464524+00', '2022-05-13 10:56:05.407392+00', '2022-05-13 11:03:05.464524+00', 'f'),
('e081a9b0-d2aa-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 10:54:01.454067+00', '2022-05-13 10:54:01.467355+00', NULL, '2022-05-13 10:54:00', '00:15:00', '2022-05-13 10:53:09.454067+00', '2022-05-13 10:54:01.485519+00', '2022-05-13 10:55:01.454067+00', 'f'),
('fc35af20-d2ab-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 11:02:01.429235+00', '2022-05-13 11:02:01.718187+00', NULL, '2022-05-13 11:02:00', '00:15:00', '2022-05-13 11:01:05.429235+00', '2022-05-13 11:02:01.747406+00', '2022-05-13 11:03:01.429235+00', 'f'),
('ff84cf90-d2aa-11ec-9bad-d18b77d86d23', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, 'f', '2022-05-13 10:55:01.48296+00', '2022-05-13 10:55:01.485767+00', NULL, '2022-05-13 10:55:00', '00:15:00', '2022-05-13 10:54:01.48296+00', '2022-05-13 10:55:01.528093+00', '2022-05-13 10:56:01.48296+00', 'f');

INSERT INTO "pgboss"."version" ("version", "maintained_on", "cron_on") VALUES
(16, '2022-05-13 11:02:05.394453+00', '2022-05-13 11:02:01.730816+00');

-- 
-- 
-- 



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
('79b1d3e6-4991-49f9-a248-aba8d94771bc', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', '2022-05-13 10:56:32.656+00', '2022-05-13 10:56:32.656+00', 'Manuscript discussion', 'all'),
('9fd7774c-11e5-4802-804c-ab64aefd5080', NULL, '2022-05-13 10:52:50.410655+00', NULL, 'System-wide discussion', 'editorial'),
('be647d5e-8f32-4af2-9d0c-f7976958fa27', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', '2022-05-13 10:56:32.656+00', '2022-05-13 10:56:32.656+00', 'Editorial discussion', 'editorial');

INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('4aded767-78f0-4bd1-857e-1569f2f7b265', '2022-05-13 10:56:32.657+00', '2022-05-13 10:56:32.657+00', 'file', 'sample pdf.pdf', '[{"id": "42dbd180-a78b-4b14-9e7e-74ac6838dba1", "key": "52ce9cf9c7a8.pdf", "size": 3028, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', NULL, NULL, NULL);

INSERT INTO "public"."forms" ("id", "type", "created", "updated", "purpose", "structure", "category") VALUES
('522b8066-e02e-4cd3-90e7-3b4985052381', 'Form', '2022-05-13 10:53:22.715+00', '2022-05-13 10:53:22.715+00', 'review', '{"name": "Review Form", "children": [{"id": "78a82745-2aa7-4725-b42d-d54809dd7926", "name": "meta.abstract", "title": "Comments to the Author", "component": "AbstractEditor", "description": "<p class=\"paragraph\">Text field for comments to the author.</p>", "placeholder": "Enter your review..."}, {"id": "19893e6e-aca6-40ec-9a0a-34c490ba22ac", "name": "authorFileName", "title": "authorFiles", "component": "SupplementaryFiles", "description": "<p class=\"paragraph\">Drag and drop your files here</p>"}, {"id": "e169b0fa-377a-43a4-9365-ce7e9b1f8f38", "name": "meta.abstract", "title": "Confidential comments to editor (optional)", "component": "AbstractEditor", "description": "<p class=\"paragraph\">Confidential note for the editor</p>", "placeholder": "Enter a confidential note to the editor (optional)…", "hideFromAuthors": "true"}, {"id": "78a94bf5-05c9-411d-bc97-5f84d2f686a2", "name": "fileName", "title": "Files", "component": "SupplementaryFiles", "description": "<p class=\"paragraph\">Drag and drop your files here</p>"}, {"id": "5705067e-3ee0-41ae-a953-87167b171c3f", "name": "submission.status", "title": "Decision Status", "inline": "false", "options": [{"id": "1ba634b0-82f9-481c-a135-77c6d3e28fec", "label": "Accept", "value": "accept", "labelColor": "#00ff7b"}, {"id": "459469e8-12ca-426c-9e05-581a14fe7c03", "label": "Revise", "value": "revise", "labelColor": "#daea61"}, {"id": "e38b9433-4e93-4e1d-b4a3-5a14f7ac3fc6", "label": "Reject", "value": "reject", "labelColor": "#e64e3d"}], "validate": [{"id": "76c87808-32cb-41cb-9f72-5254f610015f", "label": "Required", "value": "required"}], "component": "RadioGroup", "description": "<p class=\"paragraph\">Status of decesion </p>"}], "haspopup": "false", "description": "<p class=\"paragraph\">Form for Reviews</p>"}', 'review'),
('7b528dff-793b-4c77-a250-8e4b1bbcbf0e', 'Form', '2022-05-13 10:53:22.717+00', '2022-05-13 10:53:22.717+00', 'decision', '{"name": "Decision Form", "children": [{"id": "74cf4404-3d04-46cb-a3da-e7d70d47db0a", "name": "meta.abstract", "title": "Decision", "component": "AbstractEditor", "description": "<p class=\"paragraph\">Text field for decisions.</p>", "placeholder": "Write/paste your decision letter here, or upload it using the upload button on the right."}, {"id": "78a94bf5-05c9-411d-bc97-5f84d2f686a2", "name": "fileName", "title": "Files", "component": "SupplementaryFiles", "description": "<p class=\"paragraph\">Drag and drop your files here</p>"}, {"id": "5705067e-3ee0-41ae-a953-87167b171c3f", "name": "submission.status", "title": "Decision Status", "inline": "false", "options": [{"id": "1ba634b0-82f9-481c-a135-77c6d3e28fec", "label": "Accept", "value": "accept", "labelColor": "#00ff7b"}, {"id": "459469e8-12ca-426c-9e05-581a14fe7c03", "label": "Revise", "value": "revise", "labelColor": "#daea61"}, {"id": "e38b9433-4e93-4e1d-b4a3-5a14f7ac3fc6", "label": "Reject", "value": "reject", "labelColor": "#e64e3d"}], "validate": [{"id": "76c87808-32cb-41cb-9f72-5254f610015f", "label": "Required", "value": "required"}], "component": "RadioGroup", "description": "<p class=\"paragraph\">Status of decesion </p>"}], "haspopup": "false"}', 'decision'),
('eae525b1-5b07-4c67-9bca-daf88bcb9804', 'Form', '2022-05-13 10:53:22.71+00', '2022-05-13 10:53:22.71+00', 'submit', '{"name": "Research Object Submission Form", "children": [{"id": "fa0c39ca-0486-4e29-ba24-f86f7d375c3f", "name": "submission.objectType", "title": "Type of Research Object", "options": [{"id": "df5fc212-b055-4cba-9d0e-e85222e3d4f2", "label": "Dataset", "value": "dataset"}, {"id": "ef2ddada-105a-412e-8d7f-56b1df44c02f", "label": "Software", "value": "software"}, {"id": "0fafbfc3-6797-46e3-aff4-3fd4f16261b1", "label": "Figure", "value": "figure"}, {"id": "5117a7c6-2fcf-414b-ac60-47f8d93ccfef", "label": "Notebook", "value": "notebook"}, {"id": "32121b38-b855-465e-b039-b5100177698b", "label": "Research article ", "value": "Research article "}], "component": "Select"}, {"id": "47fd802f-ed30-460d-9617-c8a9b9025e95", "name": "meta.title", "title": "Title", "component": "TextField", "placeholder": "Enter the manuscript''s title", "includeInReviewerPreview": "true"}, {"id": "d76e5b3c-eeaa-4168-9318-95d43a31e3e4", "name": "submission.authorNames", "title": "Author names", "component": "AuthorsInput", "includeInReviewerPreview": "true"}, {"id": "62ca72ad-04b0-41fc-85d1-415469d7e895", "name": "submission.topics", "title": "Topics", "options": [{"id": "2323b6d1-8223-45e8-a0fc-1044a1e39d37", "label": "Neuropsychology ", "value": "Neuropsychology "}, {"id": "ac7cafca-c5c8-4940-9f2f-014d18660e90", "label": "Topic 2", "value": "Topic 2"}, {"id": "93c88240-9c2b-4c23-9301-23ed94ef61d7", "label": "Topic 3", "value": "Topic 3"}], "component": "CheckboxGroup", "includeInReviewerPreview": "true"}, {"id": "1c2e9325-3fa8-41f3-8607-180eb8a25aa3", "name": "submission.DOI", "title": "DOI", "component": "TextField", "placeholder": "Enter the manuscript''s DOI", "doiValidation": "true", "includeInReviewerPreview": "true"}, {"id": "d80b2c88-6144-4003-b671-63990b9b2793", "name": "submission.abstract", "title": "Abstract", "component": "AbstractEditor", "description": "<p>Please provide a short summary of your submission</p>", "placeholder": "Input your abstract...", "shortDescription": "Abstract", "includeInReviewerPreview": "true"}, {"id": "7f5aa395-3486-4067-b636-ae204d472c16", "name": "submission.AuthorCorrespondence", "title": "Author correspondence ", "component": "TextField"}, {"id": "347dc171-f008-45ac-8433-ca0711bf213c", "name": "submission.cover", "title": "Cover letter", "component": "AbstractEditor", "description": "<p>Cover letter describing submission, relevant implications, and timely information to consider</p>", "placeholder": "Enter your cover letter"}, {"id": "14b8da7d-5924-4098-8d1f-e528c7c440b9", "name": "submission.EditorsEvaluation", "title": "Editors evaluation ", "component": "TextField"}, {"id": "bf2f9b4a-377b-4303-8f51-70d836eb1456", "name": "submission.datacode", "title": "Data and Code availability statements", "component": "AbstractEditor", "placeholder": "Enter your data and code availability statement"}, {"id": "fa5e5b75-4b6f-4a2d-9113-c2b4db73ef8a", "name": "submission.competingInterests", "title": "Competing interests", "component": "AbstractEditor", "includeInReviewerPreview": "true"}, {"id": "6bfdc237-814d-4af8-b0f0-064099d679ba", "name": "submission.Funding", "title": "Funding", "component": "TextField"}, {"id": "b769b4d5-f9b3-48d3-a6d5-77bb6a9e95b0", "name": "fileName", "title": "Upload supplementary materials", "component": "SupplementaryFiles"}, {"id": "b127ecb1-4862-4662-a958-3266eb284353", "name": "submission.authorContributions", "title": "Author contributions ", "component": "TextField"}, {"id": "6342cff7-c57a-4fd9-b91d-c4cf77b4c309", "name": "submission.DecisionLetter", "title": "Decision letter and author response", "component": "AbstractEditor"}, {"id": "e8af0c63-e46f-46a8-bc90-5023fe50a541", "name": "submission.references", "title": "References ", "component": "AbstractEditor", "includeInReviewerPreview": "true"}, {"id": "ebe75cec-0ba8-4f00-9024-20e77ed94f1c", "name": "submission.reviewingEditor", "title": "Reviewing editors name ", "component": "AuthorsInput"}, {"id": "6871680a-2278-40b3-80c6-7de06f21aafb", "name": "submission.copyrightHolder", "title": "Copyright holder", "component": "TextField", "description": "<p class=\"paragraph\">e.g. British Medical Journal </p>"}, {"id": "1e9ff636-f850-4d20-b079-36af49fa4ad1", "name": "submission.copyrightStatement", "title": "Copyright statement ", "component": "TextField", "description": "<p class=\"paragraph\">e.g. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.</p>"}, {"id": "7617c919-4413-4306-b709-ef78c3110c3f", "name": "submission.copyrightYear", "title": "Copyright year ", "component": "TextField", "description": "<p class=\"paragraph\">e.g. 2022</p>"}, {"id": "6deaacc6-759a-4a68-b494-c38c664bb665", "name": "submission.dateReceived", "title": "Date received ", "component": "TextField", "description": "<p class=\"paragraph\">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>"}, {"id": "8b858adc-5f65-4385-9f79-5c5af1f67bd5", "name": "submission.dateAccepted", "title": "Date accepted", "component": "TextField", "description": "<p class=\"paragraph\">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>"}, {"id": "f6e46890-4b96-4c90-ab48-b4fc5abb9b40", "name": "submission.datePublished", "title": "Date published ", "component": "TextField", "description": "<p class=\"paragraph\">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>"}], "haspopup": "true", "popuptitle": "By submitting the manuscript, you agree to the following statements.", "description": "<p>Please fill out the form below to complete your submission.</p>", "popupdescription": "<p>The corresponding author confirms that all co-authors are included, and that everyone listed as a co-author agrees to that role and all the following requirements and acknowledgements:</p><p></p><p>The submission represents original work and sources are given proper attribution. The journal employs CrossCheck to compare submissions against a large and growing database of published scholarly content. If in the judgment of a senior editor a submission is genuinely suspected of plagiarism, it will be returned to the author(s) with a request for explanation.</p><p></p><p>The research was conducted in accordance with ethical principles.</p><p></p><p>There is a Data Accessibility Statement, containing information about the location of open data and materials, in the manuscript.</p><p></p><p>A conflict of interest statement is present in the manuscript, even if to state no conflicts of interest.</p>"}', 'submission');

INSERT INTO "public"."identities" ("id", "user_id", "created", "updated", "type", "identifier", "name", "aff", "oauth", "is_default") VALUES
('bdd063ba-1acc-4b92-80a5-f8711587aeea', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2022-05-13 10:55:50.525+00', '2022-05-13 10:55:50.525+00', 'orcid', '0000-0003-3483-9210', 'Emily Clay', '', '{"accessToken": "67cdb60a-7713-45df-8004-ca4ab38e9014", "refreshToken": "6c54414e-8b88-4814-84f9-f3067ad3078e"}', 't'),
('e462e79a-9fb4-45cb-a5b8-a2735a7aeb69', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.655+00', '2022-05-13 10:54:12.655+00', 'orcid', '0000-0002-1851-1103', 'Sinead Sullivan', '', '{"accessToken": "e85acf35-dcbf-45b1-9bc3-5efb80a95ca9", "refreshToken": "3bd13cb6-b0c5-42df-98da-c0037185d085"}', 't');

INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "suggestions", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "is_hidden") VALUES
('8f05064b-b00d-4aec-a98f-f7ba3656cc2f', '2022-05-13 10:56:32.642+00', '2022-05-13 10:57:43.627+00', NULL, 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'accepted', 'accepted', NULL, NULL, '{"notes": [{"content": "", "notesType": "fundingAcknowledgement"}, {"content": "", "notesType": "specialInstructions"}], "title": "sample pdf"}', '{"DOI": "", "cover": "", "title": "", "topics": [], "Funding": "", "abstract": "", "datacode": "", "objectType": "", "references": "", "authorNames": "", "dateAccepted": "", "dateReceived": "", "copyrightYear": "", "datePublished": "", "DecisionLetter": "", "copyrightHolder": "", "reviewingEditor": "", "EditorsEvaluation": "", "competingInterests": "", "copyrightStatement": "", "authorContributions": "", "AuthorCorrespondence": ""}', '2022-05-13 10:57:43.509+00', 'Manuscript', NULL, NULL, NULL, NULL, 1, '2022-05-13 10:57:09.868+00', NULL);

INSERT INTO "public"."migrations" ("id", "run_at") VALUES
('1524494862-entities.sql', '2022-05-13 10:52:50.01554+00'),
('1542276313-initial-user-migration.sql', '2022-05-13 10:52:50.032808+00'),
('1560771823-add-unique-constraints-to-users.sql', '2022-05-13 10:52:50.046086+00'),
('1580908536-add-identities.sql', '2022-05-13 10:52:50.070739+00'),
('1581371297-migrate-users-to-identities.js', '2022-05-13 10:52:50.103403+00'),
('1581450834-manuscript.sql', '2022-05-13 10:52:50.114918+00'),
('1582930582-drop-fragments-and-collections.js', '2022-05-13 10:52:50.123104+00'),
('1585323910-add-channels.sql', '2022-05-13 10:52:50.142862+00'),
('1585344885-add-messages.sql', '2022-05-13 10:52:50.154652+00'),
('1585513226-add-profile-pic.sql', '2022-05-13 10:52:50.158314+00'),
('1592915682-change-identities-constraint.sql', '2022-05-13 10:52:50.164122+00'),
('1596830547-review.sql', '2022-05-13 10:52:50.176346+00'),
('1596830548-add-review-comments.sql', '2022-05-13 10:52:50.187288+00'),
('1596830548-initial-team-migration.sql', '2022-05-13 10:52:50.210272+00'),
('1596838897-files.sql', '2022-05-13 10:52:50.220391+00'),
('1616115191-add-first-login.sql', '2022-05-13 10:52:50.224484+00'),
('1616157398-remove-first-login-column.sql', '2022-05-13 10:52:50.22787+00'),
('1618365033-form.sql', '2022-05-13 10:52:50.23538+00'),
('1619180836-add_hypothesis_id.sql', '2022-05-13 10:52:50.238671+00'),
('1621499368-remove_hypothesis_id_column.sql', '2022-05-13 10:52:50.241988+00'),
('1621508277-evaluations_to_hypothesis_map.sql', '2022-05-13 10:52:50.245103+00'),
('1623224645-article-import-sources.sql', '2022-05-13 10:52:50.253053+00'),
('1623224655-article-import-history.sql', '2022-05-13 10:52:50.259417+00'),
('1623225900-add-import-columns.sql', '2022-05-13 10:52:50.264513+00'),
('1625223822-is-shared-team-member.sql', '2022-05-13 10:52:50.269874+00'),
('1625489571-add-is-hidden-from-author.sql', '2022-05-13 10:52:50.274758+00'),
('1625565801-add-is-hidden-reviewer-name.sql', '2022-05-13 10:52:50.278644+00'),
('1625653490-add-column-can-be-published-publicly.sql', '2022-05-13 10:52:50.285303+00'),
('1626669203-add-short_id.sql', '2022-05-13 10:52:50.3285+00'),
('1626669349-add_submitted_date.sql', '2022-05-13 10:52:50.332845+00'),
('1627646181-add-is-hidden-column.sql', '2022-05-13 10:52:50.336489+00'),
('1629434722-set_shortids_to_parent_value.sql', '2022-05-13 10:52:50.339444+00'),
('1629757873-index-created-and-published-dates.sql', '2022-05-13 10:52:50.346339+00'),
('1634271132-non-null-manuscript_id-and-other-fields.sql', '2022-05-13 10:52:50.351943+00'),
('1635472928-prefix_urls.sql', '2022-05-13 10:52:50.358705+00'),
('1638161107-prefix_urls_uploads.sql', '2022-05-13 10:52:50.370945+00'),
('1638227484-rename_existing_files_to_files_old.sql', '2022-05-13 10:52:50.379286+00'),
('1638256284-remove_constraint_files_pkey_in_files_old.sql', '2022-05-13 10:52:50.387404+00'),
('1638357830-init-file.js', '2022-05-13 10:52:50.402611+00'),
('1639635803224-update-username.sql', '2022-05-13 10:52:50.406327+00'),
('1644381481-add-system-wide-discussion.sql', '2022-05-13 10:52:50.412315+00'),
('1648006297-add-category.sql', '2022-05-13 10:52:50.416942+00'),
('1649295531-migrate-files-old-to-files.js', '2022-05-13 10:52:50.429765+00'),
('1649401731-convert-inline-base64-in-source-to-inline-file-urls.js', '2022-05-13 10:52:50.440636+00');

INSERT INTO "public"."review_comments" ("id", "created", "updated", "review_id", "user_id", "content", "comment_type", "type") VALUES
('d636e220-20bf-4ec1-96a0-c610f5612586', '2022-05-13 10:57:38.576+00', '2022-05-13 10:57:38.576+00', 'a9d0ddb5-0518-4bab-bb15-fdaeb9e60696', NULL, '<p class="paragraph">hbkj</p>', 'decision', 'ReviewComment');

INSERT INTO "public"."reviews" ("id", "created", "updated", "recommendation", "is_decision", "user_id", "manuscript_id", "type", "is_hidden_from_author", "is_hidden_reviewer_name", "can_be_published_publicly") VALUES
('a9d0ddb5-0518-4bab-bb15-fdaeb9e60696', '2022-05-13 10:57:38.571+00', '2022-05-13 10:57:39.963+00', 'accepted', 't', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', 'Review', NULL, NULL, NULL),
('c7a95df9-32d8-4bc5-812c-468c18cf53ca', '2022-05-13 10:58:32.521+00', '2022-05-13 10:58:41.719+00', 'accepted', 'f', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f', 'Review', 't', 't', NULL);

INSERT INTO "public"."team_members" ("id", "created", "updated", "status", "team_id", "user_id", "alias_id", "is_shared") VALUES
('19dd1446-a8fb-4a4a-8c3b-2babcd8108ab', '2022-05-13 10:58:26.685+00', '2022-05-13 10:58:26.685+00', NULL, '2eb4335a-0037-415c-abab-ec3aa8bf7e79', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL),
('bc3eefda-143f-4208-b666-cb6f3790d4e2', '2022-05-13 10:58:23.404+00', '2022-05-13 10:58:42.896+00', 'completed', 'a4ee7976-e7f6-42ea-93fe-9798e531f532', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL),
('c0707ae1-a927-4709-9b25-600d7b76404d', '2022-05-13 10:56:32.664+00', '2022-05-13 10:56:32.664+00', NULL, '9816ff49-1641-4ef0-a60d-4d85bd7a044b', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL, NULL);

INSERT INTO "public"."teams" ("id", "created", "updated", "name", "role", "members", "owners", "global", "type", "manuscript_id") VALUES
('2eb4335a-0037-415c-abab-ec3aa8bf7e79', '2022-05-13 10:57:28.837+00', '2022-05-13 10:57:28.837+00', 'Senior Editor', 'seniorEditor', NULL, NULL, NULL, 'team', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f'),
('9816ff49-1641-4ef0-a60d-4d85bd7a044b', '2022-05-13 10:56:32.656+00', '2022-05-13 10:56:32.656+00', 'Author', 'author', NULL, NULL, NULL, 'team', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f'),
('a4ee7976-e7f6-42ea-93fe-9798e531f532', '2022-05-13 10:58:23.403+00', '2022-05-13 10:58:23.403+00', 'Reviewers', 'reviewer', NULL, NULL, NULL, 'team', '8f05064b-b00d-4aec-a98f-f7ba3656cc2f');

INSERT INTO "public"."users" ("id", "created", "updated", "admin", "email", "username", "password_hash", "teams", "password_reset_token", "password_reset_timestamp", "type", "profile_picture", "online") VALUES
('ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2022-05-13 10:55:50.523+00', '2022-05-13 10:56:32.666+00', NULL, NULL, '0000000205642016', NULL, NULL, NULL, NULL, 'user', NULL, NULL),
('5b861dfb-02df-4be1-bc67-41a21611f5e7', '2022-05-14 10:31:35.715+00', '2022-05-14 10:32:14.133+00', 't', NULL, '0000000318382441', NULL, NULL, NULL, NULL, 'user', NULL, NULL),
('f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.651+00', '2022-05-13 10:58:26.686+00', 't', NULL, '0000000256415729', NULL, NULL, NULL, NULL, 'user', NULL, NULL);

ALTER TABLE "public"."article_import_history" ADD FOREIGN KEY ("source_id") REFERENCES "public"."article_import_sources"("id");
ALTER TABLE "public"."channel_members" ADD FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id");
ALTER TABLE "public"."channel_members" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."channels" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;
ALTER TABLE "public"."files_old" ADD FOREIGN KEY ("review_comment_id") REFERENCES "public"."review_comments"("id") ON DELETE CASCADE;
ALTER TABLE "public"."files_old" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;
ALTER TABLE "public"."identities" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."manuscripts" ADD FOREIGN KEY ("import_source") REFERENCES "public"."article_import_sources"("id");
ALTER TABLE "public"."manuscripts" ADD FOREIGN KEY ("submitter_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."messages" ADD FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE CASCADE;
ALTER TABLE "public"."messages" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."review_comments" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;
ALTER TABLE "public"."review_comments" ADD FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;
ALTER TABLE "public"."reviews" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;
ALTER TABLE "public"."team_members" ADD FOREIGN KEY ("alias_id") REFERENCES "public"."aliases"("id");
ALTER TABLE "public"."team_members" ADD FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."team_members" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."teams" ADD FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE CASCADE;


