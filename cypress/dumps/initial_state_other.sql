--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5
-- Dumped by pg_dump version 10.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: aliases; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.aliases (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    name text,
    email text,
    aff text
);


ALTER TABLE public.aliases OWNER TO kotahidev;

--
-- Name: channel_members; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.channel_members (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    user_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    last_viewed timestamp,
    last_alert_triggered_time timestamp,
);


ALTER TABLE public.channel_members OWNER TO kotahidev;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.channels (
    id uuid NOT NULL,
    manuscript_id uuid,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    topic text,
    type text
);


ALTER TABLE public.channels OWNER TO kotahidev;

--
-- Name: entities; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.entities (
    id uuid NOT NULL,
    data jsonb
);


ALTER TABLE public.entities OWNER TO kotahidev;

--
-- Name: files; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.files (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    label text,
    file_type text NOT NULL,
    filename text NOT NULL,
    url text NOT NULL,
    mime_type text,
    size integer NOT NULL,
    type text NOT NULL,
    object_id uuid,
    review_comment_id uuid
);


ALTER TABLE public.files OWNER TO kotahidev;


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

--
-- Name: forms; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.forms (
    id UUID NOT NULL DEFAULT public.gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'form',
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    purpose TEXT NOT NULL,
    category TEXT NULL,
    structure JSONB NOT NULL,
    CONSTRAINT pkey_forms PRIMARY KEY (id)
);

ALTER TABLE public.forms OWNER TO kotahidev;

--
-- Name: identities; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.identities (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    type text NOT NULL,
    identifier text,
    name text,
    aff text,
    oauth jsonb,
    is_default boolean
);


ALTER TABLE public.identities OWNER TO kotahidev;

--
-- Name: manuscripts; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.manuscripts (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    parent_id uuid,
    submitter_id uuid,
    status text,
    decision text,
    authors jsonb,
    meta jsonb,
    submission jsonb,
    published timestamp with time zone,
    type text NOT NULL,
    evaluations_hypothesis_map jsonb,
    is_imported boolean,
    is_hidden boolean,
    import_source uuid,
    import_source_server text,
    short_id SERIAL,
    submitted_date timestamp with time zone,
    form_fields_to_publish JSONB DEFAULT '[]'::JSONB NOT NULL,
    searchable_text TEXT DEFAULT '' NOT NULL,
    search_tsvector tsvector DEFAULT ''::tsvector NOT NULL,
    doi text
);

ALTER TABLE public.manuscripts OWNER TO kotahidev;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    content text
);


ALTER TABLE public.messages OWNER TO kotahidev;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.migrations (
    id text NOT NULL,
    run_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO kotahidev;

--
-- Name: review_comments; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.review_comments (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    review_id uuid,
    user_id uuid,
    content text,
    comment_type text,
    type text
);


ALTER TABLE public.review_comments OWNER TO kotahidev;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.reviews (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    is_decision boolean DEFAULT false,
    user_id uuid,
    manuscript_id uuid,
    type text NOT NULL,
    is_hidden_from_author boolean,
    is_hidden_reviewer_name boolean,
    can_be_published_publicly boolean,
    json_data JSONB DEFAULT NULL
);

ALTER TABLE public.reviews OWNER TO kotahidev;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: kotahidev
--

DROP TABLE IF EXISTS public.tasks;

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
--  task_list_id uuid NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
  manuscript_id uuid,
  title TEXT,
  assignee_user_id uuid,
  default_duration_days INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_period_days INTEGER,
  status TEXT,
  sequence_index INTEGER NOT NULL
);

ALTER TABLE public.tasks OWNER TO kotahidev;

--
-- Name: task_alerts; Type: TABLE; Schema: public; Owner: kotahidev
--

DROP TABLE IF EXISTS public.task_alerts;

CREATE TABLE public.task_alerts (
  id UUID PRIMARY KEY,
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.task_alerts OWNER TO kotahidev;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.team_members (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255),
    team_id uuid,
    user_id uuid,
    alias_id uuid,
    is_shared boolean
);


ALTER TABLE public.team_members OWNER TO kotahidev;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.teams (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    name text,
    role text NOT NULL,
    members jsonb,
    owners jsonb,
    global boolean,
    type text NOT NULL,
    object_id uuid,
    object_type text
);


ALTER TABLE public.teams OWNER TO kotahidev;

