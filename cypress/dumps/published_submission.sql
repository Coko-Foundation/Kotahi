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
-- Name: pgboss; Type: SCHEMA; Schema: -; Owner: kotahidev
--

CREATE SCHEMA pgboss;


ALTER SCHEMA pgboss OWNER TO kotahidev;

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
-- Name: job_state; Type: TYPE; Schema: pgboss; Owner: kotahidev
--

CREATE TYPE pgboss.job_state AS ENUM (
    'created',
    'retry',
    'active',
    'completed',
    'expired',
    'cancelled',
    'failed'
);


ALTER TYPE pgboss.job_state OWNER TO kotahidev;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: archive; Type: TABLE; Schema: pgboss; Owner: kotahidev
--

CREATE TABLE pgboss.archive (
    id uuid NOT NULL,
    name text NOT NULL,
    priority integer NOT NULL,
    data jsonb,
    state pgboss.job_state NOT NULL,
    retrylimit integer NOT NULL,
    retrycount integer NOT NULL,
    retrydelay integer NOT NULL,
    retrybackoff boolean NOT NULL,
    startafter timestamp with time zone NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval NOT NULL,
    createdon timestamp with time zone NOT NULL,
    completedon timestamp with time zone,
    archivedon timestamp with time zone DEFAULT now() NOT NULL,
    keepuntil timestamp with time zone,
    on_complete boolean
);


ALTER TABLE pgboss.archive OWNER TO kotahidev;

--
-- Name: job; Type: TABLE; Schema: pgboss; Owner: kotahidev
--

CREATE TABLE pgboss.job (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    data jsonb,
    state pgboss.job_state DEFAULT 'created'::pgboss.job_state NOT NULL,
    retrylimit integer DEFAULT 0 NOT NULL,
    retrycount integer DEFAULT 0 NOT NULL,
    retrydelay integer DEFAULT 0 NOT NULL,
    retrybackoff boolean DEFAULT false NOT NULL,
    startafter timestamp with time zone DEFAULT now() NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval DEFAULT '00:15:00'::interval NOT NULL,
    createdon timestamp with time zone DEFAULT now() NOT NULL,
    completedon timestamp with time zone,
    keepuntil timestamp with time zone DEFAULT (now() + '30 days'::interval) NOT NULL,
    on_complete boolean DEFAULT true NOT NULL
);


ALTER TABLE pgboss.job OWNER TO kotahidev;

--
-- Name: schedule; Type: TABLE; Schema: pgboss; Owner: kotahidev
--

CREATE TABLE pgboss.schedule (
    name text NOT NULL,
    cron text NOT NULL,
    timezone text,
    data jsonb,
    options jsonb,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    updated_on timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE pgboss.schedule OWNER TO kotahidev;

--
-- Name: version; Type: TABLE; Schema: pgboss; Owner: kotahidev
--

CREATE TABLE pgboss.version (
    version integer NOT NULL,
    maintained_on timestamp with time zone,
    cron_on timestamp with time zone
);


ALTER TABLE pgboss.version OWNER TO kotahidev;

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
    channel_id uuid NOT NULL
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
    manuscript_id uuid NOT NULL,
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
    type text NOT NULL
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
    recommendation text,
    is_decision boolean DEFAULT false,
    user_id uuid,
    manuscript_id uuid,
    type text NOT NULL
);


ALTER TABLE public.reviews OWNER TO kotahidev;

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
    alias_id uuid
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
    manuscript_id uuid
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
    last_online timestamp with time zone
);


ALTER TABLE public.users OWNER TO kotahidev;

--
-- Data for Name: archive; Type: TABLE DATA; Schema: pgboss; Owner: kotahidev
--



--
-- Data for Name: job; Type: TABLE DATA; Schema: pgboss; Owner: kotahidev
--

INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('876670c0-8195-11eb-815e-59df8a5d915a', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, false, '2021-03-10 12:41:18.669507+01', '2021-03-10 12:41:18.675148+01', '__pgboss__maintenance', NULL, '00:15:00', '2021-03-10 12:41:18.669507+01', '2021-03-10 12:41:18.693727+01', '2021-03-10 12:49:18.669507+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('87686c90-8195-11eb-815e-59df8a5d915a', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, false, '2021-03-10 12:41:18.685423+01', '2021-03-10 12:41:22.689863+01', NULL, '2021-03-10 11:41:00', '00:15:00', '2021-03-10 12:41:18.685423+01', '2021-03-10 12:41:22.824712+01', '2021-03-10 12:42:18.685423+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('89da2fe0-8195-11eb-815e-59df8a5d915a', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, false, '2021-03-10 12:42:01.782499+01', '2021-03-10 12:48:02.953124+01', NULL, '2021-03-10 11:42:00', '00:15:00', '2021-03-10 12:41:22.782499+01', '2021-03-10 12:48:02.980596+01', '2021-03-10 12:43:01.782499+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('7862a3e0-8196-11eb-815e-59df8a5d915a', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, false, '2021-03-10 12:48:02.975253+01', '2021-03-10 12:48:06.958274+01', NULL, '2021-03-10 11:48:00', '00:15:00', '2021-03-10 12:48:02.975253+01', '2021-03-10 12:48:06.970586+01', '2021-03-10 12:49:02.975253+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('876ab680-8195-11eb-815e-59df8a5d915a', '__pgboss__maintenance', 0, NULL, 'completed', 0, 0, 0, false, '2021-03-10 12:43:18.696869+01', '2021-03-10 12:48:18.70568+01', '__pgboss__maintenance', NULL, '00:15:00', '2021-03-10 12:41:18.696869+01', '2021-03-10 12:48:18.766285+01', '2021-03-10 12:51:18.696869+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('81ccc410-8196-11eb-815e-59df8a5d915a', '__pgboss__maintenance', 0, NULL, 'created', 0, 0, 0, false, '2021-03-10 12:50:18.770247+01', NULL, '__pgboss__maintenance', NULL, '00:15:00', '2021-03-10 12:48:18.770247+01', NULL, '2021-03-10 12:58:18.770247+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('7ac41380-8196-11eb-815e-59df8a5d915a', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, false, '2021-03-10 12:49:01.96878+01', '2021-03-10 12:58:27.334014+01', NULL, '2021-03-10 11:49:00', '00:15:00', '2021-03-10 12:48:06.96878+01', '2021-03-10 12:58:27.508234+01', '2021-03-10 12:50:01.96878+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('ec9c4080-8197-11eb-815e-59df8a5d915a', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, false, '2021-03-10 12:58:27.46456+01', '2021-03-10 12:58:31.341102+01', NULL, '2021-03-10 11:58:00', '00:15:00', '2021-03-10 12:58:27.46456+01', '2021-03-10 12:58:31.365053+01', '2021-03-10 12:59:27.46456+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('b4d12280-819f-11eb-815e-59df8a5d915a', '__pgboss__cron', 0, NULL, 'created', 2, 0, 0, false, '2021-03-10 13:54:09.833065+01', NULL, NULL, '2021-03-10 12:54:00', '00:15:00', '2021-03-10 13:54:09.833065+01', NULL, '2021-03-10 13:55:09.833065+01', false);
INSERT INTO pgboss.job (id, name, priority, data, state, retrylimit, retrycount, retrydelay, retrybackoff, startafter, startedon, singletonkey, singletonon, expirein, createdon, completedon, keepuntil, on_complete) VALUES ('eeef0a20-8197-11eb-815e-59df8a5d915a', '__pgboss__cron', 0, NULL, 'completed', 2, 0, 0, false, '2021-03-10 12:59:01.362534+01', '2021-03-10 13:54:09.619193+01', NULL, '2021-03-10 11:59:00', '00:15:00', '2021-03-10 12:58:31.362534+01', '2021-03-10 13:54:09.84339+01', '2021-03-10 13:00:01.362534+01', false);


--
-- Data for Name: schedule; Type: TABLE DATA; Schema: pgboss; Owner: kotahidev
--



--
-- Data for Name: version; Type: TABLE DATA; Schema: pgboss; Owner: kotahidev
--

INSERT INTO pgboss.version (version, maintained_on, cron_on) VALUES (16, '2021-03-10 12:48:18.764191+01', '2021-03-10 13:54:09.752088+01');


--
-- Data for Name: aliases; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: channel_members; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.channels (id, manuscript_id, created, updated, topic, type) VALUES ('fbb752f5-fb46-4ab6-9896-bcf34a384c92', '06ea851c-619c-453e-a12e-6568da11252c', '2021-03-10 12:48:02.828+01', '2021-03-10 12:48:02.828+01', 'Manuscript discussion', 'all');
INSERT INTO public.channels (id, manuscript_id, created, updated, topic, type) VALUES ('1e410fdb-9afe-4a6f-97b5-526e384d4df3', '06ea851c-619c-453e-a12e-6568da11252c', '2021-03-10 12:48:02.828+01', '2021-03-10 12:48:02.828+01', 'Editorial discussion', 'editorial');


--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.files (id, created, updated, label, file_type, filename, url, mime_type, size, type, manuscript_id, review_comment_id) VALUES ('81ffbef0-c77e-46dc-a86c-864f7f1f336c', '2021-03-10 12:48:21.069+01', '2021-03-10 12:48:21.069+01', NULL, 'supplementary', 'test-pdf.pdf', '/static/uploads/508239154500088a36827c250d0b83b7.pdf', 'application/pdf', 142400, 'file', '06ea851c-619c-453e-a12e-6568da11252c', NULL);


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: kotahidev
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('d341a633-cdce-4a7f-a9ad-5afc03cd0dd1', '027afa6a-edbc-486e-bb31-71e12f8ea1c5', '2020-07-21 16:17:24.741+02', '2020-07-21 16:17:25.87+02', 'orcid', '0000-0002-0564-2016', 'Emily Clay', NULL, '{"accessToken": "079a1165-31e5-4b59-9a99-d80ff7a21ebf", "refreshToken": "ccadc737-defc-419e-823b-a9f3673848ba"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('bcda196e-765a-42c8-94da-ca2e43b80f96', '3802b0e7-aadc-45de-9cf9-918fede99b97', '2020-07-21 16:30:45.721+02', '2020-07-21 16:33:26.742+02', 'orcid', '0000-0002-5641-5729', 'Sinead Sullivan', NULL, '{"accessToken": "ef1ed3ec-8371-41b2-a136-fd196ae52a72", "refreshToken": "6972dace-d9a6-4cd3-a2ad-ec7eb3e457c7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('4af83984-6359-47c5-a075-5ddfa9c555d9', '0da0bbec-9261-4706-b990-0c10aa3cc6b4', '2020-07-21 16:35:06.127+02', '2020-07-21 16:35:07.104+02', 'orcid', '0000-0002-7645-9921', 'Sherry Crofoot', NULL, '{"accessToken": "2ad4e130-0775-4e13-87fb-8e8f5a0570ae", "refreshToken": "159933d9-2020-4c02-bdfb-163af41017dc"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('acfa1777-0aec-4fe1-bc16-92bb9d19e884', '85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.384+02', '2020-07-21 16:35:39.358+02', 'orcid', '0000-0002-9429-4446', 'Elaine Barnes', NULL, '{"accessToken": "dcf07bc7-e59c-41b3-9ce0-924ac20aeeea", "refreshToken": "ae49d6a1-8e62-419d-8767-4a3ec22c1950"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('88c85115-d83c-42d7-a1a1-0139827977da', '40e3d054-9ac8-4c0f-84ed-e3c6307662cd', '2020-07-21 16:36:24.975+02', '2020-07-21 16:36:26.059+02', 'orcid', '0000-0001-5956-7341', 'Gale Davis', NULL, '{"accessToken": "3e9f6f6c-7cc0-4afa-9fdf-6ed377c36aad", "refreshToken": "80b1e911-df97-43f1-9f11-17b61913f6d7"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('049f91da-c84e-4b80-be2e-6e0cfca7a136', '231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.611+02', '2020-07-22 14:18:37.745+02', 'orcid', '0000-0003-2536-230X', 'Test Account', NULL, '{"accessToken": "eb551178-79e5-4189-8c5f-0a553092a9b5", "refreshToken": "4506fa5f-bd77-4867-afb4-0b07ea5302d6"}', true);
INSERT INTO public.identities (id, user_id, created, updated, type, identifier, name, aff, oauth, is_default) VALUES ('2fb8359c-239c-43fa-91f5-1ff2058272a6', '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', '2020-07-24 15:21:54.604+02', '2020-07-24 15:21:55.7+02', 'orcid', '0000-0003-1838-2441', 'Joanne Pilger', NULL, '{"accessToken": "842de329-ef16-4461-b83b-e8fe57238904", "refreshToken": "524fbdc5-9c67-4b4c-af17-2ce4cf294e88"}', true);


--
-- Data for Name: manuscripts; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.manuscripts (id, created, updated, parent_id, submitter_id, status, decision, authors, meta, submission, published, type) VALUES ('06ea851c-619c-453e-a12e-6568da11252c', '2021-03-10 12:48:02.815+01', '2021-03-10 13:54:11.478+01', NULL, '027afa6a-edbc-486e-bb31-71e12f8ea1c5', 'accepted', 'accepted', NULL, '{"title": "My URL submission"}', '{"irb": "yes", "name": "Emily Clay", "cover": "This is my cover letter", "links": [{"url": "https://doi.org/10.6084/m9.figshare.913521.v1"}, {"url": "https://github.com/jure/mathtype_to_mathml"}], "ethics": "This is my ethics statement", "contact": "emily@example.com", "methods": ["Functional MRI", "Optical Imaging"], "datacode": "This is my data and code availability statement", "humanMRI": "3T", "keywords": "some, keywords", "packages": ["SPM", "FSL"], "subjects": "patients", "suggested": "Erica James, Matthew Matretzky", "objectType": "software", "affiliation": "Example University, England", "otherMethods": "Erica James, Matthew Matretzky", "humanMRIother": "7T", "animal_research_approval": "yes"}', '2021-03-10 13:54:11.476+01', 'Manuscript');


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

INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('352a2a97-39b9-4554-bc90-24d236918756', '2021-03-10 12:48:37.862+01', '2021-03-10 12:48:37.862+01', '8a7a09b9-b744-4bc9-afd4-c481e403524c', NULL, '<p>Great paper, congratulations! Gale Davis</p>', 'review', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('cdc0e685-e4dd-4361-9762-6aac497af696', '2021-03-10 12:48:38.833+01', '2021-03-10 12:48:38.833+01', '8a7a09b9-b744-4bc9-afd4-c481e403524c', NULL, '<p>This is a very important paper. Gale Davis</p>', 'confidential', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('4cd30bfd-35d1-4713-a337-dcbec45da406', '2021-03-10 12:48:41.6+01', '2021-03-10 12:48:41.6+01', 'de9fc676-6fa9-41d3-98de-60030b9510e4', NULL, '<p>Great paper, congratulations! Sherry Crofoot</p>', 'review', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('75e7fdcf-72ec-462d-8f3e-0f714deee421', '2021-03-10 12:48:42.64+01', '2021-03-10 12:48:42.64+01', 'de9fc676-6fa9-41d3-98de-60030b9510e4', NULL, '<p>This is a very important paper. Sherry Crofoot</p>', 'confidential', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('d7759f61-fb6e-462e-b593-86f56f0c573d', '2021-03-10 12:48:45.395+01', '2021-03-10 12:48:45.395+01', 'bf04fdcb-0d1c-4321-9908-2c4a17fbb0dd', NULL, '<p>Great paper, congratulations! Elaine Barnes</p>', 'review', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('6be69e32-1656-433f-abea-cd5adbf621fb', '2021-03-10 12:48:46.411+01', '2021-03-10 12:48:46.411+01', 'bf04fdcb-0d1c-4321-9908-2c4a17fbb0dd', NULL, '<p>This is a very important paper. Elaine Barnes</p>', 'confidential', 'ReviewComment');
INSERT INTO public.review_comments (id, created, updated, review_id, user_id, content, comment_type, type) VALUES ('029db44c-0777-47d0-8adf-3c1ebe155df8', '2021-03-10 12:58:30.843+01', '2021-03-10 12:58:30.843+01', '13ff518f-2ffe-4800-aedc-dd2e2ba62069', NULL, '<p>Great paper, dear authors, congratulations!</p>', 'decision', 'ReviewComment');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('8a7a09b9-b744-4bc9-afd4-c481e403524c', '2021-03-10 12:48:36.506+01', '2021-03-10 12:48:38.838+01', 'accepted', false, '40e3d054-9ac8-4c0f-84ed-e3c6307662cd', '06ea851c-619c-453e-a12e-6568da11252c', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('de9fc676-6fa9-41d3-98de-60030b9510e4', '2021-03-10 12:48:40.188+01', '2021-03-10 12:48:42.636+01', 'accepted', false, '0da0bbec-9261-4706-b990-0c10aa3cc6b4', '06ea851c-619c-453e-a12e-6568da11252c', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('bf04fdcb-0d1c-4321-9908-2c4a17fbb0dd', '2021-03-10 12:48:44.015+01', '2021-03-10 12:48:46.41+01', 'accepted', false, '85e1300e-003c-4e96-987b-23812f902477', '06ea851c-619c-453e-a12e-6568da11252c', 'Review');
INSERT INTO public.reviews (id, created, updated, recommendation, is_decision, user_id, manuscript_id, type) VALUES ('13ff518f-2ffe-4800-aedc-dd2e2ba62069', '2021-03-10 12:58:30.518+01', '2021-03-10 12:58:30.518+01', 'accepted', true, '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', '06ea851c-619c-453e-a12e-6568da11252c', 'Review');


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('df69d471-bead-42b6-a8b5-d1bff0a36040', '2021-03-10 12:48:02.832+01', '2021-03-10 12:48:02.832+01', NULL, 'dccbd509-505f-4ad6-8ceb-8a42b62c917b', '027afa6a-edbc-486e-bb31-71e12f8ea1c5', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('88b45daf-2a54-4bf2-b30d-a8ec04e492c1', '2021-03-10 12:48:31.351+01', '2021-03-10 12:48:31.351+01', NULL, '9dcae384-76c8-416b-9da2-5ca7eaedc59c', '1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('6298c397-dc09-4a80-a7fa-da8cdb1f241d', '2021-03-10 12:48:34.248+01', '2021-03-10 12:48:39.038+01', 'completed', 'e045f242-e85e-4807-85ce-9b6a0095dd56', '40e3d054-9ac8-4c0f-84ed-e3c6307662cd', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('a2c4ed1d-ca05-4f3b-b314-eecdcd6a7e3b', '2021-03-10 12:48:34.664+01', '2021-03-10 12:48:42.847+01', 'completed', 'e045f242-e85e-4807-85ce-9b6a0095dd56', '0da0bbec-9261-4706-b990-0c10aa3cc6b4', NULL);
INSERT INTO public.team_members (id, created, updated, status, team_id, user_id, alias_id) VALUES ('5a495eac-2b5b-41cb-b619-d4f2732cd5a0', '2021-03-10 12:48:35.069+01', '2021-03-10 12:48:46.605+01', 'completed', 'e045f242-e85e-4807-85ce-9b6a0095dd56', '85e1300e-003c-4e96-987b-23812f902477', NULL);


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.teams (id, created, updated, name, role, members, owners, global, type, manuscript_id) VALUES ('dccbd509-505f-4ad6-8ceb-8a42b62c917b', '2021-03-10 12:48:02.828+01', '2021-03-10 12:48:02.828+01', 'Author', 'author', NULL, NULL, NULL, 'team', '06ea851c-619c-453e-a12e-6568da11252c');
INSERT INTO public.teams (id, created, updated, name, role, members, owners, global, type, manuscript_id) VALUES ('9dcae384-76c8-416b-9da2-5ca7eaedc59c', '2021-03-10 12:48:31.342+01', '2021-03-10 12:48:31.342+01', 'Senior Editor', 'seniorEditor', NULL, NULL, NULL, 'team', '06ea851c-619c-453e-a12e-6568da11252c');
INSERT INTO public.teams (id, created, updated, name, role, members, owners, global, type, manuscript_id) VALUES ('e045f242-e85e-4807-85ce-9b6a0095dd56', '2021-03-10 12:48:34.246+01', '2021-03-10 12:48:34.246+01', 'Reviewers', 'reviewer', NULL, NULL, NULL, 'team', '06ea851c-619c-453e-a12e-6568da11252c');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: kotahidev
--

INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.597+02', '2020-07-24 16:43:54.939+02', NULL, NULL, '000000032536230X', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser5.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('027afa6a-edbc-486e-bb31-71e12f8ea1c5', '2020-07-21 16:17:24.734+02', '2021-03-10 12:48:29.621+01', NULL, NULL, '0000000205642016', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser2.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('3802b0e7-aadc-45de-9cf9-918fede99b97', '2020-07-21 16:30:45.719+02', '2021-03-10 12:48:31.456+01', true, NULL, '0000000256415729', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser6.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('40e3d054-9ac8-4c0f-84ed-e3c6307662cd', '2020-07-21 16:36:24.973+02', '2021-03-10 12:48:39.636+01', NULL, NULL, '0000000159567341', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser4.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('0da0bbec-9261-4706-b990-0c10aa3cc6b4', '2020-07-21 16:35:06.125+02', '2021-03-10 12:48:43.459+01', NULL, NULL, '0000000276459921', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser7.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 16:35:38.381+02', '2021-03-10 12:48:47.29+01', NULL, NULL, '0000000294294446', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser1.jpg', false, NULL);
INSERT INTO public.users (id, created, updated, admin, email, username, password_hash, teams, password_reset_token, password_reset_timestamp, type, profile_picture, online, last_online) VALUES ('1d599f2c-d293-4d5e-b6c1-ba34e81e3fc8', '2020-07-24 15:21:54.59+02', '2021-03-10 13:54:13.376+01', NULL, NULL, '0000000318382441', NULL, NULL, NULL, NULL, 'user', '/static/profiles/testuser3.jpg', true, NULL);


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: kotahidev
--

ALTER TABLE ONLY pgboss.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: kotahidev
--

ALTER TABLE ONLY pgboss.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (name);


--
-- Name: version version_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: kotahidev
--

ALTER TABLE ONLY pgboss.version
    ADD CONSTRAINT version_pkey PRIMARY KEY (version);


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
-- Name: archive_archivedon_idx; Type: INDEX; Schema: pgboss; Owner: kotahidev
--

CREATE INDEX archive_archivedon_idx ON pgboss.archive USING btree (archivedon);


--
-- Name: archive_id_idx; Type: INDEX; Schema: pgboss; Owner: kotahidev
--

CREATE INDEX archive_id_idx ON pgboss.archive USING btree (id);


--
-- Name: job_name; Type: INDEX; Schema: pgboss; Owner: kotahidev
--

CREATE INDEX job_name ON pgboss.job USING btree (name text_pattern_ops);


--
-- Name: job_singletonkey; Type: INDEX; Schema: pgboss; Owner: kotahidev
--

CREATE UNIQUE INDEX job_singletonkey ON pgboss.job USING btree (name, singletonkey) WHERE ((state < 'completed'::pgboss.job_state) AND (singletonon IS NULL));


--
-- Name: job_singletonkeyon; Type: INDEX; Schema: pgboss; Owner: kotahidev
--

CREATE UNIQUE INDEX job_singletonkeyon ON pgboss.job USING btree (name, singletonon, singletonkey) WHERE (state < 'expired'::pgboss.job_state);


--
-- Name: job_singletonon; Type: INDEX; Schema: pgboss; Owner: kotahidev
--

CREATE UNIQUE INDEX job_singletonon ON pgboss.job USING btree (name, singletonon) WHERE ((state < 'expired'::pgboss.job_state) AND (singletonkey IS NULL));


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

CREATE INDEX teams_manuscript_id_idx ON public.teams USING btree (manuscript_id);


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
-- Name: files files_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


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
-- Name: teams teams_manuscript_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kotahidev
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