--
-- Name: users; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    admin boolean,
    email text,
    username text,
    password_hash text,
    teams jsonb,
    password_reset_token text,
    password_reset_timestamp timestamp with time zone,
    type text NOT NULL,
    profile_picture text,
    online boolean,
    event_notifications_opt_in boolean DEFAULT true,
    last_online timestamp with time zone
);


ALTER TABLE public.users OWNER TO kotahidev;

--
-- Name: configs; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.configs (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    active boolean,
    form_data jsonb,
    type text NOT NULL
);


ALTER TABLE public.configs OWNER TO kotahidev;

--
-- Name: article_import_sources; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.article_import_sources (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    server text
);



--
-- Name: article_import_history; Type: TABLE; Schema: public; Owner: kotahidev
--

CREATE TABLE public.article_import_history (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    date timestamp with time zone,
    source_id uuid
);



--
-- Data for Name: aliases; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: channel_members; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('d341a633-cdce-4a7f-a9ad-5afc03cd0dd1', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2020-07-21 16:17:24.741+02', '2020-07-21 16:17:25.87+02', 'orcid', '0000-0002-0564-2016', 'Emily Clay', NULL, '{"accessToken": "079a1165-31e5-4b59-9a99-d80ff7a21ebf", "refreshToken": "ccadc737-defc-419e-823b-a9f3673848ba"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('bcda196e-765a-42c8-94da-ca2e43b80f96', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2020-07-21 16:30:45.721+02', '2020-07-21 16:33:26.742+02', 'orcid', '0000-0002-5641-5729', 'Sinead Sullivan', NULL, '{"accessToken": "ef1ed3ec-8371-41b2-a136-fd196ae52a72", "refreshToken": "6972dace-d9a6-4cd3-a2ad-ec7eb3e457c7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('4af83984-6359-47c5-a075-5ddfa9c555d9', '41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2020-07-21 16:35:06.127+02', '2020-07-21 16:35:07.104+02', 'orcid', '0000-0002-7645-9921', 'Sherry Crofoot', NULL, '{"accessToken": "2ad4e130-0775-4e13-87fb-8e8f5a0570ae", "refreshToken": "159933d9-2020-4c02-bdfb-163af41017dc"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('acfa1777-0aec-4fe1-bc16-92bb9d19e884', '85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.384+02', '2020-07-21 16:35:39.358+02', 'orcid', '0000-0002-9429-4446', 'Elaine Barnes', NULL, '{"accessToken": "dcf07bc7-e59c-41b3-9ce0-924ac20aeeea", "refreshToken": "ae49d6a1-8e62-419d-8767-4a3ec22c1950"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('88c85115-d83c-42d7-a1a1-0139827977da', '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2020-07-21 16:36:24.975+02', '2020-07-21 16:36:26.059+02', 'orcid', '0000-0001-5956-7341', 'Gale Davis', NULL, '{"accessToken": "3e9f6f6c-7cc0-4afa-9fdf-6ed377c36aad", "refreshToken": "80b1e911-df97-43f1-9f11-17b61913f6d7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('049f91da-c84e-4b80-be2e-6e0cfca7a136', '231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.611+02', '2020-07-22 14:18:37.745+02', 'orcid', '0000-0003-2536-230X', 'Test Account', NULL, '{"accessToken": "eb551178-79e5-4189-8c5f-0a553092a9b5", "refreshToken": "4506fa5f-bd77-4867-afb4-0b07ea5302d6"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('2fb8359c-239c-43fa-91f5-1ff2058272a6', '5b861dfb-02df-4be1-bc67-41a21611f5e7', '2020-07-24 15:21:54.604+02', '2020-07-24 15:21:55.7+02', 'orcid', '0000-0003-1838-2441', 'Joane Pilger', NULL, '{"accessToken": "842de329-ef16-4461-b83b-e8fe57238904", "refreshToken": "524fbdc5-9c67-4b4c-af17-2ce4cf294e88"}', true);


--
-- Data for Name: manuscripts; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.migrations (id, run_at) VALUES ('1524494862-entities.sql', '2020-08-16 22:36:46.642584+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1542276313-initial-user-migration.sql', '2020-08-16 22:36:46.654019+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1560771823-add-unique-constraints-to-users.sql', '2020-08-16 22:36:46.66205+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1580908536-add-identities.sql', '2020-08-16 22:36:46.674013+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1581371297-migrate-users-to-identities.js', '2020-08-16 22:36:46.695786+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1581450834-manuscript.sql', '2020-08-16 22:36:46.705481+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1582930582-drop-fragments-and-collections.js', '2020-08-16 22:36:46.715537+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585323910-add-channels.sql', '2020-08-16 22:36:46.728966+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585344885-add-messages.sql', '2020-08-16 22:36:46.743035+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1585513226-add-profile-pic.sql', '2020-08-16 22:36:46.748428+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1592915682-change-identities-constraint.sql', '2020-08-16 22:36:46.756393+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830547-review.sql', '2020-08-16 22:36:46.766024+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830548-add-review-comments.sql', '2020-08-16 22:36:46.776351+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596830548-initial-team-migration.sql', '2020-08-16 22:36:46.795918+02');
INSERT INTO public.migrations (id, run_at) VALUES ('1596838897-files.sql', '2020-08-16 22:36:46.807663+02');


--
-- Data for Name: review_comments; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.teams (id, created, updated, name, role, members, owners, global, type, object_id, object_type) VALUES
  ('eb61876a-fee2-44cf-a6a9-9cdca2f1b398', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'Group Manager', 'groupManager', NULL, NULL, true, 'team', NULL, NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.381+02', '2020-07-24 16:43:03.114+02', NULL, NULL, 'Elaine Barnes', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser1.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2020-07-21 16:17:24.734+02', '2020-07-24 16:43:15.46+02', NULL, NULL, 'Emily Clay', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser2.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('5b861dfb-02df-4be1-bc67-41a21611f5e7', '2020-07-24 15:21:54.59+02', '2020-07-24 16:43:26.378+02', NULL, NULL, 'Joane Pilger', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser3.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2020-07-21 16:36:24.973+02', '2020-07-24 16:43:43.943+02', NULL, 'galekotahitestemailaccount@test.com', 'Gale Davis', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser4.jpg', true, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.597+02', '2020-07-24 16:43:54.939+02', true, NULL, 'Test Account', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser5.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2020-07-21 16:35:06.125+02', '2020-07-24 16:44:59.306+02', NULL, 'sherrykotahitestemailaccount@test.com', 'Sherry Crofoot', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser7.jpg', true, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2020-07-21 16:30:45.719+02', '2021-03-10 12:41:10.044+01', true, 'sineadkotahitestemailaccount@test.com', 'Sinead Sullivan', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser6.jpg', false, NULL);


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: kotahidev
--


INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id, is_shared) VALUES
  ('3c01cb4a-27ed-53e2-ca03-a4593cb0434e', '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, 'eb61876a-fee2-44cf-a6a9-9cdca2f1b398', '231717dd-ba09-43d4-ac98-9d5542b27a0c', NULL, NULL),
  ('4d12dc5b-38fe-64f3-db14-b56a4dc1545f', '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, 'eb61876a-fee2-44cf-a6a9-9cdca2f1b398', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL);

--
-- Data for Name: configs; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.configs (id, created, updated, form_data, active, type) VALUES ('6619a377-c53d-4a5c-885b-b0f41ff5d6ed', '2023-02-23 14:27:54.64+00', '2023-02-23 14:27:54.64+00', '{"user": {"isAdmin": false, "kotahiApiTokens": "test:123456"}, "report": {"showInMenu": true}, "review": {"showSummary": false}, "dashboard": {"showSections": ["submission", "review", "editor"], "loginRedirectUrl": "/dashboard"}, "manuscript": {"tableColumns": "shortId, meta.title, created, updated, status, submission.labels, author", "paginationCount": 10}, "publishing": {"webhook": {"ref": "test", "url": "https://someserver/webhook-address", "token": "test"}, "crossref": {"login": "test", "password": "test", "doiPrefix": "10.12345/", "licenseUrl": "test", "registrant": "test", "useSandbox": true, "journalName": "test", "depositorName": "test", "depositorEmail": "test@coko.foundation", "journalHomepage": "test", "publicationType": "article", "journalAbbreviatedName": "test", "publishedArticleLocationPrefix": "test"}, "hypothesis": {"group": null, "apiKey": null, "reverseFieldOrder": false, "shouldAllowTagging": false}}, "taskManager": {"teamTimezone": "Etc/UTC"}, "controlPanel": {"showTabs": ["Team", "Decision", "Manuscript text", "Metadata", "Tasks & Notifications"], "hideReview": true, "sharedReview": true, "displayManuscriptShortId": true}, "instanceName": "aperture", "notification": {"gmailAuthEmail": null, "gmailSenderEmail": null, "gmailAuthPassword": null}, "groupIdentity": {"logoPath": "/assets/logo-kotahi.png", "brandName": "Kotahi", "primaryColor": "#3AAE2A", "secondaryColor": "#9e9e9e"}}', 't', 'Config');

--
-- Name: aliases aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.aliases
    ADD CONSTRAINT aliases_pkey PRIMARY KEY (id);


--
-- Name: channel_members channel_members_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: entities entities_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: manuscripts manuscripts_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.manuscripts
    ADD CONSTRAINT manuscripts_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: review_comments review_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: article_import_sources article_import_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.article_import_sources
    ADD CONSTRAINT article_import_sources_pkey PRIMARY KEY (id);


--
-- Name: article_import_history article_import_history_pkey; Type: CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.article_import_history
    ADD CONSTRAINT article_import_history_pkey PRIMARY KEY (id);


--
-- Name: channel_members_idx; Type: INDEX; Schema: public; Owner: kotahidev
--

CREATE INDEX channel_members_idx ON public.channel_members USING btree (user_id, channel_id);


--
-- Name: is_default_idx; Type: INDEX; Schema: public; Owner: kotahidev
--

CREATE UNIQUE INDEX is_default_idx ON public.identities USING btree (is_default, user_id) WHERE (is_default IS TRUE);


--
-- Name: team_members_team_id_user_id_idx; Type: INDEX; Schema: public; Owner: kotahidev
--

CREATE INDEX team_members_team_id_user_id_idx ON public.team_members USING btree (team_id, user_id);


--
-- Name: teams_manuscript_id_idx; Type: INDEX; Schema: public; Owner: kotahidev
--

CREATE INDEX teams_object_id_idx ON public.teams USING btree (object_id);


--
-- Name: channel_members channel_members_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id);


--
-- Name: channel_members channel_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: channels channels_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


--
-- Name: files files_review_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_review_comment_id_fkey FOREIGN KEY (review_comment_id) REFERENCES public.review_comments(id) ON DELETE CASCADE;


--
-- Name: manuscripts manuscripts_submitter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.manuscripts
    ADD CONSTRAINT manuscripts_submitter_id_fkey FOREIGN KEY (submitter_id) REFERENCES public.users(id);


--
-- Name: messages messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_comments review_comments_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_comments review_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


--
-- Name: identities sidentities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT sidentities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- tasks and task_alerts

ALTER TABLE public.tasks ADD FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD FOREIGN KEY (assignee_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.task_alerts ADD FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
ALTER TABLE public.task_alerts ADD FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE INDEX tasks_manuscript_id_idx ON public.tasks (manuscript_id);
CREATE INDEX tasks_user_id_idx ON public.tasks (assignee_user_id);
CREATE UNIQUE INDEX task_alerts_alerts_task_id_user_id_uniq_idx ON public.task_alerts (task_id, user_id);
CREATE INDEX task_alerts_task_id_idx ON public.task_alerts (task_id);
CREATE INDEX task_alerts_user_id_idx ON public.task_alerts (user_id);


--
-- Name: team_members team_members_alias_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_alias_id_fkey FOREIGN KEY (alias_id) REFERENCES public.aliases(id);


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

DROP table IF EXISTS public.invitations;
DROP type IF EXISTS public.invitation_status;
DROP type IF EXISTS public.invitation_declined_reason_type;
DROP type IF EXISTS public.invitation_type;
CREATE TYPE public.invitation_status as enum ('UNANSWERED','ACCEPTED','REJECTED');
CREATE TYPE public.invitation_declined_reason_type AS enum ('UNAVAILABLE','TOPIC','CONFLICT_OF_INTEREST','OTHER','DO_NOT_CONTACT');
CREATE TYPE public.invitation_type AS enum ('AUTHOR','REVIEWER');

CREATE TABLE public.invitations (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    manuscript_id UUID NOT NULL,
        CONSTRAINT fk_man_id FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts (id) ON DELETE CASCADE,
    purpose TEXT,
    to_email TEXT NOT NULL,
    status public.invitation_status NOT NULL,
    invited_person_type public.invitation_type NOT NULL,
    invited_person_name TEXT NOT NULL,
    response_date TIMESTAMP WITH TIME ZONE,
    response_comment TEXT,
    declined_reason public.invitation_declined_reason_type ,
    user_id UUID, 
        CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users (id),
    sender_id UUID NOT NULL,
        CONSTRAINT fk_sender_id FOREIGN KEY (sender_id) REFERENCES public.users (id)
);



CREATE TABLE public.email_blacklist (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  email TEXT NOT NULL
);



CREATE TABLE IF NOT EXISTS public.threaded_discussions (
  id uuid NOT NULL,
  created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  manuscript_id uuid NOT NULL,
  threads JSONB NOT NULL
);

ALTER TABLE public.threaded_discussions
  ADD CONSTRAINT threaded_discussions_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;




DROP FUNCTION IF EXISTS public.manuscripts_searchable_text_trigger;
CREATE FUNCTION public.manuscripts_searchable_text_trigger() RETURNS trigger AS $$
DECLARE
  a TEXT;
  b TEXT;
  c TEXT;
  authors JSON;
  author JSON;
  authorstext TEXT := '';
  member RECORD;
  memberstext TEXT := '';
  invitee RECORD;
  inviteestext TEXT := '';
  submittertext TEXT := '';
BEGIN
  authors := COALESCE(NULLIF(new.submission->>'authors',''), NULLIF(new.submission->>'authorNames',''), '[]')::JSON;
  FOR author IN SELECT * FROM json_array_elements(authors) LOOP
    authorstext = concat(
      authorstext,
      concat_ws(', ',
        concat_ws(' ', author->>'firstName', author->>'lastName'),
        author->>'email',
        author->>'affiliation'
      ),
      '; '
    );
  END LOOP;

  FOR member IN SELECT username, email
    FROM public.teams t, public.team_members tm, public.users u
    WHERE t.object_id = new.id AND tm.team_id = t.id AND u.id = tm.user_id
  LOOP
    memberstext := concat(
      memberstext,
      member.username, ' ', member.email,
      '; '
    );
  END LOOP;

  FOR invitee IN SELECT invited_person_name, to_email
    FROM public.invitations i
    WHERE i.manuscript_id = new.id
  LOOP
    inviteestext := concat(
      inviteestext,
      invitee.invited_person_name, ' ', invitee.to_email,
      '; '
    );
  END LOOP;

  submittertext := (SELECT concat_ws(', ', username, email)
    FROM public.users u
    WHERE u.id = new.submitter_id);

  a := concat_ws(E'\n',
    new.meta->>'title',
    new.submission->>'description',
    new.submission->>'title',
    new.meta->>'abstract',
    new.submission->>'abstract',
    new.submission->>'doi',
    new.submission->>'DOI',
    new.submission->>'articleURL'
  );
  b := concat_ws(E'\n',
    authorstext,
    memberstext,
    inviteestext,
    submittertext,
    new.short_id,
    new.submission->>'articleId',
    new.submission->>'link',
    new.submission->>'biorxivURL'
  );
  c := concat(
    new.meta->>'source'
  );

  new.search_tsvector :=
    setweight(to_tsvector('english', a), 'A') ||
    setweight(to_tsvector('english', b), 'B') ||
    setweight(to_tsvector('english', c), 'C');
  new.searchable_text := concat_ws(E'\n', a, b, c);

  RETURN new;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER searchable_text_update BEFORE INSERT OR UPDATE
  ON public.manuscripts FOR EACH ROW EXECUTE PROCEDURE public.manuscripts_searchable_text_trigger();

DROP FUNCTION IF EXISTS public.team_members_trigger;
CREATE FUNCTION public.team_members_trigger() RETURNS trigger AS $$
BEGIN
  UPDATE public.manuscripts m SET updated = m.updated -- Cause trigger function to regenerate searchable_text
    FROM public.teams t
    WHERE new.team_id = t.id AND t.object_id = m.id;
  RETURN new;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_member_update AFTER INSERT OR UPDATE
  ON public.team_members FOR EACH ROW EXECUTE PROCEDURE public.team_members_trigger();

DROP FUNCTION IF EXISTS public.invitations_trigger;
CREATE FUNCTION public.invitations_trigger() RETURNS trigger AS $$
BEGIN
  UPDATE public.manuscripts m SET updated = m.updated -- Cause trigger function to regenerate searchable_text
    WHERE new.manuscript_id = m.id;
  RETURN new;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitation_update AFTER INSERT OR UPDATE
  ON public.invitations FOR EACH ROW EXECUTE PROCEDURE public.invitations_trigger();


CREATE INDEX IF NOT EXISTS manuscripts_search_idx ON public.manuscripts
  USING GIN (search_tsvector);

INSERT INTO public.channels ( 
  id, topic, type 
) VALUES (  
  '9fd7774c-11e5-4802-804c-ab64aefd5080', 'System-wide discussion', 'editorial'
) ON CONFLICT DO NOTHING;
